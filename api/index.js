import { HfInference } from "@huggingface/inference";
import axios from "axios";
import cosineSimilarity from "compute-cosine-similarity";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Outfit from "./models/outfit.js";
import Savedoutfit from "./models/savedoutfit.js";
import User from "./models/user.js";
dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = "";

app.use(cors());
app.use(express.json());

const hf = new HfInference("");

mongoose
  .connect("")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

app.post("/register", async (req, res) => {
  try {
    const { email, password, username, gender, profileImage } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const user = new User({
      email,
      password,
      username,
      gender,
      profileImage,
      outfits: [],
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/save-outfit", authenticateToken, async (req, res) => {
  try {
    const { date, items, caption, occasion, visibility, isOotd } = req.body;
    const userId = req.user.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const itemsWithImages = items?.map((item) => {
      if (!item || typeof item !== "object") {
        console.warn("Invalid item skipped", item);
        return null;
      }
      let imageUrl = item?.image;
      if (!imageUrl || !imageUrl.match(/^https?:\/\/res\.cloudinary\.com/)) {
        console.warn("Invalid or non-Cloudinary image URL:", imageUrl);
        return null; // Skip invalid URLs
      }
      return {
        id: item.id !== undefined || "null",
        type: item.type || "Unknown",
        image: imageUrl,
        x: item.x !== undefined ? item?.x : 0,
        y: item.y !== undefined ? item?.y : 0,
      };
    });

    const validItems = itemsWithImages.filter((item) => item !== null);
    if (validItems.length == 0) {
      return res.status(400).json({ error: "No valid items provided" });
    }

    const newOutfit = new Savedoutfit({
      userId: user._id,
      date,
      items: validItems,
      caption: caption || "",
      occasion: occasion || "",
      visibility: visibility || "Everyone",
      isOotd: isOotd || false,
    });

    await newOutfit.save();

    user.outfits.push(newOutfit._id);
    await user.save();

    res.status(201).json({ outfit: newOutfit });
  } catch (err) {
    console.log("Error in save-outfit", err.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.get("/save-outfit/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const user = await User.findById(userId).populate("outfits");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.outfits);
  } catch (error) {
    console.error("Error fetching outfits", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: req.body.messages,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error calling OpenAI");
  }
});

const generateEmbedding = async (text) => {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return response;
};

const seedData = async () => {
  try {
    const count = await Outfit.countDocuments();
    if (count === 0) {
      const outfits = [
        {
          occasion: "date",
          style: "casual",
          items: ["White linen shirt", "Dark jeans", "Loafers"],
          image:
            "https://i.pinimg.com/736x/b2/6e/c7/b26ec7bc30ca9459b918ae8f7bf66305.jpg",
        },
        {
          occasion: "date",
          style: "elegant",
          items: ["White flared pants", "sandals", "sunglasses"],
          image:
            "https://i.pinimg.com/736x/8c/61/12/8c6112457ae46fa1e0aea8b8f5ed18ec.jpg",
        },
        {
          occasion: "coffee",
          style: "casual",
          items: [
            "cropped t-shirt",
            "wide-leg beige trousers",
            "Samba sneakers",
          ],
          image:
            "https://i.pinimg.com/736x/d7/2d/26/d72d268ca4ff150db1db560b25afb843.jpg",
        },
        {
          occasion: "interview",
          style: "formal",
          items: ["Light blue shirt", "wide-leg jeans", "Silver wristwatch"],
          image:
            "https://i.pinimg.com/736x/1c/50/bc/1c50bcef1b46efe5db4008252ea8cfa5.jpg",
        },
        {
          occasion: "beach",
          style: "beach",
          items: ["brown T shirt", "beige shorts", "Sunglasses"],
          image:
            "https://i.pinimg.com/1200x/86/57/59/8657592bd659335ffd081fdab10b87a4.jpg",
        },
      ];

      for (const outfit of outfits) {
        const text = `${outfit.occasion} ${outfit.style} ${outfit.items.join(", ")}`;
        const embedding = await generateEmbedding(text);
        await new Outfit({ ...outfit, embedding }).save();
      }
      console.log("✅ Database seeded with", outfits.length, "outfits");
    } else {
      console.log("✅ Database already has", count, "outfits");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
};

seedData();

const normalizeQuery = (query) => {
  const synonyms = {
    "coffee date": "coffee date",
    "dinner date": "date",
    "job interview": "interview",
    work: "interview",
    casual: "casual",
    formal: "formal",
    outfit: "",
    "give me": "",
    a: "",
    an: "",
    for: "",
  };

  let normalized = query.toLowerCase();
  Object.keys(synonyms).forEach((key) => {
    normalized = normalized.replace(
      new RegExp(`\\b${key}\\b`, "gi"),
      synonyms[key]
    );
  });
  return [...new Set(normalized.trim().split(/\s+/).filter(Boolean))].join(" ");
};

app.get("/smart-search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }
  try {
    const normalizedQuery = normalizeQuery(query);
    const queryEmbedding = await generateEmbedding(normalizedQuery);
    const outfits = await Outfit.find();

    const MIN_SIMILARITY = query.length > 20 ? 0.3 : 0.4;

    let scored = outfits
      .map((o) => {
        const score = cosineSimilarity(queryEmbedding, o.embedding);
        return { ...o.toObject(), score };
      })
      .filter((o) => o.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score);

    if (scored.length == 0) {
      const queryItems = normalizedQuery.split(" ");
      scored = outfits
        .filter((o) =>
          queryItems.some(
            (term) =>
              o.occasion.toLowerCase().includes(term) ||
              o.style.toLowerCase().includes(term) ||
              o.items.some((item) => item.toLowerCase().includes(term))
          )
        )
        .map((o) => ({ ...o.toObject(), score: 0.1 }));
    }
    res.json(scored.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});
