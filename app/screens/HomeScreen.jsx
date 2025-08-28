import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "../../store/auth";
import first from "./1.jpg";
import second from "./2.jpg";
import third from "./3.jpg";

const { width, height } = Dimensions.get("window");
const features = [
  {
    title: "AI Suggestions",
    image:
      "https://i.pinimg.com/736x/2e/3d/d1/2e3dd14ac81b207ee6d86bc99ef576eb.jpg",
    screen: "AIChat",
  },
  {
    title: "AI Outfit Maker",
    image:
      "https://i.pinimg.com/736x/50/83/0e/50830e372ee844c1f429b8ef89e26fd1.jpg",
    screen: "AIOutfit",
  },
  {
    title: "AI Try On",
    image:
      "https://i.pinimg.com/736x/c2/78/95/c2789530a2dc8c9dbfd4aa5e2e70d608.jpg",
    screen: "AITryOn",
  },
  {
    title: "Color Analysis",
    image:
      "https://i.pinimg.com/736x/84/bf/ce/84bfce1e46977d50631c4ef2f72f83b1.jpg",
    screen: "ColorAnalysis",
  },
];

const popularItems = [
  {
    username: "Trisha Wushres",
    profile: first,
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753859289/skirt3_oanqxj.png",
    itemName: "Floral Skirt",
  },
  {
    username: "Anna Cris",
    profile: second,
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753975629/Untitled_design_3_syip4x.png",
    itemName: "Mens Jeans",
  },
  {
    username: "Isabella",
    profile: third,
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753975802/Untitled_design_11_p7t2us.png",
    itemName: "Shoes",
  },
];

