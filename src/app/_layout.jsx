import { theme } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
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
                <StatusBar
                    backgroundColor={theme.colors.statusBar}
                    barStyle="light-content"
                />
                <Toast />
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="+not-found" />

                    <Stack.Screen
                        name="(main)/match"
                        options={{
                            headerShown: true,
                            title: "Fixture",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />

                    <Stack.Screen
                        name="(main)/result"
                        options={{
                            headerShown: true,
                            title: "Result",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />

                    <Stack.Screen
                        name="(main)/leagueTable"
                        options={{
                            headerShown: true,
                            title: "Table",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />

                    <Stack.Screen
                        name="(main)/player/[playerId]"
                        options={{
                            title: "Player Detail",
                            headerShown: false,
                        }}
                    />

                    <Stack.Screen
                        name="(main)/matchDetail"
                        options={{
                            headerShown: true,
                            title: "Match Detail",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />
                    {/* <Stack.Screen
                        name="(tab)/club"
                        options={{
                            headerShown: false,
                            title: "Club Detail",
                            headerStyle: { backgroundColor: theme.colors.primary },
                            headerTintColor: "white",
                        }}
                    /> */}
                    <Stack.Screen
                        name="(main)/homeNewsDetail"
                        options={{
                            headerShown: true,
                            title: "News Detail",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />
                    <Stack.Screen
                        name="(main)/newsDetail"
                        options={{
                            headerShown: true,
                            title: "News Detail",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />

                    <Stack.Screen
                        name="(main)/battleDetail"
                        options={{
                            headerShown: true,
                            title: "Battle Detail",
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: "white",
                        }}
                    />
                </Stack>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
