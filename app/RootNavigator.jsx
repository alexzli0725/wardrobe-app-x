import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import useAuthStore from "../store/auth";
import TabNavigator from "./TabNavigator";
import AIAssistant from "./screens/AIAssistant";
import AIOutfitmaker from "./screens/AIOutfitmaker";
import AddOutfitScreen from "./screens/AddOutfitScreen";
import DesignRoomScreen from "./screens/DesignRoomScreen";
import NewOutfitScreen from "./screens/NewOutfitScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";

const RootNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  console.log("data", isAuthenticated);
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  console.log(isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="AddOutfit" component={AddOutfitScreen} />
          <Stack.Screen name="DesignRoom" component={DesignRoomScreen} />
          <Stack.Screen name="NewOutfit" component={NewOutfitScreen} />
          <Stack.Screen name="AIChat" component={AIAssistant} />
          <Stack.Screen name="AIOutfit" component={AIOutfitmaker} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