const initialStories = [
  {
    username: "Your OOTD",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/4/48/Male_Blue.png",
    isOwn: true,
    viewed: false,
  },
  {
    username: "_trishwushres",
    avatar:
      "https://redyellowblue.org/wp-content/uploads/2017/07/venus-symbol.png",
    isOwn: false,
    viewed: false,
  },
  {
    username: "myglam",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/4/48/Male_Blue.png",
    isOwn: false,
    viewed: false,
  },
  {
    username: "stylist",
    avatar:
      "https://redyellowblue.org/wp-content/uploads/2017/07/venus-symbol.png",
    isOwn: false,
    viewed: false,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [stories, setStories] = useState(initialStories);
  const [showStory, setShowStory] = useState(false);
  const [currectStory, setCurrectStory] = useState(null);
  const { user, logout } = useAuthStore();
  const isFocused = useIsFocused();

  const generateDates = () => {
    const today = moment().startOf("day");
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push({
        label: today.clone().add(i, "days").format("ddd, Do MMM"),
        outfit: i === 1,
      });
    }
    return dates;
  };
  const dates = generateDates();
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.id);
        }
      } catch (error) {
        console.log("Failed to fetch token", error);
      }
    };
    const fetchSavedOutfits = async () => {
      if (!userId) {
        console.log("Skipping: userId is not available");
        return;
      }
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.get(
          `http://localhost:3000/save-outfit/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const outfits = response.data.reduce((acc, outfit) => {
          acc[outfit.date] = outfit.items;
          return acc;
        }, {});
        setSavedOutfits(outfits);
      } catch (error) {
        console.log("failed to fetch saved outfits", error);
      }
    };

    if (isFocused) {
      fetchToken().then(() => {
        if (userId) {
          fetchSavedOutfits();
        }
      });
    }

    const unsubscribe = navigation.addListener("focus", () => {
      const state = navigation.getState();
      const params = state?.routes[state.index]?.params;
      if (params?.savedOutfits) {
        setSavedOutfits((prev) => ({ ...prev, ...params.savedOutfits }));
      }
    });

    return unsubscribe;
  }, [isFocused, navigation, userId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="text-3xl font-bold">Fits</Text>
          <View className="flex-row items-center gap-3">
            <Text>{user && user.username}</Text>
            <TouchableOpacity className="bg-black px-4 py-1 rounded-full">
              <Text className="text-white font-semibold text-sm">Upgrade</Text>
            </TouchableOpacity>
            <Ionicons name="notifications-outline" color={"black"} size={24} />
            <Ionicons name="search-outline" color={"black"} size={24} />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-4"
        >
          {stories?.map((story, index) => (
            <Pressable key={index} className="mr-4 items-center">
              <View
                className={`w-16 h-16 rounded-full items-center justify-center relative ${
                  story.viewed
                    ? "border-2 border-gray-200"
                    : "border-2 border-purple-400"
                }`}
              >
                <Image
                  className="w-16 h-16 rounded-full"
                  source={{ uri: story?.avatar }}
                />
                {story?.isOwn && (
                  <View className="absolute bottom-0 right-0 bg-black rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs">+</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs mt-1">{story?.username}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View className="flex-row items-center justify-between mt-6 px-4">
          <Text className="text-lg font-semibold">Your Week</Text>
          <Text className="text-gray-500">Planner</Text>
        </View>
        <ScrollView
          className="mt-4"
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {dates?.map((date, idx) => {
            const today = moment().format("ddd, Do MMM");
            const outfit =
              savedOutfits[date.label] ||
              (date.label == today && savedOutfits[today]
                ? savedOutfits[today]
                : null);
            return (
              <View key={idx} className="mx-3">
                <Pressable
                  onPress={() => {
                    navigation.navigate("AddOutfit", {
                      date: date.label,
                      savedOutfits,
                    });
                  }}
                  className={`w-24 h-40 rounded-xl items-center justify-center overflow-hidden shadow-md ${outfit ? "bg-white" : "bg-gray-50"}`}
                >
                  {!outfit && (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="text-3xl text-gray-400">+</Text>
                    </View>
                  )}
                  {outfit && (
                    <View>
                      {outfit.find((item) => item.type === "shirt") && (
                        <Image
                          source={{
                            uri: outfit.find((item) => item.type === "shirt")
                              ?.image,
                          }}
                          className="w-20 h-20"
                          resizeMode="contain"
                          style={{ maxWidth: "100%", maxHeight: "50%" }}
                        />
                      )}
                      {outfit.find(
                        (item) =>
                          item.type === "pants" || item.type === "skirts"
                      ) && (
                        <Image
                          source={{
                            uri: outfit.find(
                              (item) =>
                                item.type === "pants" || item.type === "skirts"
                            )?.image,
                          }}
                          className="w-20 h-20"
                          resizeMode="contain"
                          style={{ maxWidth: "100%", maxHeight: "50%" }}
                        />
                      )}
                    </View>
                  )}
                </Pressable>
                <Text className="text-xs text-center mt-1 text-gray-700">
                  {date.label}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        <View className="flex-row flex-wrap justify-between px-4 mt-6">
          {features.map((feature, idx) => (
            <Pressable
              onPress={() => navigation.navigate(feature.screen)}
              style={{
                backgroundColor: ["#fff1f2", "#eff6ff", "#f0fff4", "#fffbeb"][
                  idx % 4
                ],
                elevation: 3,
              }}
              key={idx}
              className="w-[48%] h-36 mb-4 rounded-2xl shadow-md overflow-hidden"
            >
              <View className="p-3">
                <Text className="font-bold text-[16px] text-gray-800">
                  {feature.title}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {idx === 0
                    ? "Try Outfits Virtually"
                    : idx == 1
                      ? "AI created new looks"
                      : idx === 2
                        ? "Instant try on"
                        : "Find best colors"}
                </Text>
              </View>
              <Image
                style={{ transform: [{ rotate: "12deg" }], opacity: 0.9 }}
                className="w-20 h-20 absolute bottom-[-3] right-[-1] rounded-lg"
                source={{ uri: feature?.image }}
              />
            </Pressable>
          ))}
        </View>
        <View className="flex-row items-center justify-between mt-6 px-4">
          <Text className="text-lg font-semibold">Popular this week</Text>
          <Text className="text-gray-500">More</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-4"
        >
          {popularItems.map((item, idx) => {
            return (
              <View className="w-36 mr-4" key={idx}>
                {/* <Image
                  className="w-36 h-44 rounded-lg"
                  source={{ uri: item?.image }}
                /> */}
                <Image
                  className="w-36 h-44 rounded-lg"
                  source={{ uri: item?.image }}
                />

                <View className="flex-row items-center mt-2">
                  <Image
                    className="w-6 h-6 rounded-full mr-2"
                    source={item?.profile}
                  />
                  <Text className="text-xs font-medium">{item.username}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  {item.itemName}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
