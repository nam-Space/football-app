import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect } from "react";
import Toast from "react-native-toast-message";

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Load user từ AsyncStorage khi app mở
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) setUser(JSON.parse(storedUser));
        };
        loadUser();
    }, []);

    useEffect(() => {
        // Mỗi khi user thay đổi, cập nhật lại AsyncStorage
        if (user) {
            AsyncStorage.setItem("user", JSON.stringify(user));
        } else {
            AsyncStorage.removeItem("user"); // Xóa nếu user logout
        }
    }, [user]);

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
            <Toast />
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)