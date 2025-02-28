import { theme } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const _layout = () => {
    return (
        <AppProvider>
            <RootLayout />
        </AppProvider>
    );
};

export default _layout;

function RootLayout() {
    return (
        <GestureHandlerRootView>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar
                    backgroundColor={theme.colors.statusBar}
                    barStyle="light-content"
                />
                <Toast />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
