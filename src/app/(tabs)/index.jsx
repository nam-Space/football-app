import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    getCompetitionStandingDetailAPI,
    getMatchesAPI,
    getMatchesOfTeamIdAPI,
    getStatisticOfTeamIdAPI,
    getUpcomingMatches,
    getTeamDetailAPI,
    getNewsHighlight,
    getVideosAPI,
    getMatchesFromESPN,
} from "@/utils/api";
import { router } from "expo-router";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Platform,
    FlatList,
    Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
    const [activeTab, setActiveTab] = useState("matches");
    const [matches, setMatches] = useState([]); // lưu dữ liệu trận đấu

    const renderTabContent = () => {
        switch (activeTab) {
            case "matches":
                return <MatchesTab />;
            case "league":
                return <LeagueTableTab />;
            default:
                return <MatchesTab />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#e5006d" />
            <ScrollView style={styles.scrollView}>
                <Header />
                <NewsHighlight />
                <TabSelector
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                {renderTabContent()}
                <ClubHighlight />
                <RelatedNews />
                <LatestNews />
                <LatestVideos />
            </ScrollView>
        </SafeAreaView>
    );
};

const Header = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const data = await getMatchesFromESPN();
            if (data && data.events) {
                setMatches(data.events.slice(0, 5));
            }
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải lịch thi đấu:", err);
            setLoading(false);
        }
    };

    const formatMatchTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = () => {
        const date = new Date();
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    const getMatchScore = (match, status) => {
        const homeTeam = match.competitions[0].competitors.find(
            (c) => c.homeAway === "home"
        );
        const awayTeam = match.competitions[0].competitors.find(
            (c) => c.homeAway === "away"
        );

        // Hiển thị tỉ số cho trận đã kết thúc hoặc đang diễn ra
        if (status === "FT" || status.includes("'") || status === "HT") {
            return (
                <Text style={styles.matchScore}>
                    {homeTeam.score} - {awayTeam.score}
                </Text>
            );
        }
        // Hiển thị thời gian cho trận chưa bắt đầu
        return (
            <Text style={styles.matchTime}>{formatMatchTime(match.date)}</Text>
        );
    };

    return (
        <LinearGradient
            colors={["#ff0080", "#ff8000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerContainer}
        >
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Matchday Live</Text>
                <Text style={styles.headerDate}>{formatDate()}</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : matches.length > 0 ? (
                    <View style={styles.matchesContainer}>
                        {matches.map((match) => {
                            const homeTeam =
                                match.competitions[0].competitors.find(
                                    (c) => c.homeAway === "home"
                                );
                            const awayTeam =
                                match.competitions[0].competitors.find(
                                    (c) => c.homeAway === "away"
                                );
                            const status = match.status.type.shortDetail;

                            return (
                                <View key={match.id} style={styles.matchCard}>
                                    <TouchableOpacity
                                        style={styles.matchTeamContainer}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/Club",
                                                params: {
                                                    teamName1:
                                                        homeTeam.team
                                                            .displayName,
                                                },
                                            })
                                        }
                                        // onPress={() => router.push(pathname:"/Club",  params: { teamName1: homeTeam.team.shortDisplayName } )}}
                                    >
                                        <Image
                                            source={{ uri: homeTeam.team.logo }}
                                            style={styles.matchTeamLogo}
                                        />
                                        <Text style={styles.matchTeamName}>
                                            {homeTeam.team.name}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.matchScoreContainer}>
                                        {getMatchScore(match, status)}
                                        <Text
                                            style={[
                                                styles.matchStatus,
                                                (status.includes("'") ||
                                                    status === "HT") &&
                                                    styles.liveMatchStatus,
                                            ]}
                                        >
                                            {status}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.matchTeamContainer}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/Club",
                                                params: {
                                                    teamName1:
                                                        awayTeam.team
                                                            .displayName,
                                                },
                                            })
                                        }
                                        // onPress={() => router.push({ pathname: "/(tabs)/club", params: { teamName1: awayTeam.team.shortDisplayName } })}
                                    >
                                        <Image
                                            source={{ uri: awayTeam.team.logo }}
                                            style={styles.matchTeamLogo}
                                        />
                                        <Text style={styles.matchTeamName}>
                                            {awayTeam.team.name}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.noMatchesContainer}>
                        <Text style={styles.noMatchesText}>
                            Không có lịch thi đấu
                        </Text>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};

