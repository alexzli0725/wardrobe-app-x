import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, TouchableOpacity, View } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#d3d3d3",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 70,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={View}
        options={{
          tabBarIcon: ({}) => (
            <View className="w-12 h-12 rounded-full bg-black items-center justify-center">
              <Text className="text-white text-[28px] leading-[28px]">+</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              className="items-center justify-center"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
