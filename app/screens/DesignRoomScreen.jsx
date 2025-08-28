import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const DraggableClothingItem = ({ item }) => {
  const translateX = useSharedValue(item?.x ?? 0);
  const translateY = useSharedValue(item?.y ?? 0);

  const startX = useSharedValue(item?.x ?? 0);
  const startY = useSharedValue(item?.y ?? 0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      item.x = translateX.value;
      item.y = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    position: "absolute",
    zIndex: item.type === "shirt" || item.type === "skirts" ? 20 : 10,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.Image
        resizeMode="contain"
        style={[
          { width: 240, height: item?.type === "shoes" ? 180 : 240 },
          animatedStyle,
        ]}
        source={{ uri: item?.image }}
      />
    </GestureDetector>
  );
};

const { width, height } = Dimensions.get("window");

const DesignRoomScreen = () => {
  const route = useRoute();
  const { selectedItems, date, savedOutfits } = route.params;
  const [clothes, setClothes] = useState([]);
  useEffect(() => {
    const initialClothes = selectedItems.map((item) => {
      const xPosition = width / 2 - 120;
      let yPosition;
      const shirtItem = selectedItems.find((i) => i.type === "shirt");
      const pantsItem = selectedItems.find((i) => i.type == "pants");
      const shoesItems = selectedItems.find((i) => i.type == "shoes");

      if (item.type === "shirt" || item.type === "skirts") {
        yPosition = height / 2 - 240 - 100;
      } else if (item.type === "pants") {
        yPosition = shirtItem ? height / 2 - 100 : height / 2;
      } else if (item.type === "shoes") {
        yPosition = pantsItem || shirtItem ? height / 2 + 100 : height / 2 + 60;
      } else {
        yPosition = height / 2; // Default
      }

      return { ...item, x: xPosition, y: yPosition };
    });
    setClothes(initialClothes);
  }, [selectedItems]);

  const navigation = useNavigation();

  return (
    // <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-white text-lg">{date}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("NewOutfit", {
              selectedItems,
              date,
              savedOutfits,
            })
          }
          className="bg-gray-700 p-2 rounded"
        >
          <Text className="text-white">next</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1">
        {clothes?.map((item) => (
          <DraggableClothingItem key={item.id} item={item} />
        ))}
      </View>
      <View className="flex-row justify-between p-4">
        <TouchableOpacity className="bg-gray-700 p-2 rounded">
          <Text className="text-white">Add Clothes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-700 p-2 rounded">
          <Text className="text-white">Stickers</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-700 p-2 rounded">
          <Text className="text-white">Background</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    // </GestureHandlerRootView>
  );
};

export default DesignRoomScreen;
