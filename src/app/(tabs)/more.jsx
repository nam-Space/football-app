// import { router } from 'expo-router';
// import { StyleSheet, View, Text, Button } from 'react-native';

// export default function More() {
//     return (
//         <View>
//             <Text style={{ fontSize: 24, fontWeight: 600 }}>Settings</Text>
//             <Button title='Login' onPress={() => router.push('/login')} />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     headerImage: {
//         color: '#808080',
//         bottom: -90,
//         left: -35,
//         position: 'absolute',
//     },
//     titleContainer: {
//         flexDirection: 'row',
//         gap: 8,
//     },
// });

import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    StatusBar,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TeamPickerModal from "@/components/TeamPickerModal";

const MoreScreen = () => {
    const { user } = useApp();

    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn chắc chắn đăng xuất người dùng ?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Xác nhận",
                onPress: async () => {
                    await AsyncStorage.removeItem("access_token");
                    router.replace("/(auth)/login");
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>More</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Sign Out Button */}
                {user ? (
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.signOutText}>Sign out</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <Text style={styles.signOutText}>Login</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                )}

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsContainer}>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingText}>Manage Account</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingText}>Notifications</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Favourite Team Section */}
                <Text style={styles.sectionTitle}>Favourite Team</Text>
                <View style={styles.teamContainer}>
                    <View style={styles.teamInfo}>
                        <Image
                            source={{
                                uri: user?.team?.crest,
                            }}
                            style={styles.teamLogo}
                        />
                        <Text style={styles.teamName}>
                            {user?.team?.shortName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.editButton}>EDIT</Text>
                    </TouchableOpacity>
                    {modalVisible && (
                        <TeamPickerModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                        />
                    )}
                </View>

                {/* Club Links */}
                <View style={styles.linksContainer}>
                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>Official App</Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>Official Website</Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>
                            Club Ticketing Information
                        </Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>Digital Membership</Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>Club Shop</Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Text style={styles.linkText}>MUTV</Text>
                        <Ionicons
                            name="open-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        alignItems: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2196f3",
        margin: 16,
        padding: 16,
        borderRadius: 8,
    },
    signOutText: {
        color: "white",
        fontSize: 18,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: theme.colors.primary,
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    settingsContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        marginHorizontal: 16,
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    settingText: {
        fontSize: 16,
        color: "#333",
    },
    teamContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    teamInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    teamLogo: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    teamName: {
        fontSize: 16,
        color: "#333",
    },
    editButton: {
        color: theme.colors.primary,
        fontWeight: "bold",
    },
    linksContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 8,
    },
    linkItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    linkText: {
        fontSize: 16,
        color: "#333",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "white",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    navIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
    },
    navText: {
        fontSize: 12,
        color: "#666",
    },
    navItemActive: {
        color: theme.colors.primary,
    },
    navTextActive: {
        color: theme.colors.primary,
        fontWeight: "500",
    },
});

export default MoreScreen;
