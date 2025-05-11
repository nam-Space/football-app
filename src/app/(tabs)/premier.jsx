import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    getCompetitionStandingDetailAPI,
    getMatchesAPI,
    getMatchesOfTeamIdAPI,
    getStatisticOfTeamIdAPI,
    getTeamDetailAPI,
} from "@/utils/api";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";

const ClubMatchesScreen = () => {
    const { user } = useApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teamInfo, setTeamInfo] = useState(null);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [pastMatches, setPastMatches] = useState([]);
    const [standings, setStandings] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [activeSection, setActiveSection] = useState("Fixtures");

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch team info
            const teamId = user?.team?.id || 66;
            const teamResponse = await getTeamDetailAPI(teamId);
            const teamData = teamResponse;
            setTeamInfo(teamData);

            // Fetch upcoming matches
            const upcomingResponse = await getMatchesOfTeamIdAPI(teamId, {
                status: "SCHEDULED,LIVE",
                limit: 5,
            });
            const upcomingData = upcomingResponse;
            setUpcomingMatches(upcomingData.matches || []);

            // Fetch past matches
            const pastResponse = await getMatchesOfTeamIdAPI(teamId, {
                status: "FINISHED",
                limit: 5,
            });
            const pastData = pastResponse;
            setPastMatches(pastData.matches || []);

            // Fetch standings
            const standingsResponse = await getCompetitionStandingDetailAPI();
            const standingsData = standingsResponse;
            setStandings(standingsData);

            // Fetch statistics
            const statsResponse = await getStatisticOfTeamIdAPI(teamId);
            const statsData = statsResponse;
            setStatistics(statsData.statistics);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data. Please try again.");
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-GB", options);
    };

    const formatTime = (dateString) => {
        const options = { hour: "2-digit", minute: "2-digit" };
        return new Date(dateString).toLocaleTimeString("en-GB", options);
    };

    const getTeamPosition = () => {
        if (!standings || !standings.standings || !standings.standings[0])
            return null;

        const table = standings.standings[0].table;
        const manUtdEntry = table.find(
            (entry) => entry.team.id == (user?.team?.id || 66)
        ); // Man Utd ID is 66

        return manUtdEntry
            ? {
                  position: manUtdEntry.position,
                  points: manUtdEntry.points,
                  played: manUtdEntry.playedGames,
                  won: manUtdEntry.won,
                  drawn: manUtdEntry.draw,
                  lost: manUtdEntry.lost,
                  goalsFor: manUtdEntry.goalsFor,
                  goalsAgainst: manUtdEntry.goalsAgainst,
                  goalDifference: manUtdEntry.goalDifference,
              }
            : null;
    };

    const convertDateFormat = (dateStr) => {
        const date = new Date(dateStr);
        date.setHours(date.getHours() + 7); // +7 giờ cho Việt Nam
        return date.toISOString().split("T")[0];
    };

    const renderMatch = ({ item }) => {
        const isFinished = item.status === "FINISHED";

        return (
            <TouchableOpacity
                style={styles.matchCard}
                onPress={() =>
                    router.push({
                        pathname: "/(main)/matchDetail",
                        params: {
                            homeTeamId: item.homeTeam.id,
                            awayTeamId: item.awayTeam.id,
                            matchDate: convertDateFormat(item.utcDate),
                        },
                    })
                }
            >
                <Text style={styles.matchDate}>{formatDate(item.utcDate)}</Text>
                <View style={styles.matchContent}>
                    <View style={styles.teamInfo}>
                        <Image
                            source={{ uri: item.homeTeam.crest }}
                            style={styles.teamLogo}
                        />
                        <Text style={styles.teamCode}>
                            {item.homeTeam.shortName || item.homeTeam.name}
                        </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        {isFinished ? (
                            <View style={styles.scoreBox}>
                                <Text style={styles.scoreText}>
                                    {item.score.fullTime.home} -{" "}
                                    {item.score.fullTime.away}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.matchTime}>
                                {formatTime(item.utcDate)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.teamInfo}>
                        <Image
                            source={{ uri: item.awayTeam.crest }}
                            style={styles.teamLogo}
                        />
                        <Text style={styles.teamCode}>
                            {item.awayTeam.shortName || item.awayTeam.name}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Loading data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="white"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchData}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const teamPosition = getTeamPosition();

    return (
        <View style={styles.container}>
            {/* Header */}
            <Image
                source={{
                    uri: "https://play-lh.googleusercontent.com/pJPgV--7ICYdqOyd6_8pgVXx9jIa81_YNLKI532jiGa9xBMZJarKRzgj76oYXUO7zK8",
                }}
                style={styles.plLogo}
                resizeMode="contain"
            />

            <Text style={styles.pageTitle}>
                {teamInfo
                    ? `${teamInfo.shortName || teamInfo.name} Matches`
                    : "Man Utd Matches"}
            </Text>

            {/* Upcoming Matches Carousel */}
            <FlatList
                horizontal
                data={upcomingMatches}
                renderItem={renderMatch}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                style={styles.matchesCarousel}
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>
                            No upcoming matches found
                        </Text>
                    </View>
                }
            />

            {/* Main Content */}
            <ScrollView style={styles.content}>
                {/* Fixtures Section */}
                <TouchableOpacity
                    style={styles.sectionCard}
                    onPress={() => router.push("/(main)/match")}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Fixtures</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                    {upcomingMatches.length > 0 && (
                        <View style={styles.fixturePreview}>
                            <Text style={styles.fixtureDate}>
                                {formatDate(upcomingMatches[0].utcDate)}
                            </Text>
                            <View style={styles.fixtureTeams}>
                                <Text style={styles.fixtureTeamCode}>
                                    {upcomingMatches[0].homeTeam.shortName}
                                </Text>
                                <Image
                                    source={{
                                        uri: upcomingMatches[0].homeTeam.crest,
                                    }}
                                    style={styles.fixtureTeamLogo}
                                />
                                <Text style={styles.fixtureTime}>
                                    {formatTime(upcomingMatches[0].utcDate)}
                                </Text>
                                <Image
                                    source={{
                                        uri: upcomingMatches[0].awayTeam.crest,
                                    }}
                                    style={styles.fixtureTeamLogo}
                                />
                                <Text style={styles.fixtureTeamCode}>
                                    {upcomingMatches[0].awayTeam.shortName}
                                </Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Results Section */}
                <TouchableOpacity
                    style={styles.sectionCard}
                    onPress={() => router.push("/(main)/result")}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Results</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                    {pastMatches.length > 0 && (
                        <View style={styles.fixturePreview}>
                            <Text style={styles.fixtureDate}>
                                {formatDate(pastMatches[0].utcDate)}
                            </Text>
                            <View style={styles.fixtureTeams}>
                                <Text style={styles.fixtureTeamCode}>
                                    {pastMatches[0].homeTeam.shortName}
                                </Text>
                                <Image
                                    source={{
                                        uri: pastMatches[0].homeTeam.crest,
                                    }}
                                    style={styles.fixtureTeamLogo}
                                />
                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreText}>
                                        {pastMatches[0].score.fullTime.home} -{" "}
                                        {pastMatches[0].score.fullTime.away}
                                    </Text>
                                </View>
                                <Image
                                    source={{
                                        uri: pastMatches[0].awayTeam.crest,
                                    }}
                                    style={styles.fixtureTeamLogo}
                                />
                                <Text style={styles.fixtureTeamCode}>
                                    {pastMatches[0].awayTeam.shortName}
                                </Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Tables Section */}
                <TouchableOpacity
                    style={styles.sectionCard}
                    onPress={() => router.push("/(main)/leagueTable")}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tables</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                    {teamPosition && (
                        <View style={styles.tablePreview}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tablePosition}>
                                    {teamPosition.position}
                                </Text>
                                <Image
                                    source={{ uri: teamInfo?.crest }}
                                    style={styles.tableTeamLogo}
                                />
                                <Text style={styles.tableTeamName}>
                                    {teamInfo?.name}
                                </Text>
                                <Text style={styles.tablePoints}>
                                    {teamPosition.points} pts
                                </Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Statistics Section */}
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Statistics</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                    <View style={styles.statsPreview}>
                        <Text style={styles.statsText}>Powered by</Text>
                        <Image
                            source={{
                                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_2IrYsXCCq7mTb0EFBxqqn9EJt8wOQGTboA&s",
                            }}
                            style={styles.oracleLogo}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>

                {/* News Section */}
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>News</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>

                {/* Videos Section */}
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Videos</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Watch Live</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Quizzes</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sectionCard, { marginTop: 30 }]}
                >
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Clubs</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Players</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Managers</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Injury News</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sectionCard, { marginTop: 30 }]}
                >
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Awards</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionCard}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>
                            Man of the Match
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sectionCard]}>
                    <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                        <Text style={styles.sectionTitle}>Transfers</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#37003C"
                        />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#37003C",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "white",
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: "white",
        marginTop: 10,
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: "#37003C",
        fontWeight: "bold",
    },
    plLogo: {
        width: "100%",
        height: 40,
        marginVertical: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    matchesCarousel: {
        maxHeight: 140,
        marginBottom: 20,
    },
    matchCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 10,
        width: 300,
    },
    matchDate: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
        textAlign: "center",
    },
    matchContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    teamInfo: {
        alignItems: "center",
        width: 80,
    },
    teamLogo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    teamCode: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
        marginVertical: 5,
    },
    scoreContainer: {
        alignItems: "center",
    },
    matchTime: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
    },
    content: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    sectionCard: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#37003C",
    },
    fixturePreview: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 15,
    },
    fixtureDate: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
    },
    fixtureTeams: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    fixtureTeamCode: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
        width: 80,
        textAlign: "center",
    },
    fixtureTeamLogo: {
        width: 30,
        height: 30,
        resizeMode: "contain",
    },
    fixtureTime: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
    },
    scoreBox: {
        backgroundColor: "#37003C",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
    },
    scoreText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    tablePreview: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 15,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    tablePosition: {
        width: 30,
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
    },
    tableTeamLogo: {
        width: 25,
        height: 25,
        marginRight: 10,
    },
    tableTeamName: {
        flex: 1,
        fontSize: 16,
        color: "#37003C",
    },
    tablePoints: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
    },
    statsPreview: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 15,
        alignItems: "center",
    },
    statsText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    oracleLogo: {
        width: "60%",
        height: 30,
    },
    emptyListContainer: {
        width: 300,
        height: 100,
        backgroundColor: "white",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    emptyListText: {
        color: "#666",
        fontSize: 16,
    },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    bottomTab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    bottomTabText: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
    },
    bottomTabActive: {
        color: "#37003C",
        fontWeight: "bold",
    },
});

export default ClubMatchesScreen;
