import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView,Linking } from "react-native";
import { Button } from "react-native-paper";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { Link } from "expo-router";

const TeamScreen = () => {
    const [activeTab, setActiveTab] = useState("overview"); // Thêm state quản lý tab
    const [team, setTeam] = useState(null);

    const fetchTeam = async () => {
        try {
            const response = await axios.get('https://api.football-data.org/v4/teams/2061', { headers: { "X-Auth-Token": "84f64d4adaf24a90a3b00a1ed06eaed4" } });
            console.log(response.data);
            setTeam(response.data);
        } catch (error) {
            console.error("Lỗi gọi API:", error);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);
    useEffect(() => {
        console.log("Dữ liệu team:", team);
        // console.log("Dữ liệu team:", team.shortName);
    }, [team]);
    if (!team) {
        return <Text>Đang tải dữ liệu...</Text>;
    }
    // Render nội dung theo tab
    const renderTabContent = () => {
        if (!team) return <Text>Đang tải dữ liệu...</Text>;
        // Hàm lọc cầu thủ theo vị trí
    const filterPlayersByPosition = (position) => {
        return team.squad.filter(player => player.position === position);
    };
    // ✅ Component hiển thị danh sách cầu thủ theo từng vị trí
    const getPlayerImage = async (playerName) => {
        try {
            const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`);
            const playerData = response.data.player;
    
            if (playerData && playerData.length > 0 && playerData[0].strCutout) {
                return playerData[0].strCutout;  // Ảnh cầu thủ
            } else {
                return 'https://via.placeholder.com/80';  // Ảnh mặc định nếu không có dữ liệu
            }
        } catch (error) {
            console.error("Lỗi tải ảnh cầu thủ:", error);
            return 'https://via.placeholder.com/80'; // Ảnh mặc định khi lỗi
        }
    };
    
const PositionSection = ({ title, players }) => {
    const [playerImages, setPlayerImages] = useState({});

    useEffect(() => {
        const fetchImages = async () => {
            const images = {};
            for (const player of players) {
                images[player.id] = await getPlayerImage(player.name);
            }
            setPlayerImages(images);
        };

        fetchImages();
    }, [players]);
    return (
    <View style={styles.positionSection}>
        <Text style={styles.positionTitle}>{title}</Text>
        <View style={styles.playersList}>
            {players.map(player => (
                <TouchableOpacity key={player.id} style={styles.playerCard}>
                    <Image
                            source={{ uri: playerImages[player.id] || 'https://via.placeholder.com/80' }}
                            style={styles.playerImage}
                        />
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerNumber}>{player.shirtNumber}</Text>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerDetails}>{player.nationality}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    </View>)
};    

        
        switch (activeTab) {
            case "overview":
                return (
                    <View style={{ padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                            Truy cập {team.shortName }
                        </Text>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>Ứng dụng chính thức</Text>
                            <AntDesign name="right" size={20} color="#4A235A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton}
                        onPress={() => Linking.openURL(team.website)}
                        >
                           
                            <Text style={styles.linkText}>Website chính thức</Text>
                          
                            <AntDesign name="right" size={20} color="#4A235A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>Thông tin vé câu lạc bộ</Text>
                            <AntDesign name="right" size={20} color="#4A235A" />
                        </TouchableOpacity>
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
                    </View>

                );
            case "squad":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Nút chọn mùa giải */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>Mùa 2023/24</Text>
                                <AntDesign name="caretdown" size={12} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Nút chọn loại đội hình */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.teamTypeContainer}
                        >
                            <TouchableOpacity style={styles.teamTypeButtonActive}>
                                <Text style={styles.teamTypeTextActive}>Đội hình chính</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.teamTypeButton}>
                                <Text style={styles.teamTypeText}>Đội hình PL2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.teamTypeButton}>
                                <Text style={styles.teamTypeText}>Đội hình U18</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        
                        {/* Danh sách cầu thủ theo vị trí */}
            <ScrollView>
                {/* Thủ môn */}
                <PositionSection title="Thủ môn" players={filterPlayersByPosition("Goalkeeper")} />
                {/* Hậu vệ */}
                <PositionSection title="Hậu vệ" players={filterPlayersByPosition("Defence")} />
                {/* Tiền vệ */}
                <PositionSection title="Tiền vệ" players={filterPlayersByPosition("Midfield")} />
                {/* Tiền đạo */}
                <PositionSection title="Tiền đạo" players={filterPlayersByPosition("Offence")} />
            </ScrollView>
                    </View>
                );
            case "teamStats":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Nút chọn mùa giải */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>Mùa 2023/24</Text>
                                <AntDesign name="caretdown" size={12} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Thống kê Tấn công */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Tấn công</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>68</Text>
                                    <Text style={styles.statsLabel}>Bàn thắng</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>2.5</Text>
                                    <Text style={styles.statsLabel}>Bàn/Trận</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>425</Text>
                                    <Text style={styles.statsLabel}>Sút</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>38%</Text>
                                    <Text style={styles.statsLabel}>Tỷ lệ sút trúng đích</Text>
                                </View>
                            </View>
                        </View>

                        {/* Thống kê Team Play */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Lối chơi</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>65%</Text>
                                    <Text style={styles.statsLabel}>Kiểm soát bóng</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>12,458</Text>
                                    <Text style={styles.statsLabel}>Số đường chuyền</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>89%</Text>
                                    <Text style={styles.statsLabel}>Tỷ lệ chuyền chính xác</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>285</Text>
                                    <Text style={styles.statsLabel}>Số đường kiến tạo</Text>
                                </View>
                            </View>
                        </View>

                        {/* Thống kê Phòng thủ */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Phòng thủ</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>15</Text>
                                    <Text style={styles.statsLabel}>Clean sheets</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>245</Text>
                                    <Text style={styles.statsLabel}>Tackle thành công</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>156</Text>
                                    <Text style={styles.statsLabel}>Cản phá</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>28</Text>
                                    <Text style={styles.statsLabel}>Bàn thua</Text>
                                </View>
                            </View>
                        </View>

                        {/* Thống kê Khác */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Khác</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>35</Text>
                                    <Text style={styles.statsLabel}>Thẻ vàng</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>3</Text>
                                    <Text style={styles.statsLabel}>Thẻ đỏ</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>268</Text>
                                    <Text style={styles.statsLabel}>Phạm lỗi</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>285</Text>
                                    <Text style={styles.statsLabel}>Bị phạm lỗi</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            case "playerStats":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Nút chọn mùa giải */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>Mùa 2023/24</Text>
                                <AntDesign name="caretdown" size={12} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Bàn thắng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Bàn thắng</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>

                            {/* Top 3 cầu thủ */}
                            <View style={styles.playerStatsList}>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{ uri: 'https://via.placeholder.com/40' }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>M. Salah</Text>
                                        <Text style={styles.playerStatsPosition}>Tiền đạo</Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>18</Text>
                                </View>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{ uri: 'https://via.placeholder.com/40' }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>D. Núñez</Text>
                                        <Text style={styles.playerStatsPosition}>Tiền đạo</Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>12</Text>
                                </View>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{ uri: 'https://via.placeholder.com/40' }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>L. Díaz</Text>
                                        <Text style={styles.playerStatsPosition}>Tiền đạo</Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>9</Text>
                                </View>
                            </View>
                        </View>

                        {/* Kiến tạo */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Kiến tạo</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự như trên với dữ liệu kiến tạo */}
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{ uri: 'https://via.placeholder.com/40' }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>T. Alexander-Arnold</Text>
                                        <Text style={styles.playerStatsPosition}>Hậu vệ</Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>10</Text>
                                </View>
                                {/* Thêm 2 cầu thủ khác */}
                            </View>
                        </View>

                        {/* Đường chuyền */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Đường chuyền</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu đường chuyền */}
                            </View>
                        </View>

                        {/* Sút bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Sút bóng</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu sút bóng */}
                            </View>
                        </View>

                        {/* Cướp bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Cướp bóng</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu cướp bóng */}
                            </View>
                        </View>

                        {/* Thắng không chiến */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Thắng không chiến</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu không chiến */}
                            </View>
                        </View>

                        {/* Phá bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Phá bóng</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu phá bóng */}
                            </View>
                        </View>

                        {/* Cắt bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>Cắt bóng</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>Xem tất cả</Text>
                                    <AntDesign name="right" size={14} color="#4A235A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu cắt bóng */}
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        !team ? (<Text>Đang tải dữ liệu...</Text>): (
            
            <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Ảnh nền */}
            <View style={{ position: "relative" }}>
                <Image
                    source={{ uri: "https://via.placeholder.com/500" }}
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
                    {team.shortName }
                </Text>
                <Text style={{ fontSize: 16, color: "#fff", marginTop: 5 }}>
                    Thành lập: {team.founded} • {team.address}
                </Text>
                <Text style={{ fontSize: 16, color: "#fff" }}>Sức chứa: 61,276</Text>
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
                    Yêu thích
                </Button>
                <Button
                    icon="bell-outline"
                    mode="outlined"
                    textColor="#c8102e"
                    style={{ borderColor: "#c8102e" }}
                >
                    Theo dõi
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
                <TouchableOpacity
                    onPress={() => setActiveTab("overview")}
                    style={{
                        paddingVertical: 10,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === "overview" ? "#4A235A" : "transparent",
                    }}
                >
                    <Text
                        style={{
                            color: activeTab === "overview" ? "#4A235A" : "#999",
                            fontWeight: activeTab === "overview" ? "bold" : "normal",
                        }}
                    >
                        Tổng quan
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("squad")}
                    style={{
                        paddingVertical: 10,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === "squad" ? "#4A235A" : "transparent",
                    }}
                >
                    <Text
                        style={{
                            color: activeTab === "squad" ? "#4A235A" : "#999",
                            fontWeight: activeTab === "squad" ? "bold" : "normal",
                        }}
                    >
                        Đội hình
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("teamStats")}
                    style={{
                        paddingVertical: 10,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === "teamStats" ? "#4A235A" : "transparent",
                    }}
                >
                    <Text
                        style={{
                            color: activeTab === "teamStats" ? "#4A235A" : "#999",
                            fontWeight: activeTab === "teamStats" ? "bold" : "normal",
                        }}
                    >
                        Thống kê đội
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("playerStats")}
                    style={{
                        paddingVertical: 10,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === "playerStats" ? "#4A235A" : "transparent",
                    }}
                >
                    <Text
                        style={{
                            color: activeTab === "playerStats" ? "#4A235A" : "#999",
                            fontWeight: activeTab === "playerStats" ? "bold" : "normal",
                        }}
                    >
                        Thống kê cầu thủ
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Nội dung tab */}
            {renderTabContent()}


        </ScrollView>) 
        
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
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 15,
    },
    seasonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    teamTypeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    teamTypeButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f4f4f4',
        marginRight: 10,
    },
    teamTypeButtonActive: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#4A235A',
        marginRight: 10,
    },
    teamTypeText: {
        color: '#666',
        fontSize: 14,
    },
    teamTypeTextActive: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    positionSection: {
        marginBottom: 25,
    },
    positionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    playersList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    playerCard: {
        width: '47%',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        overflow: 'hidden',
    },
    playerImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },
    playerInfo: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    playerNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A235A',
    },
    playerName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    statsSection: {
        marginBottom: 25,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    statsItem: {
        width: '47%',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4A235A',
        marginBottom: 5,
    },
    statsLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    seasonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    statsCategorySection: {
        marginBottom: 25,
    },
    statsCategoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statsCategoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    viewAllText: {
        color: '#4A235A',
        fontSize: 14,
    },
    playerStatsList: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 10,
    },
    playerStatsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    playerStatsImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    playerStatsInfo: {
        flex: 1,
    },
    playerStatsName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    playerStatsPosition: {
        fontSize: 14,
        color: '#666',
    },
    playerStatsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A235A',
        marginLeft: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    seasonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
};

export default TeamScreen;