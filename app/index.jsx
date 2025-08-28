import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import RootNavigator from "./RootNavigator";

const index = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
};

export default index;
