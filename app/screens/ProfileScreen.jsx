import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "../../store/auth";
import { mpants, mshirts, pants, shoes, skirts, tops } from "../images";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Clothes");
  const [activeCategory, setActiveCategory] = useState("All");
  const { logout, user, token } = useAuthStore();
  const [outfits, setOutfits] = useState([]);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const username = user?.username || "";
  const email = user?.email || "";
  const followersCount = user?.followers?.length || 0;
  const followingCount = user?.following?.length || 0;
  const profileImage = user?.profileImage || "";

  const [imageloading, setImageLoading] = useState(true);

  const popularClothes = [
    ...pants,
    ...tops,
    ...skirts,
    ...mpants,
    ...mshirts,
    ...shoes,
  ].filter((item) => item.image);

  const filteredClothes =
    activeCategory == "All"
      ? popularClothes
      : popularClothes.filter((item) => {
          switch (activeCategory) {
            case "Tops":
              return item.type == "shirt";
            case "Bottoms":
              return item.type == "pants" || item.type == "skirts";
            case "Shoes":
              return item.type == "shoes";
            default:
              return true;
          }
        });

  const sortItems = (items) => {
    const order = ["shirt", "pants", "skirts", "shoes"];
    return items.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  };

  useEffect(() => {
    const fetchOutfits = async () => {
      if (!user._id || !token) {
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/save-outfit/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOutfits(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOutfits();
  }, [user?._id, token]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Text className="text-2xl font-bold">{user && user.username}</Text>
          <View className="flex-row gap-3">
            <Ionicons name="calendar-outline" color={"black"} size={24} />
            <Ionicons name="pie-chart-outline" color={"black"} size={24} />
            <Ionicons name="menu-outline" color={"black"} size={24} />
          </View>
        </View>
        <View className="flex-row items-center px-4 mt-4">
          <TouchableOpacity className="relative">
            <Image
              className="w-20 h-20 rounded-full"
              source={{ uri: user?.profileImage }}
            />
            <View className="absolute bottom-0 right-0 bg-black rounded-full w-6 h-6 items-center justify-center">
              <MaterialIcons name="add" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-lg font-semibold">{username}</Text>
            <Text className="text-sm text-gray-500">{email}</Text>
            <View className="flex-row mt-1 gap-2">
              <Text className="text-gray-600">
                <Text className="font-bold">{followersCount}</Text> Followers
              </Text>
              <Text className="text-gray-600">
                <Text className="font-bold">{followingCount}</Text> Following
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row px-4 mt-4 gap-3">
          <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg py-2 items-center">
            <Text className="font-medium">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg py-2 items-center">
            <Text className="font-medium">Share Profile</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-around mt-5 border-b border-gray-300">
          {["Clothes", "Outfits", "Collections"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="pb-2"
            >
              <Text
                className={`text-base font-medium ${
                  activeTab == tab ? "text-black" : "text-gray-400"
                }`}
              >
                {tab}
              </Text>
              {activeTab === tab && <View className="h-0.5 bg-black mt-2" />}
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 pl-4"
        >
          {["All", "Tops", "Bottoms", "Shoes", "Outerwear"].map((cat) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(cat)}
              key={cat}
              className={`px-3 mr-4 rounded-full ${
                activeCategory == cat ? "text-black" : "text-gray-400"
              }`}
            >
              <Text
                className={`text-base font-medium ${
                  activeCategory == cat ? "text-black" : "text-gray-400"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {activeTab == "Clothes" && (
          <View className="px-4">
            {filteredClothes.length == 0 ? (
              <Text>No Clothes available in this category</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {filteredClothes?.map((item, idx) => (
                  <View key={idx} className="w-1/3 p-1.5">
                    <View
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <Image
                        className="w-full h-32"
                        source={{ uri: item?.image }}
                        resizeMode="contain"
                      />
                      <View className="p-2">
                        <Text className="text-xs font-medium text-gray-600 capitalize">
                          {item?.type} ({item?.gender})
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {activeTab == "Outfits" && (
          <View>
            {loading ? (
              <ActivityIndicator size={"large"} color="#000" />
            ) : outfits.length === 0 ? (
              <Text>No Outifits saved</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {outfits?.map((outfit, idx) => (
                  <View key={idx} className="w-1/2 p-1.5">
                    <View
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {sortItems(outfit.items).map((item, index) => (
                        <Image
                          key={`${outfit._id}-${item.id}-${index}`}
                          source={{ uri: item.image }}
                          className="w-full h-36"
                          resizeMode="contain"
                          style={{ marginVertical: -20 }}
                        />
                      ))}
                      <View className="p-3 mt-1">
                        <Text className="text-sm font-semibold text-gray-800">
                          {outfit?.date}
                        </Text>
                        <Text className="text-xs font-medium text-gray-600">
                          {outfit.occasion}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                          {outfit.items.map((item) => item.type).join(", ")}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
