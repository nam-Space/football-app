import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    getCompetitionMatchesAPI,
    getPlayerImageAPI,
    getRelatedNewsAPI,
    getRelatedVideosAPI,
    getTeamDetailAPI,
    getTeamMatchesAPI,
} from "@/utils/api";

const MatchDetailsScreen = () => {
    let { homeTeamId, awayTeamId, matchDate } = useLocalSearchParams();

    homeTeamId = parseInt(homeTeamId);
    awayTeamId = parseInt(awayTeamId);

    const [match, setMatch] = useState(null);
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        mins: 0,
        secs: 0,
    });
    const [activeTab, setActiveTab] = useState("Related");
    const [loading, setLoading] = useState(true);
    const [headToHead, setHeadToHead] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [homeSquad, setHomeSquad] = useState([]);
    const [awaySquad, setAwaySquad] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("away");
    const [playerImages, setPlayerImages] = useState({});

    useEffect(() => {
        // Set up countdown timer
        const timer = setInterval(() => {
            updateCountdown(matchDate);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchTeams();
        fetchMatch();
    }, []);

    useEffect(() => {
        if (homeTeam?.squad && awayTeam?.squad) {
            fetchRelatedContent();

            const allPlayers = [...homeTeam.squad, ...awayTeam.squad];
            allPlayers.forEach((player) => {
                if (player.name) {
                    fetchPlayerImage(player.name);
                }
            });
        }
    }, [JSON.stringify(homeTeam), JSON.stringify(awayTeam)]);

    const fetchPlayerImage = async (playerName) => {
        try {
            // Only fetch if we don't already have this player's image
            if (!playerImages[playerName]) {
                const response = await getPlayerImageAPI(
                    encodeURIComponent(playerName)
                );
                const data = response;

                // Update the state with the new image URL
                setPlayerImages((prev) => ({
                    ...prev,
                    [playerName]: data.imageUrl,
                }));
            }
        } catch (error) {
            console.error(`Error fetching image for ${playerName}:`, error);
            // Set a default avatar in case of error
            setPlayerImages((prev) => ({
                ...prev,
                [playerName]: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    playerName
                )}&background=37003C&color=fff&size=250`,
            }));
        }
    };

    const fetchTeams = async () => {
        try {
            const homeResponse = await getTeamDetailAPI(homeTeamId);

            const homeData = homeResponse;
            setHomeTeam(homeData);
            setHomeSquad(homeData.squad || []);

            // Fetch away team
            const awayResponse = await getTeamDetailAPI(awayTeamId);

            const awayData = awayResponse;
            setAwayTeam(awayData);
            setAwaySquad(awayData.squad || []);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchMatch = async () => {
        try {
            setLoading(true);

            // Get matches for the competition around the date
            const dateObj = new Date(matchDate);
            const dateFrom = new Date(dateObj);
            dateFrom.setDate(dateFrom.getDate() - 3);
            const dateTo = new Date(dateObj);
            dateTo.setDate(dateTo.getDate() + 3);

            const fromStr = dateFrom.toISOString().split("T")[0];
            const toStr = dateTo.toISOString().split("T")[0];

            const response = await getCompetitionMatchesAPI({
                dateFrom: fromStr,
                dateTo: toStr,
            });
            const data = response;

            // Find the specific match
            const foundMatch = data.matches.find(
                (m) =>
                    (m.homeTeam.id === homeTeamId &&
                        m.awayTeam.id === awayTeamId) ||
                    (m.homeTeam.id === awayTeamId &&
                        m.awayTeam.id === homeTeamId)
            );

            if (foundMatch) {
                setMatch(foundMatch);
                updateCountdown(foundMatch.utcDate);
            } else {
                // If we can't find the match, create a mock one
                setMatch({
                    id: 123456,
                    utcDate: matchDate + "T03:00:00Z",
                    status: "SCHEDULED",
                    matchday: 26,
                    homeTeam: {
                        id: homeTeamId,
                        name: "Leicester City",
                        tla: "LEI",
                    },
                    awayTeam: {
                        id: awayTeamId,
                        name: "Manchester United",
                        tla: "MAN",
                    },
                    venue: "King Power Stadium, Leicester",
                });
            }

            // Fetch head to head data
            fetchHeadToHead();

            setLoading(false);
        } catch (error) {
            console.error("Error fetching match:", error);
            setLoading(false);

            // Create a mock match if API fails
            setMatch({
                id: 123456,
                utcDate: matchDate + "T03:00:00Z",
                status: "SCHEDULED",
                matchday: 26,
                homeTeam: {
                    id: homeTeamId,
                    name: "Leicester City",
                    tla: "LEI",
                },
                awayTeam: {
                    id: awayTeamId,
                    name: "Manchester United",
                    tla: "MAN",
                },
                venue: "King Power Stadium, Leicester",
            });
        }
    };

    const fetchHeadToHead = async () => {
        try {
            const homeResponse = await getTeamMatchesAPI(homeTeamId, {
                status: "FINISHED",
                limit: 20,
            });
            const homeData = homeResponse;

            const awayResponse = await getTeamMatchesAPI(awayTeamId, {
                status: "FINISHED",
                limit: 20,
            });
            const awayData = awayResponse;

            // Filter matches between these two teams for head-to-head

            const h2hMatches = homeData.matches.filter(
                (m) =>
                    (m.homeTeam.id === homeTeamId &&
                        m.awayTeam.id === awayTeamId) ||
                    (m.homeTeam.id === awayTeamId &&
                        m.awayTeam.id === homeTeamId)
            );

            // Process the data to create our head-to-head stats
            let homeWins = 0;
            let awayWins = 0;
            let draws = 0;
            let homeGoals = 0;
            let awayGoals = 0;

            const previousResults = h2hMatches.slice(0, 3).map((m) => {
                const isHomeTeamActuallyHome = m.homeTeam.id === homeTeamId;

                // Count wins/draws
                if (m.score.winner === "HOME_TEAM") {
                    isHomeTeamActuallyHome ? homeWins++ : awayWins++;
                } else if (m.score.winner === "AWAY_TEAM") {
                    isHomeTeamActuallyHome ? awayWins++ : homeWins++;
                } else {
                    draws++;
                }

                // Count goals
                if (isHomeTeamActuallyHome) {
                    homeGoals += m.score.fullTime.home || 0;
                    awayGoals += m.score.fullTime.away || 0;
                } else {
                    homeGoals += m.score.fullTime.away || 0;
                    awayGoals += m.score.fullTime.home || 0;
                }

                // Format for display
                const matchDate = new Date(m.utcDate);
                return {
                    date: `${matchDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    })}`,
                    homeTeam: isHomeTeamActuallyHome
                        ? homeTeam?.tla || "LEI"
                        : awayTeam?.tla || "MAN",
                    homeScore: isHomeTeamActuallyHome
                        ? m.score.fullTime.home
                        : m.score.fullTime.away,
                    awayTeam: isHomeTeamActuallyHome
                        ? awayTeam?.tla || "MAN"
                        : homeTeam?.tla || "LEI",
                    awayScore: isHomeTeamActuallyHome
                        ? m.score.fullTime.away
                        : m.score.fullTime.home,
                };
            });

            // Calculate form guide for both teams
            const homeTeamForm = calculateTeamForm(
                homeData.matches,
                homeTeamId
            );
            const awayTeamForm = calculateTeamForm(
                awayData.matches,
                awayTeamId
            );

            // Calculate season stats for both teams
            const homeTeamStats = calculateSeasonStats(
                homeData.matches,
                homeTeamId
            );
            const awayTeamStats = calculateSeasonStats(
                awayData.matches,
                awayTeamId
            );

            setHeadToHead({
                played: h2hMatches.length,
                homeWins,
                draws,
                awayWins,
                homeGoals,
                awayGoals,
                previousResults,
                formGuide: homeTeamForm.map((home, index) => ({
                    home,
                    away: awayTeamForm[index] || "0-0 v TBD (H)",
                })),
                thisSeason: {
                    homePlayed: homeTeamStats.played,
                    homeWon: homeTeamStats.won,
                    homeDrawn: homeTeamStats.drawn,
                    homeLost: homeTeamStats.lost,
                    homeAvgGoalsScored: homeTeamStats.avgGoalsScored,
                    homeAvgGoalsConceded: homeTeamStats.avgGoalsConceded,
                    awayPlayed: awayTeamStats.played,
                    awayWon: awayTeamStats.won,
                    awayDrawn: awayTeamStats.drawn,
                    awayLost: awayTeamStats.lost,
                    awayAvgGoalsScored: awayTeamStats.avgGoalsScored,
                    awayAvgGoalsConceded: awayTeamStats.avgGoalsConceded,
                },
            });
        } catch (error) {
            console.error("Error fetching head to head:", error);

            // Use mock data if API fails
            setHeadToHead({
                played: 19,
                homeWins: 5,
                draws: 5,
                awayWins: 9,
                homeGoals: 19,
                awayGoals: 19,
                previousResults: [
                    {
                        date: "Saturday 23 November",
                        homeTeam: "Leicester",
                        homeScore: 0,
                        awayTeam: "Man",
                        awayScore: 3,
                    },
                    {
                        date: "Saturday 23 November",
                        homeTeam: "Leicester",
                        homeScore: 1,
                        awayTeam: "Man",
                        awayScore: 2,
                    },
                    {
                        date: "Saturday 23 November",
                        homeTeam: "Leicester",
                        homeScore: 0,
                        awayTeam: "Man",
                        awayScore: 1,
                    },
                ],
                formGuide: [
                    { home: "4-0 v BOU (H)", away: "2-0 v WHU (A)" },
                    { home: "4-0 v BOU (H)", away: "2-0 v WHU (A)" },
                    { home: "4-0 v BOU (H)", away: "2-0 v WHU (A)" },
                    { home: "4-0 v BOU (H)", away: "2-0 v WHU (A)" },
                    { home: "4-0 v BOU (H)", away: "2-0 v WHU (A)" },
                ],
                thisSeason: {
                    homePlayed: 5,
                    homeWon: 5,
                    homeDrawn: 5,
                    homeLost: 5,
                    homeAvgGoalsScored: 19,
                    homeAvgGoalsConceded: 19,
                    awayPlayed: 5,
                    awayWon: 5,
                    awayDrawn: 5,
                    awayLost: 5,
                    awayAvgGoalsScored: 19,
                    awayAvgGoalsConceded: 19,
                },
            });
        }
    };

    const calculateTeamForm = (matches, teamId) => {
        // Sort matches by date (newest first)
        const sortedMatches = [...matches].sort(
            (a, b) => new Date(b.utcDate) - new Date(a.utcDate)
        );

        // Take the 5 most recent matches
        return sortedMatches.slice(0, 5).map((match) => {
            const isHome = match.homeTeam.id === teamId;
            const opponent = isHome ? match.awayTeam : match.homeTeam;
            const opponentTla =
                opponent.tla || opponent.name.substring(0, 3).toUpperCase();

            let result = "";
            if (match.score && match.score.fullTime) {
                const teamGoals = isHome
                    ? match.score.fullTime.home
                    : match.score.fullTime.away;
                const opponentGoals = isHome
                    ? match.score.fullTime.away
                    : match.score.fullTime.home;

                result = `${teamGoals}-${opponentGoals} v ${opponentTla} (${
                    isHome ? "H" : "A"
                })`;
            } else {
                result = `0-0 v ${opponentTla} (${isHome ? "H" : "A"})`;
            }

            return result;
        });
    };

    const calculateSeasonStats = (matches, teamId) => {
        let played = 0;
        let won = 0;
        let drawn = 0;
        let lost = 0;
        let goalsScored = 0;
        let goalsConceded = 0;

        matches.forEach((match) => {
            if (match.status !== "FINISHED") return;

            played++;
            const isHome = match.homeTeam.id === teamId;

            // Calculate goals
            if (match.score && match.score.fullTime) {
                const teamGoals = isHome
                    ? match.score.fullTime.home
                    : match.score.fullTime.away;
                const opponentGoals = isHome
                    ? match.score.fullTime.away
                    : match.score.fullTime.home;

                goalsScored += teamGoals || 0;
                goalsConceded += opponentGoals || 0;

                // Calculate result
                if (match.score.winner === "HOME_TEAM") {
                    isHome ? won++ : lost++;
                } else if (match.score.winner === "AWAY_TEAM") {
                    isHome ? lost++ : won++;
                } else {
                    drawn++;
                }
            }
        });

        return {
            played,
            won,
            drawn,
            lost,
            avgGoalsScored: played > 0 ? (goalsScored / played).toFixed(1) : 0,
            avgGoalsConceded:
                played > 0 ? (goalsConceded / played).toFixed(1) : 0,
        };
    };

    // Add loading states for news and videos
    const [relatedNewsLoading, setRelatedNewsLoading] = useState(false);
    const [relatedVideosLoading, setRelatedVideosLoading] = useState(false);

    const fetchRelatedContent = async () => {
        try {
            setRelatedNewsLoading(true);
            setRelatedVideosLoading(true);

            // Use team names instead of IDs for better search results
            const homeTeamName =
                homeTeam?.name || match?.homeTeam?.name || "Premier League";
            const awayTeamName =
                awayTeam?.name || match?.awayTeam?.name || "Football";

            // Fetch news and videos in parallel
            const [
                newsHomeTeamResponse,
                newsAwayTeamResponse,
                videosHomeTeamResponse,
                videosAwayTeamResponse,
            ] = await Promise.all([
                getRelatedNewsAPI(encodeURIComponent(homeTeamName)),
                getRelatedNewsAPI(encodeURIComponent(awayTeamName)),
                getRelatedVideosAPI(encodeURIComponent(homeTeamName)),
                getRelatedVideosAPI(encodeURIComponent(awayTeamName)),
            ]);

            const newsHomeTeamData = newsHomeTeamResponse;
            const newsAwayTeamData = newsAwayTeamResponse;
            const videosHomeTeamData = videosHomeTeamResponse;
            const videosAwayTeamData = videosAwayTeamResponse;

            setRelatedNews(
                [...newsHomeTeamData.news, ...newsAwayTeamData.news] || []
            );
            setRelatedVideos(
                [...videosHomeTeamData.videos, ...videosAwayTeamData.videos] ||
                    []
            );
        } catch (error) {
            console.error("Error fetching related content:", error);
            // Set empty arrays on error
            setRelatedNews([]);
            setRelatedVideos([]);
        } finally {
            setRelatedNewsLoading(false);
            setRelatedVideosLoading(false);
        }
    };

    const updateCountdown = (matchDate) => {
        const now = new Date();
        const matchTime = new Date(matchDate);
        const diff = matchTime - now;

        if (diff <= 0) {
            setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, mins, secs });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `Sat ${date.getDate()} ${date.toLocaleString("default", {
            month: "short",
        })} ${date.getFullYear()}`;
    };

    const renderMatchCard = () => {
        // Format the match time from the UTC date
        const getMatchTime = () => {
            if (!match || !match.utcDate) return "03:00";

            const matchDate = new Date(match.utcDate);
            return matchDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        };

        return (
            <View style={styles.matchCard}>
                <View style={styles.sponsorRow}>
                    <Text style={styles.sponsorText}>HUBLOT</Text>
                    <View style={styles.countdownContainer}>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownNumber}>
                                {countdown.days}
                            </Text>
                            <Text style={styles.countdownLabel}>Days</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownNumber}>
                                {countdown.hours}
                            </Text>
                            <Text style={styles.countdownLabel}>Hrs</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownNumber}>
                                {countdown.mins}
                            </Text>
                            <Text style={styles.countdownLabel}>Mins</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownNumber}>
                                {countdown.secs}
                            </Text>
                            <Text style={styles.countdownLabel}>Secs</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.teamsContainer}>
                    <View style={styles.teamContainer}>
                        <Image
                            source={{
                                uri:
                                    homeTeam?.crest ||
                                    "https://crests.football-data.org/338.png",
                            }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <View style={[styles.teamBadge, styles.homeTeamBadge]}>
                            <Text style={styles.teamBadgeText}>
                                {homeTeam?.tla || "LEI"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.matchTimeContainer}>
                        <Text style={styles.matchTime}>{getMatchTime()}</Text>
                    </View>

                    <View style={styles.teamContainer}>
                        <Image
                            source={{
                                uri:
                                    awayTeam?.crest ||
                                    "https://crests.football-data.org/66.png",
                            }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <View style={[styles.teamBadge, styles.awayTeamBadge]}>
                            <Text style={styles.teamBadgeText}>
                                {awayTeam?.tla || "MAN"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.matchInfoContainer}>
                    <Text style={styles.matchDate}>
                        {match ? formatDate(match.utcDate) : "Sat 22 Feb 2025"}
                    </Text>
                    <Text style={styles.matchVenue}>
                        {match?.venue || "King Power Stadium, Leicester"}
                    </Text>
                </View>
            </View>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {["Related", "Stats", "Squads"].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText,
                        ]}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderRelatedContent = () => (
        <ScrollView style={styles.contentContainer}>
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Related News</Text>
                {relatedNewsLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#37003C"
                        style={styles.loadingIndicator}
                    />
                ) : relatedNews.length > 0 ? (
                    <>
                        {relatedNews.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.newsItem}
                                onPress={() => {
                                    // Open the news article in browser
                                    router.push({
                                        pathname: "/(main)/newsDetail",
                                        params: {
                                            id: item.id,
                                        },
                                    });
                                }}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.newsImage}
                                    defaultSource={{
                                        uri: `https://picsum.photos/seed/news-${item.id}/500/300`,
                                    }}
                                />
                                <View style={styles.newsContent}>
                                    <Text style={styles.newsTag}>
                                        {item.tag || "News"}
                                    </Text>
                                    <Text
                                        style={styles.newsTitle}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                    {item.publishedAt && (
                                        <Text style={styles.newsDate}>
                                            {new Date(
                                                item.publishedAt
                                            ).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => {
                                // Open Google search for more news
                                const searchQuery = `${
                                    homeTeam?.name || "Premier League"
                                } football news`;
                                Linking.openURL(
                                    `https://www.google.com/search?q=${encodeURIComponent(
                                        searchQuery
                                    )}&tbm=nws`
                                );
                            }}
                        >
                            <Text style={styles.moreButtonText}>More News</Text>
                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color="#37003C"
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyContent}>
                        <Text style={styles.emptyText}>
                            No related news available
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Related Videos</Text>
                {relatedVideosLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#37003C"
                        style={styles.loadingIndicator}
                    />
                ) : relatedVideos.length > 0 ? (
                    <>
                        {relatedVideos.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.newsItem}
                                onPress={() => {
                                    // Open the YouTube video
                                    Linking.openURL(item.url);
                                }}
                            >
                                <View style={styles.videoImageContainer}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.newsImage}
                                        defaultSource={{
                                            uri: `https://picsum.photos/seed/video-${item.id}/500/300`,
                                        }}
                                    />
                                    <View
                                    // style={{
                                    //     position: "absolute",
                                    //     // left: 0,
                                    //     bottom: 0,
                                    //     right: 16,
                                    // }}
                                    >
                                        <View style={styles.playButton}>
                                            <Ionicons
                                                name="play"
                                                size={16}
                                                color="white"
                                            />
                                        </View>
                                        {item.duration && (
                                            <View style={styles.videoDuration}>
                                                <Text
                                                    style={styles.durationText}
                                                >
                                                    {item.duration}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.newsContent}>
                                    <View style={styles.videoMetaRow}>
                                        <Text style={styles.newsTag}>
                                            {item.channelTitle || "YouTube"}
                                        </Text>
                                        {item.viewCount && (
                                            <Text style={styles.viewCount}>
                                                {item.viewCount}
                                            </Text>
                                        )}
                                    </View>
                                    <Text
                                        style={styles.newsTitle}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                    {item.publishedAt && (
                                        <Text style={styles.newsDate}>
                                            {new Date(
                                                item.publishedAt
                                            ).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => {
                                // Open YouTube search for more videos
                                const searchQuery = `${
                                    awayTeam?.name || "Premier League"
                                } football highlights`;
                                Linking.openURL(
                                    `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                        searchQuery
                                    )}`
                                );
                            }}
                        >
                            <Text style={styles.moreButtonText}>
                                More Videos
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color="#37003C"
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyContent}>
                        <Text style={styles.emptyText}>
                            No related videos available
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );

    const renderStatsContent = () => (
        <ScrollView style={styles.contentContainer}>
            {headToHead && (
                <>
                    <View style={styles.statsSection}>
                        <Text style={styles.statsSectionTitle}>
                            Head to Head
                        </Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsNumber}>
                                    {headToHead.homeWins}
                                </Text>
                            </View>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsLabel}>
                                    Played: {headToHead.played}
                                </Text>
                            </View>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsNumber}>
                                    {headToHead.awayWins}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsLabel}>
                                    Draws: {headToHead.draws}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsNumber}>
                                    {headToHead.homeGoals}
                                </Text>
                                <Text style={styles.statsLabel}>Goals</Text>
                            </View>
                            <View style={styles.statsColumn}>
                                <Text style={styles.statsNumber}>
                                    {headToHead.awayGoals}
                                </Text>
                                <Text style={styles.statsLabel}>Goals</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsSection}>
                        <Text style={styles.statsSectionTitle}>
                            Previous Results
                        </Text>
                        {headToHead.previousResults.map((result, index) => (
                            <View key={index} style={styles.previousResult}>
                                <Text style={styles.resultDate}>
                                    {result.date}
                                </Text>
                                <View style={styles.resultRow}>
                                    <View style={styles.resultTeam}>
                                        <Image
                                            source={{
                                                uri:
                                                    homeTeam?.crest ||
                                                    "https://crests.football-data.org/338.png",
                                            }}
                                            style={styles.resultTeamLogo}
                                        />
                                        <Text style={styles.resultTeamName}>
                                            {result.homeTeam}
                                        </Text>
                                    </View>
                                    <View style={styles.resultScore}>
                                        <Text style={styles.resultScoreText}>
                                            {result.homeScore} -{" "}
                                            {result.awayScore}
                                        </Text>
                                    </View>
                                    <View style={styles.resultTeam}>
                                        <Image
                                            source={{
                                                uri:
                                                    awayTeam?.crest ||
                                                    "https://crests.football-data.org/66.png",
                                            }}
                                            style={styles.resultTeamLogo}
                                        />
                                        <Text style={styles.resultTeamName}>
                                            {result.awayTeam}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color="#37003C"
                                    />
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.moreButton}>
                            <Text style={styles.moreButtonText}>
                                View all results
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color="#37003C"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsSection}>
                        <Text style={styles.statsSectionTitle}>Form Guide</Text>
                        {headToHead.formGuide.map((form, index) => (
                            <View key={index} style={styles.formRow}>
                                <View style={styles.formTeam}>
                                    <View style={styles.formBadge}>
                                        <Image
                                            source={{
                                                uri:
                                                    homeTeam?.crest ||
                                                    "https://crests.football-data.org/338.png",
                                            }}
                                            style={styles.formTeamLogo}
                                        />
                                    </View>
                                    <Text style={styles.formText}>
                                        {form.home}
                                    </Text>
                                </View>
                                <View style={styles.formTeam}>
                                    <View style={styles.formBadge}>
                                        <Image
                                            source={{
                                                uri:
                                                    awayTeam?.crest ||
                                                    "https://crests.football-data.org/66.png",
                                            }}
                                            style={styles.formTeamLogo}
                                        />
                                    </View>
                                    <Text style={styles.formText}>
                                        {form.away}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.statsSection}>
                        <Text style={styles.statsSectionTitle}>
                            This Season
                        </Text>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>Played</Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homePlayed}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayPlayed}
                            </Text>
                        </View>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>Won</Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homeWon}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayWon}
                            </Text>
                        </View>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>Drawn</Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homeDrawn}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayDrawn}
                            </Text>
                        </View>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>Lost</Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homeLost}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayLost}
                            </Text>
                        </View>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>
                                Avg Goals Scored Per Match
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homeAvgGoalsScored}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayAvgGoalsScored}
                            </Text>
                        </View>
                        <View style={styles.seasonStatsRow}>
                            <Text style={styles.seasonStatsLabel}>
                                Avg Goals Conceded Per Match
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.homeAvgGoalsConceded}
                            </Text>
                            <Text style={styles.seasonStatsNumber}>
                                {headToHead.thisSeason.awayAvgGoalsConceded}
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );

    const renderSquadsContent = () => {
        // Create position groups for display
        const getPositionGroups = (squad) => {
            const groups = {};

            // If we have real squad data, use it
            if (squad && squad.length > 0) {
                squad.forEach((player) => {
                    if (groups[player.position]) {
                        groups[player.position].push(player);
                    } else {
                        groups[player.position] = [];
                        groups[player.position].push(player);
                    }
                });
            } else {
                // Otherwise use mock data
                const mockPlayers = [
                    {
                        id: 1,
                        name: "Danny Ward",
                        position: "Goalkeeper",
                        nationality: "Wales",
                        number: 1,
                    },
                    {
                        id: 2,
                        name: "Danny Ward",
                        position: "Goalkeeper",
                        nationality: "Wales",
                        number: 2,
                    },
                    {
                        id: 3,
                        name: "Danny Ward",
                        position: "Goalkeeper",
                        nationality: "Wales",
                        number: 3,
                    },
                    {
                        id: 4,
                        name: "Danny Ward",
                        position: "Goalkeeper",
                        nationality: "Wales",
                        number: 4,
                    },
                    {
                        id: 5,
                        name: "Danny Ward",
                        position: "Goalkeeper",
                        nationality: "Wales",
                        number: 5,
                    },
                    {
                        id: 6,
                        name: "Danny Ward",
                        position: "Defender",
                        nationality: "Wales",
                        number: 1,
                    },
                    {
                        id: 7,
                        name: "Danny Ward",
                        position: "Defender",
                        nationality: "Wales",
                        number: 2,
                    },
                    {
                        id: 8,
                        name: "Danny Ward",
                        position: "Defender",
                        nationality: "Wales",
                        number: 3,
                    },
                    {
                        id: 9,
                        name: "Danny Ward",
                        position: "Defender",
                        nationality: "Wales",
                        number: 4,
                    },
                    {
                        id: 10,
                        name: "Danny Ward",
                        position: "Defender",
                        nationality: "Wales",
                        number: 5,
                    },
                    {
                        id: 11,
                        name: "Danny Ward",
                        position: "Midfielder",
                        nationality: "Wales",
                        number: 1,
                    },
                    {
                        id: 12,
                        name: "Danny Ward",
                        position: "Midfielder",
                        nationality: "Wales",
                        number: 2,
                    },
                    {
                        id: 13,
                        name: "Danny Ward",
                        position: "Midfielder",
                        nationality: "Wales",
                        number: 3,
                    },
                    {
                        id: 14,
                        name: "Danny Ward",
                        position: "Midfielder",
                        nationality: "Wales",
                        number: 4,
                    },
                    {
                        id: 15,
                        name: "Danny Ward",
                        position: "Midfielder",
                        nationality: "Wales",
                        number: 5,
                    },
                ];

                mockPlayers.forEach((player) => {
                    if (groups[player.position]) {
                        groups[player.position].push(player);
                    }
                });
            }

            return groups;
        };

        const currentSquad = selectedTeam === "home" ? homeSquad : awaySquad;
        const positionGroups = getPositionGroups(currentSquad);

        return (
            <ScrollView style={styles.contentContainer}>
                <View style={styles.teamSelector}>
                    <TouchableOpacity
                        style={[
                            styles.teamTab,
                            selectedTeam === "away" && styles.selectedTeamTab,
                        ]}
                        onPress={() => setSelectedTeam("away")}
                    >
                        <Text
                            style={[
                                styles.teamTabText,
                                selectedTeam === "away" &&
                                    styles.selectedTeamTabText,
                            ]}
                        >
                            {awayTeam?.name || "Manchester United"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.teamTab,
                            selectedTeam === "home" && styles.selectedTeamTab,
                        ]}
                        onPress={() => setSelectedTeam("home")}
                    >
                        <Text
                            style={[
                                styles.teamTabText,
                                selectedTeam === "home" &&
                                    styles.selectedTeamTabText,
                            ]}
                        >
                            {homeTeam?.name || "Leicester"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {Object.entries(positionGroups).map(
                    ([position, players]) =>
                        players.length > 0 && (
                            <View key={position} style={styles.positionSection}>
                                <Text style={styles.positionTitle}>
                                    {position}s
                                </Text>
                                {players.map((player, index) => (
                                    <View key={index} style={styles.playerRow}>
                                        <Text style={styles.playerNumber}>
                                            {player.number || index + 1}
                                        </Text>
                                        {playerImages[player.name] ? (
                                            <Image
                                                source={{
                                                    uri: playerImages[
                                                        player.name
                                                    ],
                                                }}
                                                style={styles.playerImage}
                                            />
                                        ) : (
                                            <ActivityIndicator
                                                size="large"
                                                color="#37003C"
                                                style={{ marginRight: 12 }}
                                            />
                                        )}

                                        <View style={styles.playerInfo}>
                                            <Text style={styles.playerName}>
                                                {player.name}
                                            </Text>
                                            <View
                                                style={
                                                    styles.nationalityContainer
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.nationalityText
                                                    }
                                                >
                                                    {player.nationality}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color="#37003C"
                                        />
                                    </View>
                                ))}
                            </View>
                        )
                )}
            </ScrollView>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Related":
                return renderRelatedContent();
            case "Stats":
                return renderStatsContent();
            case "Squads":
                return renderSquadsContent();
            default:
                return renderRelatedContent();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderMatchCard()}
            {renderTabs()}
            {renderContent()}
        </SafeAreaView>
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
        backgroundColor: "#37003C",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    notificationButton: {
        padding: 4,
    },
    matchCard: {
        backgroundColor: "white",
        margin: 16,
        borderRadius: 8,
        overflow: "hidden",
    },
    sponsorRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
    },
    sponsorText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    countdownContainer: {
        flexDirection: "row",
    },
    countdownItem: {
        alignItems: "center",
        marginHorizontal: 4,
    },
    countdownNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#00B2FF",
    },
    countdownLabel: {
        fontSize: 10,
        color: "#666",
    },
    teamsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    teamContainer: {
        alignItems: "center",
    },
    teamLogo: {
        width: 40,
        height: 40,
        marginBottom: 8,
    },
    teamBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    homeTeamBadge: {
        backgroundColor: "#0057B8",
    },
    awayTeamBadge: {
        backgroundColor: "#DA291C",
    },
    teamBadgeText: {
        color: "white",
        fontWeight: "bold",
    },
    matchTimeContainer: {
        alignItems: "center",
    },
    matchTime: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    matchInfoContainer: {
        alignItems: "center",
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    matchDate: {
        fontSize: 14,
        color: "#333",
    },
    matchVenue: {
        fontSize: 12,
        color: "#666",
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "white",
        marginHorizontal: 16,
        borderRadius: 8,
        overflow: "hidden",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: "#37003C",
    },
    tabText: {
        color: "#37003C",
        fontWeight: "500",
    },
    activeTabText: {
        color: "white",
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        marginTop: 8,
    },
    sectionContainer: {
        backgroundColor: "white",
        marginBottom: 8,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#37003C",
        marginBottom: 12,
    },
    newsItem: {
        flexDirection: "row",
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
    },
    newsImage: {
        width: 100,
        height: 60,
        borderRadius: 4,
    },
    videoImageContainer: {
        position: "relative",
    },
    playButton: {
        position: "absolute",
        bottom: 4,
        left: 4,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    videoDuration: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    durationText: {
        color: "white",
        fontSize: 10,
        fontWeight: "500",
    },
    newsContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    newsTag: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    moreButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        paddingVertical: 8,
    },
    moreButtonText: {
        color: "#37003C",
        fontWeight: "500",
        marginRight: 4,
    },
    statsSection: {
        backgroundColor: "white",
        padding: 16,
        marginBottom: 8,
    },
    statsSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statsColumn: {
        flex: 1,
        alignItems: "center",
    },
    statsNumber: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#37003C",
    },
    statsLabel: {
        fontSize: 14,
        color: "#666",
    },
    previousResult: {
        marginBottom: 12,
    },
    resultDate: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    resultTeam: {
        flexDirection: "row",
        alignItems: "center",
    },
    resultTeamLogo: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
    resultTeamName: {
        fontSize: 14,
        color: "#333",
    },
    resultScore: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    resultScoreText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    formRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    formTeam: {
        flexDirection: "row",
        alignItems: "center",
    },
    formBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    formTeamLogo: {
        width: 16,
        height: 16,
    },
    formText: {
        fontSize: 14,
        color: "#333",
    },
    seasonStatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    seasonStatsLabel: {
        flex: 2,
        fontSize: 14,
        color: "#333",
    },
    seasonStatsNumber: {
        flex: 1,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
        color: "#37003C",
    },
    teamSelector: {
        flexDirection: "row",
        backgroundColor: "white",
        marginBottom: 8,
    },
    teamTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    selectedTeamTab: {
        backgroundColor: "#37003C",
    },
    teamTabText: {
        color: "#37003C",
        fontWeight: "500",
    },
    selectedTeamTabText: {
        color: "white",
    },
    positionSection: {
        backgroundColor: "white",
        marginBottom: 8,
    },
    positionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    playerRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    playerNumber: {
        width: 24,
        fontSize: 14,
        fontWeight: "bold",
        color: "#37003C",
    },
    playerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 4,
    },
    nationalityContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    nationalityText: {
        fontSize: 12,
        color: "#666",
    },
});

export default MatchDetailsScreen;
