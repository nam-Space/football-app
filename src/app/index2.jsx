import { router } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import { getUserAccountAPI } from "@/utils/api";
import { useApp } from "@/context/AppContext";
import Toast from "react-native-toast-message";

// Giữ màn hình splash cho đến khi dữ liệu sẵn sàng
SplashScreen.preventAutoHideAsync();

const RootPage = () => {
    const { setUser } = useApp();

    useEffect(() => {
        async function prepare() {
            try {
                // Gọi API để lấy thông tin người dùng
                const res = await getUserAccountAPI();
                if (res.data) {
                    setUser({
                        user: res.data.user,
                        access_token: await AsyncStorage.getItem("access_token"),
                    });
                    router.replace("/(tabs)"); // Điều hướng đến màn hình chính
                } else {
                    router.replace("/(tabs)/club"); // Nếu API lỗi, điều hướng tới trang Club
                }
            } catch (e) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Không thể kết nối tới API Backend...",
                    position: "bottom",
                });

                // Nếu có lỗi, vẫn chuyển hướng tới trang Club
                router.replace("/(tabs)/club");
            } finally {
                // Ẩn màn hình splash
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    return null; // Không cần hiển thị gì cả, vì chúng ta đã điều hướng
};

export default RootPage;
