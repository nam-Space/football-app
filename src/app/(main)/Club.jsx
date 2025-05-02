import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Linking,
} from "react-native";
import { Button } from "react-native-paper";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { useApp } from "@/context/AppContext";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
// require('dotenv').config();
import { updateUserFavouriteTeam } from "@/utils/api";

const TeamScreen = () => {
    const { user, setUser } = useApp();
    const { teamName1 } = useLocalSearchParams(); // <-- Nhận từ router
    const [activeTab, setActiveTab] = useState("overview"); // Thêm state quản lý tab
    const [team, setTeam] = useState(null);
    const [isFavourited, setIsFavourited] = useState(false);
    const [teamId, setTeamId] = useState(null);
    const [allTeams, setAllTeams] = useState(null);
    const [teamStats, setTeamStats] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [teamColors, setTeamColors] = useState("");
    const [squad, setSquad] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchAllTeams = async () => {
        try {
            const response = await axios.get(
                "http://api.football-data.org/v4/competitions/PL/teams",
                {
                    headers: {
                        "X-Auth-Token": "84f64d4adaf24a90a3b00a1ed06eaed4",
                    },
                }
            );
            const allFetchedTeams = response.data.teams;
            // Tìm team theo teamName1
            const foundTeam = allFetchedTeams.find(
                (t) =>
                    teamName1
                        .toLowerCase()
                        .includes(t.shortName.toLowerCase()) ||
                    t.name.toLowerCase().includes(teamName1.toLowerCase())
            );
            setTeamId(foundTeam.id); // Lưu teamId vào state
        } catch (error) {
            console.error("Lỗi gọi API:", error);
        }
    };
    const fetchTeam = async () => {
        try {
            const response = await axios.get(
                `https://api.football-data.org/v4/teams/${
                    teamId ? teamId : 64
                }`,
                {
                    headers: {
                        "X-Auth-Token": "84f64d4adaf24a90a3b00a1ed06eaed4",
                    },
                }
            );
            setTeam(response.data);
            setTeamName(response.data.name);
            const colors = response.data.clubColors.split(" / "); // ["Red", "White"]
            setTeamColors(colors[0]); // Lấy màu đầu tiên
            setSquad(response.data.squad);
        } catch (error) {
            console.error("Lỗi gọi API:", error);
        }
    };
    // Hàm chọn ngẫu nhiên 3 cầu thủ
    const getRandomPlayers = () => {
        if (squad.length < 3) return [];
        const shuffled = squad.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };
    const get10RandomPlayers = () => {
        if (squad.length < 3) return [];
        const shuffled = squad.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    };
    // Hàm tạo thông số ngẫu nhiên
    const getRandomStat = (min, max) =>
        Math.floor(Math.random() * (max - min + 1) + min);

    // Danh sách các hạng mục
    const categories = [
        { title: "Goals", min: 5, max: 20 },
        { title: "Assists", min: 3, max: 15 },
        { title: "Passes", min: 30, max: 100 },
        { title: "Shots", min: 10, max: 50 },
        { title: "Tackles", min: 5, max: 30 },
        { title: "Aerial Duels Won", min: 2, max: 15 },
        { title: "Clearances", min: 5, max: 25 },
        { title: "Interceptions", min: 3, max: 20 },
    ];
    const fetchTeamStats = async () => {
        try {
            const response = await axios.get(
                "https://api.football-data-api.com/league-teams?key=test85g57&season_id=2012&include=stats"
            );
            if (response.data.success) {
                const clubData = response.data.data.find(
                    (team) => team.name.toLowerCase() === teamName.toLowerCase()
                );
                if (clubData) {
                    setTeamStats(clubData);
                    // console.log("Dữ liệu thống kê đội bóng:", clubData);
                } else {
                    setError("Không tìm thấy câu lạc bộ");
                }
            }
        } catch (error) {
            console.error("Lỗi gọi API:", error);
        }
    };
    useEffect(() => {
        fetchAllTeams();
    }, [teamName1]);
    useEffect(() => {
        if (teamId && teamId == user?.team?.id) setIsFavourited(true); // Không gọi API nếu teamId chưa có
        fetchTeam();
    }, [teamId]);
    useEffect(() => {
        // console.log("Dữ liệu team:", team.shortName);
    }, [team]);

    useEffect(() => {
        fetchTeamStats();
    }, [teamName]);
    if (!team) {
        return <Text>Đang tải dữ liệu...</Text>;
    }
    // Render nội dung theo tab
    const renderTabContent = () => {
        if (!team) return <Text>Đang tải dữ liệu...</Text>;
        // Hàm lọc cầu thủ theo vị trí
        const filterPlayersByPosition = (position) => {
            return team.squad.filter(
                (player) =>
                    player.position &&
                    player.position
                        .toLowerCase()
                        .includes(position.toLowerCase())
            );
        };
        // ✅ Component hiển thị danh sách cầu thủ theo từng vị trí
        const getPlayerImage = async (playerName) => {
            try {
                const response = await axios.get(
                    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(
                        playerName
                    )}`
                );
                const playerData = response.data.player;

                if (
                    playerData &&
                    playerData.length > 0 &&
                    playerData[0].strCutout
                ) {
                    return playerData[0].strCutout; // Ảnh cầu thủ
                } else {
                    return "https://via.placeholder.com/80"; // Ảnh mặc định nếu không có dữ liệu
                }
            } catch (error) {
                // console.error("Lỗi tải ảnh cầu thủ:", error);
                return "https://via.placeholder.com/80"; // Ảnh mặc định khi lỗi
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
                        {players.map((player) => (
                            <TouchableOpacity
                                key={player.id}
                                style={styles.playerCard}
                            >
                                <Image
                                    source={{
                                        uri:
                                            playerImages[player.id] ||
                                            "https://via.placeholder.com/80",
                                    }}
                                    style={styles.playerImage}
                                />
                                <View style={styles.playerInfo}>
                                    <Text style={styles.playerNumber}>
                                        {player.shirtNumber}
                                    </Text>
                                    <Text style={styles.playerName}>
                                        {player.name}
                                    </Text>
                                    <Text style={styles.playerDetails}>
                                        {player.nationality}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        };
        if (selectedCategory) {
            const players = get10RandomPlayers(); // Chỉ lấy 10 cầu thủ

            return (
                <View style={{ flex: 1, backgroundColor: "#fff" }}>
                    <ScrollView
                        contentContainerStyle={{
                            padding: 20,
                            paddingBottom: 40,
                        }}
                    >
                        {/* Tiêu đề và nút quay lại */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 20,
                            }}
                        >
                            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                                {selectedCategory.title} - Ranking
                            </Text>
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(null)}
                            >
                                <Text style={{ color: "red", fontSize: 16 }}>
                                    ← Back
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Danh sách cầu thủ */}
                        {players.map((player, index) => (
                            <View
                                key={player.id}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 15,
                                    padding: 10,
                                    backgroundColor:
                                        index < 3 ? "#f9f2ff" : "#f8f9fa",
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        width: 30,
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    {index + 1}
                                </Text>
                                <Image
                                    source={{
                                        uri: "https://via.placeholder.com/40",
                                    }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        marginHorizontal: 10,
                                    }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {player.name}
                                    </Text>
                                    <Text
                                        style={{ color: "#777", fontSize: 14 }}
                                    >
                                        {player.position}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        color: "#4A235A",
                                    }}
                                >
                                    {getRandomStat(
                                        selectedCategory.min,
                                        selectedCategory.max
                                    )}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            );
        }

        switch (activeTab) {
            case "overview":
                return (
                    <View style={{ padding: 20 }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                            }}
                        >
                            Visit {team.shortName}
                        </Text>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>Official App</Text>
                            <AntDesign name="right" size={20} color="#4A235A" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(team.website)}
                        >
                            <Text style={styles.linkText}>
                                Official Website
                            </Text>

                            <AntDesign name="right" size={20} color="#4A235A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>
                                Club Ticket Information
                            </Text>
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
                            <FontAwesome
                                name="facebook-official"
                                size={30}
                                color="#3b5998"
                            />
                            <FontAwesome
                                name="twitter"
                                size={30}
                                color="#1da1f2"
                            />
                            <FontAwesome
                                name="youtube"
                                size={30}
                                color="#ff0000"
                            />
                            <FontAwesome
                                name="instagram"
                                size={30}
                                color="#e1306c"
                            />
                            {/* <FontAwesome name="tiktok" size={30} color="#000" /> */}
                        </View>
                    </View>
                );
            case "squad":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Nút chọn mùa giải */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>
                                    Season 2023/24
                                </Text>
                                <AntDesign
                                    name="caretdown"
                                    size={12}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Nút chọn loại đội hình */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.teamTypeContainer}
                        >
                            <TouchableOpacity
                                style={styles.teamTypeButtonActive}
                            >
                                <Text style={styles.teamTypeTextActive}>
                                    First Team
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.teamTypeButton}>
                                <Text style={styles.teamTypeText}>
                                    PL2 Team
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.teamTypeButton}>
                                <Text style={styles.teamTypeText}>
                                    U18 Team
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Player list by position */}
                        <ScrollView>
                            {/* Goalkeeper */}
                            <PositionSection
                                title="Goalkeeper"
                                players={filterPlayersByPosition("Goalkeeper")}
                            />
                            {/* Defender */}
                            <PositionSection
                                title="Defender"
                                players={filterPlayersByPosition("Back")}
                            />
                            {/* Midfielder */}
                            <PositionSection
                                title="Midfielder"
                                players={filterPlayersByPosition("Centre")}
                            />
                            {/* Forward */}
                            <PositionSection
                                title="Forward"
                                players={filterPlayersByPosition("Offence")}
                            />
                        </ScrollView>
                    </View>
                );
            case "teamStats":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Season selection button */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>
                                    Season 2023/24
                                </Text>
                                <AntDesign
                                    name="caretdown"
                                    size={12}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Attack Stats */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Attack</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.seasonGoals_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>Goals</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.scoredAVGHT_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Goals/Match
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats
                                                .shotsOnTargetTotal_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>Shots</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {Math.round(
                                            (teamStats.stats
                                                .shotsOnTargetTotal_overall /
                                                teamStats.stats
                                                    .shotsTotal_overall) *
                                                100
                                        )}
                                        %
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Shot Accuracy
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Team Play Stats */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                Team Play
                            </Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.possessionAVG_overall}%
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Possession
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats.additional_info
                                                .penalties_scored_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Penalty Goals
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats.additional_info
                                                .throwins_team_num_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Throw-ins
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.cornersTotal_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Total Corners
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Defense Stats */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                Defense
                            </Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats
                                                .seasonConcededNum_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Goals Conceded
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats.additional_info
                                                .penalties_conceded_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Penalty Goals Conceded
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats
                                                .seasonCSPercentage_overall
                                        }
                                        %
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Clean Sheet Rate
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {
                                            teamStats.stats
                                                .seasonConcededMin_overall
                                        }
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Avg Minutes per Goal Conceded
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Other Stats */}
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>Other</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.cardsTotal_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Total Cards
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.cornersAVG_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Avg Corners
                                    </Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.foulsTotal_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>Fouls</Text>
                                </View>
                                <View style={styles.statsItem}>
                                    <Text style={styles.statsValue}>
                                        {teamStats.stats.offsidesTotal_overall}
                                    </Text>
                                    <Text style={styles.statsLabel}>
                                        Offsides
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            case "playerStats1":
                return (
                    <View style={{ padding: 20 }}>
                        {/* Nút chọn mùa giải */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.seasonButton}>
                                <Text style={styles.seasonButtonText}>
                                    Mùa 2023/24
                                </Text>
                                <AntDesign
                                    name="caretdown"
                                    size={12}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Bàn thắng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Bàn thắng
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Top 3 cầu thủ */}
                            <View style={styles.playerStatsList}>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{
                                            uri: "https://via.placeholder.com/40",
                                        }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>
                                            M. Salah
                                        </Text>
                                        <Text
                                            style={styles.playerStatsPosition}
                                        >
                                            Tiền đạo
                                        </Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>
                                        18
                                    </Text>
                                </View>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{
                                            uri: "https://via.placeholder.com/40",
                                        }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>
                                            D. Núñez
                                        </Text>
                                        <Text
                                            style={styles.playerStatsPosition}
                                        >
                                            Tiền đạo
                                        </Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>
                                        12
                                    </Text>
                                </View>
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{
                                            uri: "https://via.placeholder.com/40",
                                        }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>
                                            L. Díaz
                                        </Text>
                                        <Text
                                            style={styles.playerStatsPosition}
                                        >
                                            Tiền đạo
                                        </Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>
                                        9
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Kiến tạo */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Kiến tạo
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự như trên với dữ liệu kiến tạo */}
                                <View style={styles.playerStatsItem}>
                                    <Image
                                        source={{
                                            uri: "https://via.placeholder.com/40",
                                        }}
                                        style={styles.playerStatsImage}
                                    />
                                    <View style={styles.playerStatsInfo}>
                                        <Text style={styles.playerStatsName}>
                                            T. Alexander-Arnold
                                        </Text>
                                        <Text
                                            style={styles.playerStatsPosition}
                                        >
                                            Hậu vệ
                                        </Text>
                                    </View>
                                    <Text style={styles.playerStatsValue}>
                                        10
                                    </Text>
                                </View>
                                {/* Thêm 2 cầu thủ khác */}
                            </View>
                        </View>

                        {/* Đường chuyền */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Đường chuyền
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu đường chuyền */}
                            </View>
                        </View>

                        {/* Sút bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Sút bóng
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu sút bóng */}
                            </View>
                        </View>

                        {/* Cướp bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Cướp bóng
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu cướp bóng */}
                            </View>
                        </View>

                        {/* Thắng không chiến */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Thắng không chiến
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu không chiến */}
                            </View>
                        </View>

                        {/* Phá bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Phá bóng
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu phá bóng */}
                            </View>
                        </View>

                        {/* Cắt bóng */}
                        <View style={styles.statsCategorySection}>
                            <View style={styles.statsCategoryHeader}>
                                <Text style={styles.statsCategoryTitle}>
                                    Cắt bóng
                                </Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        Xem tất cả
                                    </Text>
                                    <AntDesign
                                        name="right"
                                        size={14}
                                        color="#4A235A"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.playerStatsList}>
                                {/* Tương tự với dữ liệu cắt bóng */}
                            </View>
                        </View>
                    </View>
                );
            case "playerStats":
                return (
                    <ScrollView style={{ padding: 20 }}>
                        {/* Season selection button */}
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 10,
                                    backgroundColor: "#ddd",
                                    borderRadius: 5,
                                }}
                            >
                                <Text style={{ fontSize: 16, marginRight: 5 }}>
                                    Season 2023/24
                                </Text>
                                <AntDesign
                                    name="caretdown"
                                    size={12}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        {categories.map((category, index) => {
                            const players = getRandomPlayers();
                            return (
                                <View key={index} style={{ marginBottom: 20 }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {category.title}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setSelectedCategory(category)
                                            }
                                        >
                                            <Text style={{ color: "#4A235A" }}>
                                                View all
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {players.map((player, index) => (
                                        <View
                                            key={player.id}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 15,
                                                padding: 10,
                                                backgroundColor:
                                                    index < 3
                                                        ? "#f9f2ff"
                                                        : "#f8f9fa",
                                                borderRadius: 8,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    width: 30,
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {index + 1}
                                            </Text>
                                            <Image
                                                source={{
                                                    uri: "https://via.placeholder.com/40",
                                                }}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    marginHorizontal: 10,
                                                }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {player.name}
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: "#777",
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {player.position}
                                                </Text>
                                            </View>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    color: "#4A235A",
                                                }}
                                            >
                                                {getRandomStat(
                                                    category.min,
                                                    category.max
                                                )}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            );
                        })}
                    </ScrollView>
                );
            default:
                return null;
        }
    };

    return !team && !teamName && !teamName1 && !team ? (
        <Text>Loading...</Text>
    ) : (
        // <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    position: "absolute",
                    top: 40,
                    left: 20,
                    zIndex: 10,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: 10,
                    borderRadius: 20,
                    height: 40,
                }}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
                {/* Ảnh nền */}
                {/* <View style={{ position: "relative" ,height: 20}}> */}
                {/* <Image
                        source={{ uri: "https://via.placeholder.com/500" }}
                        style={{ width: "100%", height: 200, backgroundColor: teamColors.toLowerCase() }}
                    /> */}

                {/* </View> */}

                {/* Thông tin đội bóng */}
                <View style={{ backgroundColor: "#c8102e", padding: 20 }}>
                    <Image
                        source={{
                            uri: team.crest || "https://via.placeholder.com/80",
                        }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            marginBottom: 10,
                            alignSelf: "center",
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 26,
                            fontWeight: "bold",
                            color: "#fff",
                        }}
                    >
                        {team.shortName}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#fff", marginTop: 5 }}>
                        Est: {team.founded} • {team.address}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#fff" }}>
                        Capacity: 61,276
                    </Text>
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
                        icon={isFavourited ? "star" : "star-outline"}
                        mode={isFavourited ? "contained" : "outlined"}
                        textColor={isFavourited ? "white" : "#c8102e"}
                        style={{
                            borderColor: "#c8102e",
                            backgroundColor: isFavourited
                                ? "#c8102e"
                                : "transparent",
                        }}
                        onPress={async () => {
                            setIsFavourited(!isFavourited);

                            if (!isFavourited) {
                                const data = {
                                    id: team.id,
                                    name: team.name,
                                    shortName: team.shortName,
                                    address: team.address,
                                    crest: team.crest,
                                    tla: team.tla,
                                    venue: team.venue,
                                    website: team.website,
                                };
                                const res = await updateUserFavouriteTeam(data);
                                setUser(res.data);
                            } else {
                                const data = {
                                    id: "",
                                    name: "",
                                    shortName: "",
                                    address: "",
                                    crest: "",
                                    tla: "",
                                    venue: "",
                                    website: "",
                                };
                                const res = await updateUserFavouriteTeam(data);
                                setUser(res.data);
                            }
                        }}
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

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        borderBottomWidth: 1,
                        borderBottomColor: "#ddd",
                        backgroundColor: "#fff",
                        paddingVertical: 2,
                    }}
                >
                    {["overview", "squad", "teamStats", "playerStats"].map(
                        (tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={{
                                        paddingVertical: 5,
                                        flex: 1,
                                        alignItems: "center",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: isActive
                                                ? "#4A235A"
                                                : "transparent",
                                            borderColor: isActive
                                                ? "#4A235A"
                                                : "transparent",
                                            borderWidth: isActive ? 2 : 0,
                                            borderRadius: 8,
                                            paddingHorizontal: 8,
                                            paddingVertical: 6,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: isActive
                                                    ? "white"
                                                    : "#4A235A",
                                                fontWeight: isActive
                                                    ? "bold"
                                                    : "normal",
                                                fontSize: 13,
                                            }}
                                        >
                                            {tab.charAt(0).toUpperCase() +
                                                tab.slice(1)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }
                    )}
                </View>

                {/* Nội dung tab */}
                {renderTabContent()}
            </ScrollView>
        </View>
        //  </SafeAreaView>
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
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 15,
    },
    seasonButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    teamTypeContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    teamTypeButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f4f4f4",
        marginRight: 10,
    },
    teamTypeButtonActive: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#4A235A",
        marginRight: 10,
    },
    teamTypeText: {
        color: "#666",
        fontSize: 14,
    },
    teamTypeTextActive: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    positionSection: {
        marginBottom: 25,
    },
    positionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    playersList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    playerCard: {
        width: "47%",
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        overflow: "hidden",
    },
    playerImage: {
        width: "100%",
        height: 150,
        backgroundColor: "#eee",
    },
    playerInfo: {
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    playerNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4A235A",
    },
    playerName: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    statsSection: {
        marginBottom: 25,
    },
    statsSectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    statsItem: {
        width: "47%",
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    statsValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4A235A",
        marginBottom: 5,
    },
    statsLabel: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 20,
    },
    seasonButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    statsCategorySection: {
        marginBottom: 25,
    },
    statsCategoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    statsCategoryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    viewAllText: {
        color: "#4A235A",
        fontSize: 14,
    },
    playerStatsList: {
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        padding: 10,
    },
    playerStatsItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
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
        fontWeight: "500",
        color: "#333",
    },
    playerStatsPosition: {
        fontSize: 14,
        color: "#666",
    },
    playerStatsValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4A235A",
        marginLeft: 10,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 20,
    },
    seasonButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    seasonButtonText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
};

export default TeamScreen;
