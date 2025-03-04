import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";

const TeamScreen = () => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Ảnh nền */}
            <View style={{ position: "relative" }}>
                <Image
                    source={{ uri: "https://via.placeholder.com/500" }} // Ảnh đội bóng
                    style={{ width: "100%", height: 200 }}
                />
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 20,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: 10,
                        borderRadius: 20,
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Thông tin đội bóng */}
            <View style={{ backgroundColor: "#c8102e", padding: 20 }}>
                <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>
                    Liverpool
                </Text>
                <Text style={{ fontSize: 16, color: "#fff", marginTop: 5 }}>
                    Est: 1892 • Anfield, Liverpool
                </Text>
                <Text style={{ fontSize: 16, color: "#fff" }}>Capacity: 61,276</Text>
            </View>

            {/* Nút yêu thích và theo dõi */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginVertical: 15,
                }}
            >
                <Button
                    icon="star-outline"
                    mode="outlined"
                    textColor="#c8102e"
                    style={{ borderColor: "#c8102e" }}
                >
                    Favourite
                </Button>
                <Button
                    icon="bell-outline"
                    mode="outlined"
                    textColor="#c8102e"
                    style={{ borderColor: "#c8102e" }}
                >
                    Follow
                </Button>
            </View>

            {/* Tabs */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ddd",
                }}
            >
                <Button textColor="#4A235A" labelStyle={{ fontWeight: "bold" }}>
                    Overview
                </Button>
                <Button textColor="#999">Squad</Button>
                <Button textColor="#999">Team Stats</Button>
                <Button textColor="#999">Player stats</Button>
            </View>

            {/* Liên kết */}
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                    Visit Liverpool
                </Text>
                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>Official App</Text>
                    <AntDesign name="right" size={20} color="#4A235A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>Official Website</Text>
                    <AntDesign name="right" size={20} color="#4A235A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>Club Ticket Information</Text>
                    <AntDesign name="right" size={20} color="#4A235A" />
                </TouchableOpacity>
            </View>

            {/* Mạng xã hội */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginVertical: 20,
                    paddingHorizontal: 50,
                }}
            >
                <FontAwesome name="facebook-official" size={30} color="#3b5998" />
                <FontAwesome name="twitter" size={30} color="#1da1f2" />
                <FontAwesome name="youtube" size={30} color="#ff0000" />
                <FontAwesome name="instagram" size={30} color="#e1306c" />
                <FontAwesome name="tiktok" size={30} color="#000" />
            </View>
        </ScrollView>
    );
};

// CSS Styles
const styles = {
    linkButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "#f4f4f4",
        borderRadius: 10,
        marginBottom: 10,
    },
    linkText: {
        fontSize: 16,
        color: "#4A235A",
    },
};

export default TeamScreen;