const NewsHighlight = () => {
    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const result = await getNewsHighlight();
            const selectedArticles = result.slice(0, 3).map((article) => ({
                id: article.id,
                title: article.headline,
                description: article.description,
                image: article.images?.[0]?.url,
                url: article.links?.web?.href,
                publishedDate: new Date(article.published).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                ),
            }));

            setNewsList(selectedArticles);
        } catch (err) {
            console.error("❌ Failed to fetch ESPN news:", err);
        }
    };

    if (newsList.length === 0) return null;

    return (
        <View style={styles.newsHighlightContainer}>
            <View style={styles.newsHeader}>
                <Image
                    source={{
                        uri: "https://logodownload.org/wp-content/uploads/2016/03/premier-league-logo-0.png",
                    }}
                    style={styles.newsLogo}
                    resizeMode="contain"
                />
            </View>

            {newsList.map((article, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.newsCard}
                    onPress={() => {
                        router.push({
                            pathname: "/homeNewsDetail",
                            params: {
                                id: article.id,
                                title: article.title,
                                image: article.image,
                                description: article.description,
                                url: article.url,
                                publishedDate: article.publishedDate,
                            },
                        });
                    }}
                >
                    <View style={styles.newsImageContainer}>
                        <Image
                            source={{ uri: article.image }}
                            style={styles.newsImage}
                            resizeMode="cover"
                        />
                        <View style={styles.newsTag}>
                            <Text style={styles.newsTagText}>News</Text>
                        </View>
                    </View>
                    <View style={styles.newsContent}>
                        <Text style={styles.newsTitle} numberOfLines={2}>
                            {article.title}
                        </Text>
                        <Text style={styles.newsDescription} numberOfLines={2}>
                            {article.description}
                        </Text>
                        <Text style={styles.newsDate}>
                            {article.publishedDate}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const TabSelector = ({ activeTab, setActiveTab }) => {
    return (
        <View style={styles.tabSelector}>
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    activeTab === "matches" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("matches")}
            >
                <Text style={styles.tabButtonText}>Matches</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    activeTab === "league" && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab("league")}
            >
                <Text style={styles.tabButtonText}>League Table</Text>
            </TouchableOpacity>
        </View>
    );
};

const MatchesTab = () => {
    const [matches, setMatches] = useState({}); // Khởi tạo là object rỗng thay vì mảng rỗng
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const today = new Date();
            const nextMonth = new Date();
            nextMonth.setMonth(today.getMonth() + 1);

            const dateFrom = today.toISOString().split("T")[0];
            const dateTo = nextMonth.toISOString().split("T")[0];

            const res = await getMatchesAPI(
                `competitions/PL/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`
            );

            if (res && res.data && res.data.matches) {
                const allMatches = res.data.matches;

                // Sắp xếp theo thời gian tăng dần
                const sortedMatches = allMatches.sort(
                    (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
                );

                // Lấy 10 trận sắp tới
                const next10Matches = sortedMatches.slice(0, 10);

                const groupedMatches = groupMatchesByDate(next10Matches);

                setMatches(groupedMatches);
            } else {
                setError("Không có trận đấu nào sắp diễn ra");
            }
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu trận đấu:", err);
            setError("Không thể tải lịch thi đấu");
            setLoading(false);
        }
    };

    const groupMatchesByDate = (matches) => {
        if (!Array.isArray(matches)) {
            return {};
        }

        return matches.reduce((groups, match) => {
            if (!match || !match.utcDate) {
                return groups;
            }

            const date = new Date(match.utcDate).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(match);
            return groups;
        }, {});
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getScoreDisplay = (match) => {
        if (!match) return "";
        if (match.status === "FINISHED") {
            return `${match.score.fullTime.home} - ${match.score.fullTime.away}`;
        } else {
            return formatTime(match.utcDate);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ff85" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.matchTabContainer}>
            {Object.entries(matches).length > 0 ? (
                Object.entries(matches).map(([date, dayMatches]) => (
                    <View key={date} style={styles.matchDateGroup}>
                        <Text style={styles.matchDateText}>{date}</Text>
                        {Array.isArray(dayMatches) &&
                            dayMatches.map((match) => (
                                <TouchableOpacity
                                    key={match.id}
                                    style={styles.matchCard}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/(main)/matchDetail",
                                            params: {
                                                homeTeamId: match.homeTeam.id,
                                                awayTeamId: match.awayTeam.id,
                                                matchDate:
                                                    match.utcDate.split("T")[0],
                                            },
                                        })
                                    }
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push({
                                                pathname: "/Club",
                                                params: {
                                                    teamName1:
                                                        match.homeTeam
                                                            .shortName,
                                                },
                                            })
                                        }
                                        style={styles.matchTeamContainer}
                                    >
                                        <Image
                                            source={{
                                                uri: match.homeTeam.crest,
                                            }}
                                            style={styles.matchTeamLogo}
                                        />
                                        <Text style={styles.matchTeamName}>
                                            {match.homeTeam.shortName}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.matchScoreContainer}>
                                        <Text style={styles.matchScore}>
                                            {getScoreDisplay(match)}
                                        </Text>
                                        <Text style={styles.matchStatus}>
                                            {match.status}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push({
                                                pathname: "/Club",
                                                params: {
                                                    teamName1:
                                                        match.awayTeam
                                                            .shortName,
                                                },
                                            })
                                        }
                                        style={styles.matchTeamContainer}
                                    >
                                        <Image
                                            source={{
                                                uri: match.awayTeam.crest,
                                            }}
                                            style={styles.matchTeamLogo}
                                        />
                                        <Text style={styles.matchTeamName}>
                                            {match.awayTeam.shortName}
                                        </Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                    </View>
                ))
            ) : (
                <View style={styles.noMatchesContainer}>
                    <Text style={styles.noMatchesText}>
                        Không có trận đấu nào sắp diễn ra
                    </Text>
                </View>
            )}
        </View>
    );
};

