import { router } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { getUserAccountAPI } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import Toast from "react-native-toast-message";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootPage = () => {
    const { setUser } = useApp();

    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load fonts, make any API calls you need to do here
                const res = await getUserAccountAPI();
                if (res.data) {
                    //success
                    setUser({
                        ...res.data,
                        access_token: await AsyncStorage.getItem(
                            "access_token"
                        ),
                    });
                    router.replace("/(tabs)");
                } else {
                    //error
                    router.replace("/(auth)/login");
                }
            } catch (e) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Không thể kết tới API Backend...",
                    position: "bottom",
                });
            } finally {
                // Tell the application to render
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    return <></>;
};

export default RootPage;
