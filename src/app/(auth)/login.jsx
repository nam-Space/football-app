import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { loginUserAPI } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/context/AppContext";
import Toast from "react-native-toast-message";

const Login = () => {
    const { user, setUser } = useApp();

    const [form, setForm] = useState({ email: "", password: "" });

    const handleLogin = async () => {
        const res = await loginUserAPI({ ...form });
        if (res.data) {
            await AsyncStorage.setItem("access_token", res.data.token);
            setUser(res.data);
            router.replace("/(tabs)");
        } else {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: res.error,
                position: "bottom",
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sign In</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Title and Register Link */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Sign In</Text>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => router.push("/(auth)/register")}
                    >
                        <Text style={styles.registerText}>
                            I need to register
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#b83dba"
                        />
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#999"
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                email: text,
                            })
                        }
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                password: text,
                            })
                        }
                    />

                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>
                            Forgot your password?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or</Text>

                    {/* Social Login Buttons */}
                    <TouchableOpacity style={styles.facebookButton}>
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png",
                            }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>
                            Login with Facebook
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.xButton}>
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
                            }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.xButtonText}>Login with X</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Benefits */}
                <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>
                        Don't have a Premier League account?
                    </Text>
                    <Text style={styles.benefitsSubtitle}>
                        In that case, you are missing out on:
                    </Text>

                    <View style={styles.benefitItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.benefitText}>
                            Fantasy Premier League Football Game
                        </Text>
                    </View>

                    <View style={styles.benefitItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.benefitText}>
                            Exclusive Fan Services
                        </Text>
                    </View>

                    <View style={styles.benefitItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.benefitText}>
                            Customised Site Content
                        </Text>
                    </View>

                    <View style={styles.benefitItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.benefitText}>
                            Favourite Club Information and Notifications
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push("/(auth)/register")}
                    >
                        <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
        height: 56,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    registerLink: {
        flexDirection: "row",
        alignItems: "center",
    },
    registerText: {
        color: "#b83dba",
        marginRight: 4,
    },
    form: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.primary,
        marginBottom: 4,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: "#f5f5f5",
    },
    forgotPassword: {
        color: "#b83dba",
        textAlign: "left",
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: theme.colors.primary,
        height: 50,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    signInButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    orText: {
        textAlign: "center",
        color: "#666",
        marginBottom: 16,
    },
    facebookButton: {
        backgroundColor: "#1877f2",
        height: 50,
        borderRadius: 4,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    xButton: {
        backgroundColor: "#000000",
        height: 50,
        borderRadius: 4,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    socialButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    xButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    benefitsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.primary,
        marginBottom: 4,
    },
    benefitsSubtitle: {
        fontSize: 14,
        color: "#333",
        marginBottom: 12,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#b83dba",
        marginRight: 8,
    },
    benefitText: {
        fontSize: 14,
        color: "#333",
    },
    registerButton: {
        backgroundColor: theme.colors.primary,
        height: 50,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    registerButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Login;
