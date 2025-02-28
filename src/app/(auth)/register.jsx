import React, { useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { registerUserAPI } from "@/utils/api";
import Toast from "react-native-toast-message";
import { ROLE } from "@/constants/role";

const Register = () => {
    const [form, setForm] = useState({
        email: "",
        name: "",
        address: "",
        phone: "",
        gender: "",
        password: "",
        confirmPassword: "",
    });

    const handleRegister = async () => {
        if (form.password !== form.confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please confirm your password",
                position: "bottom",
            });
            return;
        }
        const res = await registerUserAPI({ ...form, role: ROLE.USER });
        if (res.data) {
            router.replace("/(auth)/login");
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
            <StatusBar
                backgroundColor={theme.colors.primary}
                barStyle="light-content"
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Title and Register Link */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Register</Text>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => router.replace("/(auth)/login")}
                    >
                        <Text style={styles.registerText}>I need to login</Text>
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

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#999"
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                name: text,
                            })
                        }
                    />

                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        placeholderTextColor="#999"
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                address: text,
                            })
                        }
                    />

                    <Text style={styles.label}>Phone number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone number"
                        placeholderTextColor="#999"
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                phone: text,
                            })
                        }
                    />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.gender}
                            onValueChange={(itemValue) =>
                                setForm({
                                    ...form,
                                    gender: itemValue,
                                })
                            }
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Gender" value="" />
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                            <Picker.Item label="Other" value="other" />
                        </Picker>
                    </View>

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

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                        onChangeText={(text) =>
                            setForm({
                                ...form,
                                confirmPassword: text,
                            })
                        }
                    />

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.signInButtonText}>Register</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or</Text>

                    {/* Social Register Buttons */}
                    <TouchableOpacity style={styles.facebookButton}>
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png",
                            }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.socialButtonText}>
                            Register with Facebook
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.xButton}>
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
                            }}
                            style={styles.socialIcon}
                        />
                        <Text style={styles.xButtonText}>Register with X</Text>
                    </TouchableOpacity>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>
                        Benefits of a Premier League account:
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
        justifyContent: "space-between",
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 4,
        marginBottom: 16,
        backgroundColor: "#f5f5f5",
    },
    picker: {
        height: 50,
        width: "100%",
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

export default Register;