const LeagueTableTab = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                const data = await getCompetitionStandingDetailAPI();
                const tableData = data.standings[0].table.map((item) => ({
                    position: item.position,
                    team: item.team.name,
                    teamLogo: item.team.crest,
                    played: item.playedGames,
                    goalDifference: item.goalDifference,
                    points: item.points,
                }));
                setRankings(tableData);
                setLoading(false);
            } catch (err) {
                setError("Lỗi khi tải dữ liệu từ API");
                setLoading(false);
            }
        };

        fetchStandings();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ff85" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.leagueTableContainer}>
            <View style={styles.leagueTableHeader}>
                <View style={styles.positionCell}>
                    <Text style={styles.headerText}>Pos</Text>
                </View>
                <View style={styles.teamCell}>
                    <Text style={styles.headerText}>Club</Text>
                </View>
                <View style={styles.statsCell}>
                    <Text style={styles.headerText}>PL</Text>
                </View>
                <View style={styles.statsCell}>
                    <Text style={styles.headerText}>GD</Text>
                </View>
                <View style={styles.pointsCell}>
                    <Text style={styles.headerText}>Pts</Text>
                </View>
            </View>

            <ScrollView>
                {rankings.map((item, index) => {
                    const getPositionStyle = (position) => {
                        if (position <= 4) return styles.championsLeague;
                        if (position === 5) return styles.europaLeague;
                        if (position >= 18) return styles.relegation;
                        return null;
                    };

                    return (
                        <View
                            key={index}
                            style={[
                                styles.leagueTableRow,
                                getPositionStyle(item.position),
                            ]}
                        >
                            <View style={styles.positionCell}>
                                <Text style={styles.positionText}>
                                    {item.position}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/Club",
                                        params: { teamName1: item.team },
                                    })
                                }
                                style={styles.teamCell}
                            >
                                <Image
                                    source={{ uri: item.teamLogo }}
                                    style={styles.teamLogo}
                                />
                                <Text style={styles.teamText}>{item.team}</Text>
                            </TouchableOpacity>
                            <View style={styles.statsCell}>
                                <Text style={styles.statsText}>
                                    {item.played}
                                </Text>
                            </View>
                            <View style={styles.statsCell}>
                                <Text style={styles.statsText}>
                                    {item.goalDifference}
                                </Text>
                            </View>
                            <View style={styles.pointsCell}>
                                <Text style={styles.pointsText}>
                                    {item.points}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const ClubHighlight = () => {
    // return (
    //     <View style={styles.clubHighlight}>
    //         <LinearGradient
    //             colors={['#DA020E', '#C70000']}
    //             style={styles.clubHighlightGradient}
    //         >
    //             <View style={styles.clubHighlightContent}>
    //                 <Image
    //                     source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t1.png' }}
    //                     style={styles.clubHighlightLogo}
    //                 />
    //                 <Text style={styles.clubHighlightName}>Manchester United</Text>
    //                 <TouchableOpacity style={styles.clubHighlightButton}>
    //                     <Text style={styles.clubHighlightButtonText}>Official site</Text>
    //                     <Text style={styles.clubHighlightButtonIcon}>↗</Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </LinearGradient>
    //     </View>
    // );
};

const RelatedNews = () => {
    // const newsItems = [
    //     {
    //         id: 1,
    //         title: "Club News: What's changing things at Carrington",
    //         logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    //     },
    //     {
    //         id: 2,
    //         title: "Rashford: What's changing things at Carrington",
    //         logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    //     },
    //     {
    //         id: 3,
    //         title: "Club News: What's changing things at Carrington",
    //         logo: "https://resources.premierleague.com/premierleague/badges/t1.png"
    //     }
    // ];
    // return (
    //     <View style={styles.relatedNews}>
    //         <Text style={styles.sectionTitle}>Related News</Text>
    //         {newsItems.map((item) => (
    //             <View key={item.id} style={styles.relatedNewsItem}>
    //                 <Image
    //                     source={{ uri: item.logo }}
    //                     style={styles.relatedNewsLogo}
    //                 />
    //                 <Text style={styles.relatedNewsTitle}>{item.title}</Text>
    //             </View>
    //         ))}
    //         <TouchableOpacity style={styles.moreButton}>
    //             <Text style={styles.moreButtonText}>More News →</Text>
    //         </TouchableOpacity>
    //     </View>
    // );
};

const LatestNews = () => {
    const [newsItems, setNewsItems] = useState([]);

    useEffect(() => {
        fetchLatestNews();
    }, []);

    const fetchLatestNews = async () => {
        try {
            const result = await getNewsHighlight();
            const sliced = result.slice(0, 3).map((article) => ({
                id: article.id,
                title: article.headline,
                image: article.images?.[0]?.url || "",
                description: article.description || "",
                content: article.content || "",
                url: article.links?.web?.href || "",
                publishedDate: new Date(article.published).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                ),
            }));
            setNewsItems(sliced);
        } catch (err) {
            console.error("❌ Failed to fetch latest news:", err);
        }
    };

    return (
        <View style={styles.latestNews}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            {newsItems.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.latestNewsItem}
                    onPress={() => {
                        router.push({
                            pathname: "/homeNewsDetail",
                            params: {
                                id: item.id,
                                title: item.title,
                                image: item.image,
                                description: item.description,
                                content: item.content,
                                url: item.url,
                                publishedDate: item.publishedDate,
                            },
                        });
                    }}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={styles.latestNewsImage}
                    />
                    <Text style={styles.latestNewsTitle}>{item.title}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                style={styles.moreButton}
                onPress={() => router.push("/News")}
            >
                <Text style={styles.moreButtonText}>More News</Text>
            </TouchableOpacity>
        </View>
    );
};

