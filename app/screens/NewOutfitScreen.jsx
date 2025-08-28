import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NewOutfitScreen = () => {
  const route = useRoute();
  const { selectedItems, date, savedOutfits } = route.params;

  const navigation = useNavigation();

  const [caption, setCaption] = useState("");
  const [isOotd, setisOotd] = useState(false);
  const [occasion, setOccasion] = useState("Work");
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState("Everyone");
  const [userId, setUserId] = useState(null);

  const BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.id);
        } else {
          Alert.alert("Error", "No authentication token found");
        }
      } catch (error) {
        console.log("Failed to fetch token", err);
        Alert.alert("Error", error);
      }
    };
    fetchToken();
  }, []);
  const converttToBase64 = async (image) => {
    return image;
  };
  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
    setLoading(true);
    try {
      const validateItems = await Promise.all(
        selectedItems.map(async (item) => {
          const base64Image = await converttToBase64(item?.image);
          return {
            id: item.id,
            type: item?.type || "Unknown",
            image: base64Image,
            x: item.x || 0,
            y: item.y || 0,
          };
        })
      );

      const validItems = validateItems.filter((item) => item !== null);
      if (validItems.length === 0) {
        throw new Error("No valid items to save");
      }
      const outfitData = {
        userId,
        date,
        items: validItems,
        caption,
        occasion,
        visibility,
        isOotd,
      };
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(`${BASE_URL}/save-outfit`, outfitData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedOutfits = {
        ...savedOutfits,
        [date]: response.data.outfit.items,
      };
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Tabs",
            params: {
              screen: "Home",
              params: { savedOutfits: updatedOutfits },
            },
          },
        ],
      });
    } catch (error) {
      console.log("Save error", error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-black">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">New Outfit</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {selectedItems
          ?.sort((a, b) => {
            const order = { shirt: 1, skirts: 2, pants: 3, shoes: 4 };
            return (order[a.type] || 5) - (order[b.type] || 5);
          })
          .map((item, idx) => (
            <Image
              resizeMode="contain"
              key={idx}
              style={{
                width: 240,
                height: item?.type === "shoes" ? 180 : 240,
                marginBottom: idx < selectedItems.length - 1 ? -60 : 0,
              }}
              source={{ uri: item?.image }}
            />
          ))}
      </View>
      <View className="p-4">
        <TextInput
          className="border-b border-gray-300 pb-2 text-gray-500"
          placeholder="Add acaption..."
          value={caption}
          onChangeText={setCaption}
        />
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500">Date</Text>
            <Text className="text-black">{date || "Today"}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-gray-500">Add to OOTD story</Text>
            <Switch value={isOotd} onValueChange={setisOotd} />
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-gray-500">Ocassion</Text>
            <Text className="text-black">{occasion}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-gray-500">Visibility</Text>
            <Text className="text-black">{visibility}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleSave}
        className="bg-black py-3 mx-4 mb-4 rounded"
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Save Outfit
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NewOutfitScreen;