const LatestVideos = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const result = await getVideosAPI();
            if (Array.isArray(result)) {
                setVideos(result.slice(0, 3));
            }
        } catch (err) {
            console.error("❌ Error fetching videos:", err);
        }
    };

    return (
        <View style={styles.latestVideos}>
            <Text style={styles.sectionTitle}>Latest Videos</Text>

            {videos.map((video, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.latestVideoItem}
                    onPress={() => {
                        router.push({
                            pathname: "/videoDetail",
                            params: {
                                url: video.url,
                                title: video.title,
                                thumbnail: video.thumbnail,
                            },
                        });
                    }}
                >
                    <Image
                        source={{ uri: video.thumbnail }}
                        style={styles.latestVideoImage}
                    />
                    <Text style={styles.latestVideoTitle}>{video.title}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                style={styles.moreButton}
                onPress={() => router.push("/Videos")}
            >
                <Text style={styles.moreButtonText}>More Videos</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    scrollView: {
        flex: 1,
    },
    headerContainer: {
        paddingTop: Platform.OS === "android" ? 20 : 0,
        paddingBottom: 15,
    },
    headerContent: {
        paddingHorizontal: 15,
    },
    headerTitle: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    headerDate: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 15,
        opacity: 0.9,
    },
    matchesContainer: {
        marginTop: 10,
    },
    matchCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    matchTeamContainer: {
        flex: 2,
        alignItems: "center",
    },
    matchTeamLogo: {
        width: 30,
        height: 30,
        marginBottom: 4,
    },
    matchTeamName: {
        color: "#333",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        width: "100%",
    },
    matchScoreContainer: {
        flex: 1.5,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    matchScore: {
        color: "#333",
        fontSize: 18,
        fontWeight: "bold",
    },
    matchTime: {
        color: "#333",
        fontSize: 14,
        fontWeight: "600",
    },
    matchStatus: {
        color: "#666",
        fontSize: 11,
        marginTop: 2,
    },
    loadingContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    loadingText: {
        color: "white",
        marginTop: 10,
    },
    noMatchesContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    noMatchesText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    newsHighlightContainer: {
        backgroundColor: "#37003C",
        paddingVertical: 20,
    },
    newsHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    newsLogo: {
        width: 200,
        height: 50,
    },
    newsCard: {
        marginHorizontal: 15,
        marginBottom: 20,
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: "#2C0031",
        elevation: 5,
    },
    newsImageContainer: {
        width: "100%",
        height: 200,
        borderRadius: 15,
        overflow: "hidden",
    },
    newsImage: {
        width: "100%",
        height: "100%",
    },
    newsTag: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#00ff85",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    newsTagText: {
        color: "#37003C",
        fontWeight: "bold",
        fontSize: 12,
    },
    newsContent: {
        padding: 15,
    },
    newsTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    newsDescription: {
        color: "#ffffff99",
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    newsDate: {
        color: "#ffffff80",
        fontSize: 12,
    },
    tabSelector: {
        flexDirection: "row",
        backgroundColor: "#f2f2f2",
        margin: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    tabButton: {
        flex: 1,
        padding: 15,
        alignItems: "center",
        backgroundColor: "#e0e0e0",
    },
    activeTabButton: {
        backgroundColor: "#00b2ff",
    },
    tabButtonText: {
        fontWeight: "bold",
        color: "#333",
    },
    tabContent: {
        margin: 10,
        marginTop: 0,
        backgroundColor: "white",
        borderRadius: 10,
        overflow: "hidden",
    },
    matchTabContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 15,
    },
    matchDateGroup: {
        marginBottom: 20,
    },
    matchDateText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    matchCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    matchTeamContainer: {
        flex: 2,
        alignItems: "center",
    },
    matchTeamLogo: {
        width: 30,
        height: 30,
        marginBottom: 4,
    },
    matchTeamName: {
        color: "#333",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
        width: "100%",
    },
    matchScoreContainer: {
        flex: 1.5,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    matchScore: {
        color: "#333",
        fontSize: 18,
        fontWeight: "bold",
    },
    matchTime: {
        color: "#333",
        fontSize: 14,
        fontWeight: "600",
    },
    matchStatus: {
        color: "#666",
        fontSize: 11,
        marginTop: 2,
    },
    leagueTableContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    leagueTableHeader: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerText: {
        color: "#333",
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
    leagueTableRow: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    positionCell: {
        width: 40,
        justifyContent: "center",
    },
    teamCell: {
        flex: 3,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 10,
    },
    statsCell: {
        width: 40,
        justifyContent: "center",
    },
    pointsCell: {
        width: 45,
        justifyContent: "center",
    },
    teamLogo: {
        width: 25,
        height: 25,
        marginRight: 8,
    },
    positionText: {
        color: "#333",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    teamText: {
        color: "#333",
        fontSize: 14,
        flex: 1,
    },
    statsText: {
        color: "#333",
        fontSize: 14,
        textAlign: "center",
    },
    pointsText: {
        color: "#333",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    championsLeague: {
        borderLeftWidth: 4,
        borderLeftColor: "#00ff85",
    },
    europaLeague: {
        borderLeftWidth: 4,
        borderLeftColor: "#FF7F00",
    },
    relegation: {
        borderLeftWidth: 4,
        borderLeftColor: "#FF4444",
    },
    latestNews: {
        margin: 10,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
    },
    latestNewsItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    latestNewsImage: {
        width: 80,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    latestNewsTitle: {
        flex: 1,
        fontSize: 14,
    },
    latestVideos: {
        margin: 10,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 80, // Extra space for bottom navigation
    },
    latestVideoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    latestVideoImage: {
        width: 80,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    latestVideoTitle: {
        flex: 1,
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 15,
    },
    moreButton: {
        alignItems: "center",
        marginTop: 5,
    },
    moreButtonText: {
        color: "#00b2ff",
        fontWeight: "bold",
    },
    liveMatchStatus: {
        color: "#ff0000",
        fontWeight: "bold",
    },
});

export default App;
