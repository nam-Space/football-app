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
    getBattleByTeamIdAPI,
    getBattleCommentaryByBattleIdAPI,
    getBattleCommentaryByTeamIdAPI,
    getBattleHeadToHeadByTeamIdAPI,
    getBattleHighlightByTeamIdAPI,
    getBattleLineupByIdAPI,
    getBattleReportByIdAPI,
    getBattleReportByTeamIdAPI,
    getBattleStatisticByIdAPI,
    getBattleStatisticByTeamIdAPI,
    getCompetitionMatchesAPI,
    getRelatedNewsBattleAPI,
    getRelatedVideosBattleAPI,
    getTeamDetailAPI,
} from "@/utils/api";

const SERVER_URL = "http://192.168.1.183:8080"; // Use this for Android emulator

const BattleDetailsScreen = () => {
    let { homeTeamId, awayTeamId, matchDate } = useLocalSearchParams();

    homeTeamId = parseInt(homeTeamId);
    awayTeamId = parseInt(awayTeamId);

    const [match, setMatch] = useState(null);
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Latest");
    const [matchStats, setMatchStats] = useState(null);
    const [matchReport, setMatchReport] = useState("");
    const [headToHead, setHeadToHead] = useState(null);
    const [previousResults, setPreviousResults] = useState([]);
    const [formGuide, setFormGuide] = useState([]);
    const [seasonStats, setSeasonStats] = useState(null);
    const [matchHighlights, setMatchHighlights] = useState([]);
    const [liveCommentary, setLiveCommentary] = useState([]);
    const [relatedNews, setRelatedNews] = useState([]);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [highlightsLoading, setHighlightsLoading] = useState(true);
    const [commentaryLoading, setCommentaryLoading] = useState(true);
    const [relatedNewsLoading, setRelatedNewsLoading] = useState(true);
    const [relatedVideosLoading, setRelatedVideosLoading] = useState(true);
    const [h2hLoading, setH2hLoading] = useState(true);

    const [activeLineupTab, setActiveLineupTab] = useState("away");

    const [lineups, setLineups] = useState(null);
    const [lineupsLoading, setLineupsLoading] = useState(false);

    useEffect(() => {
        fetchMatch();
        fetchTeams();
    }, []);

    useEffect(() => {
        if (match && homeTeam && awayTeam) {
            fetchMatchStats();
            fetchMatchReport();
            fetchHeadToHead();
            fetchMatchHighlights();
            fetchLiveCommentary();
            fetchRelatedContent();
            // fetchLineups();
        }
    }, [match, homeTeam, awayTeam]);

    const fetchMatch = async () => {
        try {
            setLoading(true);

            // Get match details using the battle endpoint
            // const response = await fetch(
            //     `${SERVER_URL}/api/battle?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}&date=${matchDate}`
            // );

            const response = await getBattleByTeamIdAPI({
                homeTeamId,
                awayTeamId,
                date: matchDate,
            });

            if (!response) {
                throw new Error(`Fallback API error: getBattleByTeamIdAPI`);
            }

            const data = response;
            setMatch(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching match:", error);

            // Try to fetch from competition-matches as fallback
            try {
                const dateObj = new Date(matchDate);
                const dateFrom = new Date(dateObj);
                dateFrom.setDate(dateFrom.getDate() - 3);
                const dateTo = new Date(dateObj);
                dateTo.setDate(dateTo.getDate() + 3);

                const fromStr = dateFrom.toISOString().split("T")[0];
                const toStr = dateTo.toISOString().split("T")[0];

                // const fallbackResponse = await fetch(
                //     `${SERVER_URL}/api/competition-matches?dateFrom=${fromStr}&dateTo=${toStr}`
                // );

                const fallbackResponse = await getCompetitionMatchesAPI({
                    dateFrom: fromStr,
                    dateTo: toStr,
                });

                if (!fallbackResponse) {
                    throw new Error(
                        `Fallback API error: getCompetitionMatchesAPI`
                    );
                }

                const fallbackData = fallbackResponse;

                // Find the specific match
                const foundMatch = fallbackData.matches.find(
                    (m) =>
                        (m.homeTeam.id === homeTeamId &&
                            m.awayTeam.id === awayTeamId) ||
                        (m.homeTeam.id === awayTeamId &&
                            m.awayTeam.id === homeTeamId)
                );

                if (foundMatch) {
                    setMatch(foundMatch);
                } else {
                    throw new Error("Match not found in fallback data");
                }
            } catch (fallbackError) {
                console.error("Error in fallback match fetch:", fallbackError);

                // Create a mock match as last resort
                setMatch({
                    id: 123456,
                    utcDate: matchDate || "2022-08-07T15:00:00Z",
                    status: "FINISHED",
                    matchday: 26,
                    score: {
                        fullTime: {
                            home: 2,
                            away: 2,
                        },
                        halfTime: {
                            home: 1,
                            away: 0,
                        },
                    },
                    homeTeam: {
                        id: homeTeamId,
                        name: "Leicester City",
                        tla: "LEI",
                        crest: "https://crests.football-data.org/338.png",
                    },
                    awayTeam: {
                        id: awayTeamId,
                        name: "Manchester United",
                        tla: "MAN",
                        crest: "https://crests.football-data.org/66.png",
                    },
                    venue: "King Power Stadium, Leicester",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchTeams = async () => {
        try {
            // Fetch home team
            // const homeResponse = await fetch(
            //     `${SERVER_URL}/api/teams/${homeTeamId}`
            // );
            const homeResponse = await getTeamDetailAPI(homeTeamId);

            if (!homeResponse) {
                throw new Error(`Home team API error: getTeamDetailAPI`);
            }

            const homeData = homeResponse;
            setHomeTeam(homeData);

            // Fetch away team
            // const awayResponse = await fetch(
            //     `${SERVER_URL}/api/teams/${awayTeamId}`
            // );
            const awayResponse = await getTeamDetailAPI(awayTeamId);

            if (!awayResponse) {
                throw new Error(`Away team API error: getTeamDetailAPI`);
            }

            const awayData = awayResponse;
            setAwayTeam(awayData);
        } catch (error) {
            console.error("Error fetching teams:", error);
            // Teams will be null, but we can still use match.homeTeam and match.awayTeam
        }
    };

    const fetchMatchStats = async () => {
        try {
            setStatsLoading(true);

            // Use the match ID if available, otherwise use team IDs
            const matchId = match.id;
            // const endpoint = matchId
            //     ? `${SERVER_URL}/api/battle/${matchId}/stats`
            //     : `${SERVER_URL}/api/battle-stats?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`;

            const response = matchId
                ? await getBattleStatisticByIdAPI(matchId)
                : await getBattleStatisticByTeamIdAPI({
                      homeTeamId,
                      awayTeamId,
                  });

            if (!response) {
                throw new Error(
                    `Stats API error: getBattleStatisticByIdAPI or getBattleStatisticByTeamIdAPI`
                );
            }

            const data = response;
            setMatchStats(data.stats);
        } catch (error) {
            console.error("Error fetching match stats:", error);

            // Set fallback stats based on the score
            const homeScore = match.score?.fullTime?.home || 0;
            const awayScore = match.score?.fullTime?.away || 0;

            // Generate realistic stats based on the score
            const homeAdvantage = Math.random() * 10 + 5; // 5-15% home advantage
            const totalPossession = 100;
            const homePossession = Math.min(
                Math.max(
                    Math.round(
                        50 + homeAdvantage + (homeScore - awayScore) * 5
                    ),
                    30
                ),
                70
            );
            const awayPossession = totalPossession - homePossession;

            setMatchStats({
                possession: {
                    home: homePossession,
                    away: awayPossession,
                },
                shotsOnTarget: {
                    home: Math.round(homeScore * 2 + Math.random() * 5),
                    away: Math.round(awayScore * 2 + Math.random() * 5),
                },
                shots: {
                    home: Math.round(homeScore * 3 + Math.random() * 10),
                    away: Math.round(awayScore * 3 + Math.random() * 10),
                },
                touches: {
                    home: Math.round(homePossession * 6),
                    away: Math.round(awayPossession * 6),
                },
                passes: {
                    home: Math.round(homePossession * 5),
                    away: Math.round(awayPossession * 5),
                },
                tackles: {
                    home: Math.round(Math.random() * 20 + 10),
                    away: Math.round(Math.random() * 20 + 10),
                },
                clearances: {
                    home: Math.round(Math.random() * 15 + 5),
                    away: Math.round(Math.random() * 15 + 5),
                },
                corners: {
                    home: Math.round(Math.random() * 8 + 2),
                    away: Math.round(Math.random() * 8 + 2),
                },
                offsides: {
                    home: Math.round(Math.random() * 4),
                    away: Math.round(Math.random() * 4),
                },
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchMatchReport = async () => {
        try {
            // Use the match ID if available
            const matchId = match.id;
            // const endpoint = matchId
            //     ? `${SERVER_URL}/api/battle/${matchId}/report`
            //     : `${SERVER_URL}/api/battle-report?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`;

            const response = matchId
                ? await getBattleReportByIdAPI(matchId)
                : await getBattleReportByTeamIdAPI({
                      homeTeamId,
                      awayTeamId,
                  });

            if (!response) {
                throw new Error(
                    `Report API error: getBattleReportByIdAPI getBattleReportByTeamIdAPI`
                );
            }

            const data = response;
            setMatchReport(data.report);
        } catch (error) {
            console.error("Error fetching match report:", error);

            // Set fallback report
            const homeTeamName = match.homeTeam.name;
            const awayTeamName = match.awayTeam.name;
            const homeScore = match.score?.fullTime?.home || 0;
            const awayScore = match.score?.fullTime?.away || 0;

            let reportText = "";
            if (homeScore > awayScore) {
                reportText = `${homeTeamName}'s impressive performance secured a ${homeScore}-${awayScore} victory over ${awayTeamName} in an exciting Premier League clash.`;
            } else if (awayScore > homeScore) {
                reportText = `${awayTeamName} claimed all three points with a ${awayScore}-${homeScore} win against ${homeTeamName} in a thrilling Premier League encounter.`;
            } else {
                reportText = `${homeTeamName} and ${awayTeamName} shared the spoils in a ${homeScore}-${awayScore} draw after an evenly contested Premier League match.`;
            }

            setMatchReport(reportText);
        }
    };

    const fetchHeadToHead = async () => {
        try {
            setH2hLoading(true);

            // Fetch head-to-head data
            // const response = await fetch(
            //     `${SERVER_URL}/api/head-to-head?team1=${homeTeamId}&team2=${awayTeamId}`
            // );
            const response = await getBattleHeadToHeadByTeamIdAPI({
                team1: homeTeamId,
                team2: awayTeamId,
            });

            if (!response) {
                throw new Error(
                    `H2H API error: getBattleHeadToHeadByTeamIdAPI`
                );
            }

            const data = response;

            setHeadToHead(data.headToHead);
            setPreviousResults(data.previousResults);
            setFormGuide(data.formGuide);
            setSeasonStats(data.seasonStats);
        } catch (error) {
            console.error("Error fetching head to head:", error);

            // Set fallback data
            const randomNumber = () => Math.floor(Math.random() * 20);

            setHeadToHead({
                played: 19,
                homeWins: randomNumber(),
                draws: 10,
                awayWins: randomNumber(),
                homeGoals: randomNumber(),
                awayGoals: randomNumber(),
            });

            // Generate previous results
            const generatePreviousResults = () => {
                const results = [];
                const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];

                for (let i = 0; i < 3; i++) {
                    const month =
                        months[Math.floor(Math.random() * months.length)];
                    const day = Math.floor(Math.random() * 28) + 1;

                    results.push({
                        date: `Saturday ${day} ${month}`,
                        homeTeam: "Leicester",
                        homeScore: Math.floor(Math.random() * 4),
                        awayTeam: "Man",
                        awayScore: Math.floor(Math.random() * 4),
                    });
                }

                return results;
            };

            setPreviousResults(generatePreviousResults());

            // Generate form guide
            const generateFormGuide = () => {
                const forms = [];
                const opponents = [
                    "ARS",
                    "CHE",
                    "MCI",
                    "LIV",
                    "TOT",
                    "WHU",
                    "EVE",
                    "NEW",
                    "CRY",
                    "BOU",
                    "SOU",
                ];
                const results = ["W", "D", "L"];

                for (let i = 0; i < 5; i++) {
                    const homeOpp =
                        opponents[Math.floor(Math.random() * opponents.length)];
                    const awayOpp =
                        opponents[Math.floor(Math.random() * opponents.length)];
                    const homeResult =
                        results[Math.floor(Math.random() * results.length)];
                    const awayResult =
                        results[Math.floor(Math.random() * results.length)];
                    const homeScore = Math.floor(Math.random() * 4);
                    const homeConc = Math.floor(Math.random() * 4);
                    const awayScore = Math.floor(Math.random() * 4);
                    const awayConc = Math.floor(Math.random() * 4);

                    forms.push({
                        home: `${homeScore}-${homeConc} v ${homeOpp} (H)`,
                        away: `${awayScore}-${awayConc} v ${awayOpp} (A)`,
                    });
                }

                return forms;
            };

            setFormGuide(generateFormGuide());

            // Generate season stats
            setSeasonStats({
                position: {
                    home: Math.floor(Math.random() * 10) + 1,
                    away: Math.floor(Math.random() * 10) + 1,
                },
                won: {
                    home: Math.floor(Math.random() * 15) + 5,
                    away: Math.floor(Math.random() * 15) + 5,
                },
                draw: {
                    home: Math.floor(Math.random() * 10) + 1,
                    away: Math.floor(Math.random() * 10) + 1,
                },
                lost: {
                    home: Math.floor(Math.random() * 10) + 1,
                    away: Math.floor(Math.random() * 10) + 1,
                },
                avgGoalsScored: {
                    home: (Math.random() * 2 + 1).toFixed(1),
                    away: (Math.random() * 2 + 1).toFixed(1),
                },
                avgGoalsConceded: {
                    home: (Math.random() * 1.5 + 0.5).toFixed(1),
                    away: (Math.random() * 1.5 + 0.5).toFixed(1),
                },
            });
        } finally {
            setH2hLoading(false);
        }
    };

    const fetchMatchHighlights = async () => {
        try {
            setHighlightsLoading(true);

            // Fetch highlights
            // const response = await fetch(
            //     `${SERVER_URL}/api/battle-highlights?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`
            // );
            const response = await getBattleHighlightByTeamIdAPI({
                homeTeamId,
                awayTeamId,
            });

            if (!response) {
                throw new Error(
                    `Highlights API error: getBattleHighlightByTeamIdAPI`
                );
            }

            const data = response;
            setMatchHighlights(data.highlights);
        } catch (error) {
            console.error("Error fetching match highlights:", error);

            // Set fallback highlights
            const homeTeamName = match.homeTeam.name;
            const awayTeamName = match.awayTeam.name;

            setMatchHighlights([
                {
                    id: 1,
                    title: `HIGHLIGHTS: ${homeTeamName} vs ${awayTeamName} | Premier League`,
                    image: "https://picsum.photos/seed/highlight1/500/300",
                    source: "YouTube",
                },
                {
                    id: 2,
                    title: `HIGHLIGHTS: ${homeTeamName} vs ${awayTeamName} | Premier League`,
                    image: "https://picsum.photos/seed/highlight2/500/300",
                    source: "YouTube",
                },
            ]);
        } finally {
            setHighlightsLoading(false);
        }
    };

    const fetchLiveCommentary = async () => {
        try {
            setCommentaryLoading(true);

            // Use the match ID if available
            const matchId = match.id;
            // const endpoint = matchId
            //     ? `${SERVER_URL}/api/battle/${matchId}/commentary`
            //     : `${SERVER_URL}/api/battle-commentary?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`;

            const response = matchId
                ? await getBattleCommentaryByBattleIdAPI(matchId)
                : await getBattleCommentaryByTeamIdAPI({
                      homeTeamId,
                      awayTeamId,
                  });

            if (!response) {
                throw new Error(
                    `Commentary API error: getBattleCommentaryByBattleIdAPI or getBattleCommentaryByTeamIdAPI`
                );
            }

            const data = response;
            setLiveCommentary(data.commentary);
        } catch (error) {
            console.error("Error fetching live commentary:", error);

            // Generate fallback commentary
            const homeTeamName = match.homeTeam.name;
            const awayTeamName = match.awayTeam.name;
            const homeScore = match.score?.fullTime?.home || 0;
            const awayScore = match.score?.fullTime?.away || 0;

            const generateCommentary = () => {
                const commentary = [];
                const events = [
                    "Corner",
                    "Shot on target",
                    "Shot off target",
                    "Free kick",
                    "Offside",
                    "Substitution",
                    "Yellow card",
                    "Foul",
                ];

                for (let i = 0; i < 10; i++) {
                    const team =
                        Math.random() > 0.5 ? homeTeamName : awayTeamName;
                    const event =
                        events[Math.floor(Math.random() * events.length)];
                    const player =
                        "Player " + (Math.floor(Math.random() * 11) + 1);

                    commentary.push({
                        id: i + 1,
                        time: "90'+8",
                        event: `${event}, ${team}. Conceded by ${player}.`,
                        team: team,
                    });
                }

                return commentary;
            };

            setLiveCommentary(generateCommentary());
        } finally {
            setCommentaryLoading(false);
        }
    };

    const fetchRelatedContent = async () => {
        try {
            setRelatedNewsLoading(true);
            setRelatedVideosLoading(true);

            // Use team names for better search results
            const homeTeamName =
                homeTeam?.shortName || match?.homeTeam?.shortName;
            const awayTeamName =
                awayTeam?.shortName || match?.awayTeam?.shortName;
            // Fetch news and videos in parallel
            const [newsResponse, videosResponse] = await Promise.all([
                // fetch(
                //     `${SERVER_URL}/api/related-news-battle?team1=${encodeURIComponent(
                //         homeTeamName
                //     )}&team2=${encodeURIComponent(awayTeamName)}`
                // ),
                // fetch(
                //     `${SERVER_URL}/api/related-videos-battle?team1=${encodeURIComponent(
                //         homeTeamName
                //     )}&team2=${encodeURIComponent(awayTeamName)}`
                // ),

                getRelatedNewsBattleAPI({
                    team1: encodeURIComponent(homeTeamName),
                    team2: encodeURIComponent(awayTeamName),
                }),
                getRelatedVideosBattleAPI({
                    team1: encodeURIComponent(homeTeamName),
                    team2: encodeURIComponent(awayTeamName),
                }),
            ]);

            if (!newsResponse) {
                throw new Error(`News API error: getRelatedNewsBattleAPI`);
            }

            if (!videosResponse) {
                throw new Error(`Videos API error: getRelatedVideosBattleAPI`);
            }

            const newsData = newsResponse;
            const videosData = videosResponse;

            setRelatedNews(newsData.news);
            setRelatedVideos(videosData.videos);
        } catch (error) {
            console.error("Error fetching related content:", error);

            // Generate fallback content
            const homeTeamName = match.homeTeam.name;
            const awayTeamName = match.awayTeam.name;

            // Mock data for related news
            setRelatedNews([
                {
                    id: 1,
                    title: `LIVE: ${homeTeamName} updates: Latest team news and injury updates`,
                    image: "https://picsum.photos/seed/news1/500/300",
                    source: "Live blog",
                },
                {
                    id: 2,
                    title: `LIVE: ${awayTeamName} updates: Manager press conference highlights`,
                    image: "https://picsum.photos/seed/news2/500/300",
                    source: "Live blog",
                },
                {
                    id: 3,
                    title: `Premier League roundup: ${homeTeamName} vs ${awayTeamName} preview`,
                    image: "https://picsum.photos/seed/news3/500/300",
                    source: "Live blog",
                },
            ]);

            // Mock data for related videos
            setRelatedVideos([
                {
                    id: 1,
                    title: `${homeTeamName} vs ${awayTeamName}: Match Preview`,
                    image: "https://picsum.photos/seed/video1/500/300",
                    source: "Live blog",
                },
                {
                    id: 2,
                    title: `${homeTeamName} Manager Pre-Match Interview`,
                    image: "https://picsum.photos/seed/video2/500/300",
                    source: "Live blog",
                },
                {
                    id: 3,
                    title: `${awayTeamName} Training Session Highlights`,
                    image: "https://picsum.photos/seed/video3/500/300",
                    source: "Live blog",
                },
            ]);
        } finally {
            setRelatedNewsLoading(false);
            setRelatedVideosLoading(false);
        }
    };

    const fetchLineups = async () => {
        try {
            setLineupsLoading(true);

            // Use the match ID if available, otherwise use team IDs
            const matchId = match?.id;
            // const endpoint = matchId
            //     ? `${SERVER_URL}/api/battle/${matchId}/lineup`
            //     : null;

            if (!matchId) {
                throw new Error("No match ID available");
            }

            const response = await getBattleLineupByIdAPI(matchId);

            if (!response) {
                throw new Error(`Lineup API error: getBattleLineupByIdAPI`);
            }

            const data = response;
            setLineups(data);
        } catch (error) {
            console.error("Error fetching lineups:", error);
            // We'll handle the fallback in the render method
        } finally {
            setLineupsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `Sun ${date.getDate()} ${date.toLocaleString("default", {
            month: "short",
        })} ${date.getFullYear()}`;
    };

    const renderMatchCard = () => {
        if (!match) return null;

        return (
            <View style={styles.matchCard}>
                <View style={styles.sponsorRow}>
                    <Text style={styles.sponsorText}>HUBLOT</Text>
                    <Text style={styles.sponsorText}>FT</Text>
                </View>

                <View style={styles.teamsContainer}>
                    <View style={styles.teamContainer}>
                        <Image
                            source={{
                                uri:
                                    match.homeTeam.crest ||
                                    "https://ui-avatars.com/api/?name=H&background=37003C&color=fff",
                            }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <View style={[styles.teamBadge, styles.homeTeamBadge]}>
                            <Text style={styles.teamBadgeText}>
                                {match.homeTeam.tla ||
                                    match.homeTeam.name
                                        .substring(0, 3)
                                        .toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                            {match.score?.fullTime?.home || 0} -{" "}
                            {match.score?.fullTime?.away || 0}
                        </Text>
                        <Text style={styles.halfTimeText}>
                            (Half-time: {match.score?.halfTime?.home || 0}-
                            {match.score?.halfTime?.away || 0})
                        </Text>
                    </View>

                    <View style={styles.teamContainer}>
                        <Image
                            source={{
                                uri:
                                    match.awayTeam.crest ||
                                    "https://ui-avatars.com/api/?name=A&background=37003C&color=fff",
                            }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <View style={[styles.teamBadge, styles.awayTeamBadge]}>
                            <Text style={styles.teamBadgeText}>
                                {match.awayTeam.tla ||
                                    match.awayTeam.name
                                        .substring(0, 3)
                                        .toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.goalScorersContainer}>
                    <View style={styles.teamGoalScorers}>
                        {match.goals
                            ?.filter(
                                (goal) => goal.team.id === match.homeTeam.id
                            )
                            .map((goal, index) => (
                                <React.Fragment key={`home-goal-${index}`}>
                                    <View style={styles.goalScorerRow}>
                                        <Text style={styles.goalMinute}>
                                            {goal.minute}'
                                        </Text>
                                        <Text style={styles.goalScorer}>
                                            {goal.scorer.name}
                                        </Text>
                                    </View>
                                    {goal.assist && (
                                        <View style={styles.goalScorerRow}>
                                            <Text style={styles.goalMinute}>
                                                {goal.minute}'
                                            </Text>
                                            <Text style={styles.goalScorer}>
                                                {goal.assist.name} (Assist)
                                            </Text>
                                        </View>
                                    )}
                                </React.Fragment>
                            )) || (
                            <>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>33'</Text>
                                    <Text style={styles.goalScorer}>
                                        Timothy Castagne
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>33'</Text>
                                    <Text style={styles.goalScorer}>
                                        33' James Maddison (Assist)
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>33'</Text>
                                    <Text style={styles.goalScorer}>
                                        Timothy Castagne
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>33'</Text>
                                    <Text style={styles.goalScorer}>
                                        33' James Maddison (Assist)
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                    <View style={styles.teamGoalScorers}>
                        {match.goals
                            ?.filter(
                                (goal) => goal.team.id === match.awayTeam.id
                            )
                            .map((goal, index) => (
                                <React.Fragment key={`away-goal-${index}`}>
                                    <View style={styles.goalScorerRow}>
                                        <Text style={styles.goalMinute}>
                                            {goal.minute}'
                                        </Text>
                                        <Text style={styles.goalScorer}>
                                            {goal.scorer.name}
                                        </Text>
                                    </View>
                                    {goal.assist && (
                                        <View style={styles.goalScorerRow}>
                                            <Text style={styles.goalMinute}>
                                                {goal.minute}'
                                            </Text>
                                            <Text style={styles.goalScorer}>
                                                {goal.assist.name} (Assist)
                                            </Text>
                                        </View>
                                    )}
                                </React.Fragment>
                            )) || (
                            <>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>62'</Text>
                                    <Text style={styles.goalScorer}>
                                        Ivan Toney
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>62'</Text>
                                    <Text style={styles.goalScorer}>
                                        62' Rico Henry (Assist)
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>62'</Text>
                                    <Text style={styles.goalScorer}>
                                        Ivan Toney
                                    </Text>
                                </View>
                                <View style={styles.goalScorerRow}>
                                    <Text style={styles.goalMinute}>62'</Text>
                                    <Text style={styles.goalScorer}>
                                        62' Rico Henry (Assist)
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.matchInfoContainer}>
                    <Text style={styles.matchInfoText}>
                        Kick off{" "}
                        {new Date(match.utcDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                    <Text style={styles.matchInfoText}>
                        {formatDate(match.utcDate)}
                    </Text>
                    <Text style={styles.matchInfoText}>
                        {match.venue || "King Power Stadium, Leicester"}
                    </Text>
                    <Text style={styles.matchInfoText}>
                        Att: {match.attendance || "31,794"}
                    </Text>
                    <Text style={styles.matchInfoText}>
                        Referee: {match.referees?.[0]?.name || "Jarred Gillett"}
                    </Text>
                </View>
            </View>
        );
    };

    const renderHighlights = () => (
        <View style={styles.highlightsContainer}>
            <Text style={styles.highlightsTitle}>Match Highlights</Text>
            {highlightsLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : matchHighlights?.length > 0 ? (
                matchHighlights.map((highlight) => (
                    <TouchableOpacity
                        key={highlight.id}
                        style={styles.highlightItem}
                        onPress={() => {
                            if (highlight.url) {
                                Linking.openURL(highlight.url);
                            }
                        }}
                    >
                        <Image
                            source={{ uri: highlight.image }}
                            style={styles.highlightImage}
                        />
                        <View style={styles.highlightOverlay}>
                            <Text style={styles.highlightSource}>
                                {highlight.source}
                            </Text>
                            <Text style={styles.highlightText}>
                                {highlight.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.noHighlightsText}>
                    No highlights available
                </Text>
            )}
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {["Latest", "Stats", "Line-ups", "Related"].map((tab) => (
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

    const renderLatestContent = () => (
        <View style={styles.contentContainer}>
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Match report</Text>
                <Text style={styles.reportText}>{matchReport}</Text>
            </View>

            <View style={styles.sectionContainer}>
                <View style={styles.commentaryTitleRow}>
                    <Text style={[styles.sectionTitle, styles.commentaryTitle]}>
                        Live
                    </Text>
                    <Text style={styles.sectionTitle}>Match Commentary</Text>
                </View>
                {commentaryLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#37003C"
                        style={styles.loadingIndicator}
                    />
                ) : liveCommentary?.length > 0 ? (
                    liveCommentary.map((comment) => (
                        <View key={comment.id} style={styles.commentaryItem}>
                            <View style={styles.commentIcon}>
                                <Ionicons
                                    name="chatbubble"
                                    size={16}
                                    color="#37003C"
                                />
                            </View>
                            <View style={styles.commentContent}>
                                <Text style={styles.commentTime}>
                                    {comment.time}
                                </Text>
                                <Text style={styles.commentText}>
                                    {comment.event}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noContentText}>
                        No commentary available
                    </Text>
                )}
            </View>
        </View>
    );

    const renderStatsContent = () => {
        if (statsLoading)
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#37003C" />
                </View>
            );

        if (!matchStats)
            return (
                <View style={styles.noContentContainer}>
                    <Text style={styles.noContentText}>No stats available</Text>
                </View>
            );

        return (
            <View style={styles.contentContainer}>
                <View style={styles.statsSection}>
                    <Text style={styles.statsSectionTitle}>Match Stats</Text>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.possession.home}
                        </Text>
                        <Text style={styles.statLabel}>Possession %</Text>
                        <Text style={styles.statValue}>
                            {matchStats.possession.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.shotsOnTarget.home}
                        </Text>
                        <Text style={styles.statLabel}>Shots on target</Text>
                        <Text style={styles.statValue}>
                            {matchStats.shotsOnTarget.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.shots.home}
                        </Text>
                        <Text style={styles.statLabel}>Shots</Text>
                        <Text style={styles.statValue}>
                            {matchStats.shots.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.touches.home}
                        </Text>
                        <Text style={styles.statLabel}>Touches</Text>
                        <Text style={styles.statValue}>
                            {matchStats.touches.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.passes.home}
                        </Text>
                        <Text style={styles.statLabel}>Passes</Text>
                        <Text style={styles.statValue}>
                            {matchStats.passes.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.tackles.home}
                        </Text>
                        <Text style={styles.statLabel}>Tackles</Text>
                        <Text style={styles.statValue}>
                            {matchStats.tackles.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.clearances.home}
                        </Text>
                        <Text style={styles.statLabel}>Clearances</Text>
                        <Text style={styles.statValue}>
                            {matchStats.clearances.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.corners.home}
                        </Text>
                        <Text style={styles.statLabel}>Corners</Text>
                        <Text style={styles.statValue}>
                            {matchStats.corners.away}
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {matchStats.offsides.home}
                        </Text>
                        <Text style={styles.statLabel}>Offsides</Text>
                        <Text style={styles.statValue}>
                            {matchStats.offsides.away}
                        </Text>
                    </View>
                </View>

                {h2hLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#37003C"
                        style={styles.loadingIndicator}
                    />
                ) : headToHead ? (
                    <>
                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                Head to Head
                            </Text>
                            <View style={styles.h2hRow}>
                                <View style={styles.h2hColumn}>
                                    <Text style={styles.h2hNumber}>
                                        {headToHead.homeWins}
                                    </Text>
                                </View>
                                <View style={styles.h2hBarContainer}>
                                    <View style={styles.h2hBar}>
                                        <View
                                            style={[
                                                styles.h2hBarSegment,
                                                styles.homeWinsBar,
                                                { flex: headToHead.homeWins },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.h2hBarSegment,
                                                styles.drawsBar,
                                                { flex: headToHead.draws },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.h2hBarSegment,
                                                styles.awayWinsBar,
                                                { flex: headToHead.awayWins },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.h2hBarLabel}>
                                        Played {headToHead.played}
                                    </Text>
                                </View>
                                <View style={styles.h2hColumn}>
                                    <Text style={styles.h2hNumber}>
                                        {headToHead.awayWins}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.h2hRow}>
                                <Text style={styles.h2hLabel}>
                                    Drawn {headToHead.draws}
                                </Text>
                            </View>
                            <View style={styles.h2hRow}>
                                <Text style={styles.h2hLabel}>Home Wins</Text>
                                <Text style={styles.h2hNumber}>
                                    {headToHead.homeWins}
                                </Text>
                            </View>
                            <View style={styles.h2hRow}>
                                <Text style={styles.h2hLabel}>Away Wins</Text>
                                <Text style={styles.h2hNumber}>
                                    {headToHead.awayWins}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                Previous Results
                            </Text>
                            {previousResults?.length > 0 ? (
                                previousResults.map((result, index) => (
                                    <View
                                        key={index}
                                        style={styles.previousResult}
                                    >
                                        <Text style={styles.resultDate}>
                                            {result.date}
                                        </Text>
                                        <View style={styles.resultRow}>
                                            <View style={styles.resultTeam}>
                                                <Image
                                                    source={{
                                                        uri:
                                                            homeTeam?.crest ||
                                                            match?.homeTeam
                                                                ?.crest ||
                                                            "https://crests.football-data.org/338.png",
                                                    }}
                                                    style={
                                                        styles.resultTeamLogo
                                                    }
                                                />
                                                <Text
                                                    style={
                                                        styles.resultTeamName
                                                    }
                                                >
                                                    {result.homeTeam}
                                                </Text>
                                            </View>
                                            <View style={styles.resultScore}>
                                                <Text
                                                    style={
                                                        styles.resultScoreText
                                                    }
                                                >
                                                    {result.homeScore} -{" "}
                                                    {result.awayScore}
                                                </Text>
                                            </View>
                                            <View style={styles.resultTeam}>
                                                <Image
                                                    source={{
                                                        uri:
                                                            awayTeam?.crest ||
                                                            match?.awayTeam
                                                                ?.crest ||
                                                            "https://crests.football-data.org/66.png",
                                                    }}
                                                    style={
                                                        styles.resultTeamLogo
                                                    }
                                                />
                                                <Text
                                                    style={
                                                        styles.resultTeamName
                                                    }
                                                >
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
                                ))
                            ) : (
                                <Text style={styles.noContentText}>
                                    No previous results available
                                </Text>
                            )}
                            {previousResults?.length > 0 && (
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
                            )}
                        </View>

                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                Form Guide
                            </Text>
                            {formGuide?.length > 0 ? (
                                formGuide.map((form, index) => (
                                    <View key={index} style={styles.formRow}>
                                        <View style={styles.formTeam}>
                                            <View style={styles.formBadge}>
                                                <Image
                                                    source={{
                                                        uri:
                                                            homeTeam?.crest ||
                                                            match?.homeTeam
                                                                ?.crest ||
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
                                                            match?.awayTeam
                                                                ?.crest ||
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
                                ))
                            ) : (
                                <Text style={styles.noContentText}>
                                    No form guide available
                                </Text>
                            )}
                        </View>

                        <View style={styles.statsSection}>
                            <Text style={styles.statsSectionTitle}>
                                This Season
                            </Text>
                            {seasonStats ? (
                                <>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Position
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.position.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.position.away}
                                        </Text>
                                    </View>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Won
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.won.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.won.away}
                                        </Text>
                                    </View>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Draw
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.draw.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.draw.away}
                                        </Text>
                                    </View>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Lost
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.lost.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.lost.away}
                                        </Text>
                                    </View>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Avg Goals Scored Per Match
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.avgGoalsScored.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.avgGoalsScored.away}
                                        </Text>
                                    </View>
                                    <View style={styles.seasonStatsRow}>
                                        <Text style={styles.seasonStatsLabel}>
                                            Avg Goals Conceded Per Match
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.avgGoalsConceded.home}
                                        </Text>
                                        <Text style={styles.seasonStatsNumber}>
                                            {seasonStats.avgGoalsConceded.away}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.noContentText}>
                                    No season stats available
                                </Text>
                            )}
                        </View>
                    </>
                ) : (
                    <View style={styles.noContentContainer}>
                        <Text style={styles.noContentText}>
                            No head-to-head data available
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // Tạo map để đặt tên nhóm hiển thị
    const POSITION_GROUP_LABELS = {
        Goalkeeper: "Goalkeepers",
        Defender: "Defenders",
        Midfielder: "Midfielders",
        Attacker: "Forwards", // hoặc 'Strikers', tuỳ ý
    };

    // Hàm gom nhóm
    function groupPlayersByPosition(players) {
        // players là mảng startingXI hoặc substitutes
        const grouped = {
            Goalkeeper: [],
            Defender: [],
            Midfielder: [],
            Attacker: [],
        };

        players.forEach((p) => {
            const { position } = p;
            // Nếu position không thuộc 1 trong 4 key trên, gán tạm sang Attacker hoặc tuỳ ý
            const validPos = grouped[position] ? position : "Attacker";
            grouped[validPos].push(p);
        });

        return grouped;
    }

    // Hàm render 1 nhóm
    function renderPositionGroup(positionKey, playersArray) {
        if (!playersArray.length) return null; // Nếu nhóm này không có cầu thủ thì ẩn

        const groupLabel = POSITION_GROUP_LABELS[positionKey] || positionKey;

        return (
            <View key={positionKey} style={{ marginTop: 20 }}>
                <Text style={styles.positionTitle}>{groupLabel}</Text>
                {playersArray.map((player) => {
                    return (
                        <TouchableOpacity
                            key={`${player.name}-${player.shirtNumber}`}
                            style={styles.playerRow}
                            onPress={() => {
                                /* Xử lý khi bấm vào cầu thủ */
                            }}
                        >
                            {/* Avatar cầu thủ */}
                            <Image
                                source={{ uri: player.image }}
                                style={styles.playerImage}
                                resizeMode="cover"
                            />
                            {/* Tên + Quốc tịch */}
                            <View style={styles.playerInfo}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    {player.shirtNumber && (
                                        <Text style={styles.shirtNumber}>
                                            {player.shirtNumber}{" "}
                                        </Text>
                                    )}
                                    <Text style={styles.playerName}>
                                        {player.name}
                                    </Text>
                                </View>
                                <Text style={styles.playerNationality}>
                                    {player.nationality}
                                </Text>
                            </View>
                            {/* Mũi tên điều hướng */}
                            <Ionicons
                                name="chevron-forward-outline"
                                size={18}
                                color="#37003C"
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    const renderLineUpsContent = () => {
        if (lineupsLoading) return <ActivityIndicator />;
        if (!lineups)
            return (
                <ScrollView style={styles.contentContainer}>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            Line-ups content will go here
                        </Text>
                        <Text style={styles.noContentText}>
                            Line-up data is being fetched from the API
                        </Text>
                    </View>
                </ScrollView>
            );

        const { homeTeam, awayTeam } = lineups;

        // Giả sử ta có state `activeLineupTab = 'home' | 'away'` để toggle giữa 2 đội.
        // Hoặc bạn có 2 nút "Leicester" / "Man Utd" để người dùng chọn.
        // Lấy lineup tương ứng:
        const chosenLineup = activeLineupTab === "home" ? homeTeam : awayTeam;

        // Gộp luôn startingXI + substitutes, hoặc hiển thị riêng tuỳ ý:
        const fullSquad = [
            ...chosenLineup.startingXI,
            ...chosenLineup.substitutes,
        ];

        // Gom nhóm
        const grouped = groupPlayersByPosition(fullSquad);

        return (
            <View
                style={{
                    padding: 16,
                    marginTop: 8,
                    backgroundColor: "#f5f5f5",
                }}
            >
                <View style={styles.teamSelector}>
                    <TouchableOpacity
                        style={[
                            styles.teamTab,
                            activeLineupTab === "away" &&
                                styles.selectedTeamTab,
                        ]}
                        onPress={() => setActiveLineupTab("away")}
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
                            activeLineupTab === "home" &&
                                styles.selectedTeamTab,
                        ]}
                        onPress={() => setActiveLineupTab("home")}
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
                {Object.entries(grouped).map(([positionKey, playersArray]) => {
                    return renderPositionGroup(positionKey, playersArray);
                })}
            </View>
        );
    };

    const renderRelatedContent = () => (
        <View style={styles.contentContainer}>
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Related News</Text>
                {relatedNewsLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#37003C"
                        style={styles.loadingIndicator}
                    />
                ) : relatedNews?.length > 0 ? (
                    <>
                        {relatedNews.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.relatedItem}
                                onPress={() => {
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
                                    style={styles.relatedImage}
                                />
                                <View style={styles.relatedContent}>
                                    <Text style={styles.relatedSource}>
                                        {item.source}
                                    </Text>
                                    <Text
                                        style={styles.relatedTitle}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.moreButton}>
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
                        {relatedVideos.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.relatedItem}
                                onPress={() => {
                                    // Open the video
                                    if (item.url) {
                                        Linking.openURL(item.url);
                                    } else {
                                        Linking.openURL(
                                            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                                item.title
                                            )}`
                                        );
                                    }
                                }}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.relatedImage}
                                />
                                <View style={styles.relatedContent}>
                                    <Text style={styles.relatedSource}>
                                        {item.source}
                                    </Text>
                                    <Text
                                        style={styles.relatedTitle}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.moreButton}>
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
        </View>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "Latest":
                return renderLatestContent();
            case "Stats":
                return renderStatsContent();
            case "Line-ups":
                return renderLineUpsContent();
            case "Related":
                return renderRelatedContent();
            default:
                return renderLatestContent();
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
            <ScrollView>
                {renderMatchCard()}
                {renderHighlights()}
                {renderTabs()}
                {renderContent()}
            </ScrollView>
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
    matchCard: {
        backgroundColor: "white",
        margin: 16,
        marginBottom: 0,
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
    teamsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingBottom: 8,
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
    scoreContainer: {
        alignItems: "center",
    },
    scoreText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    halfTimeText: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    goalScorersContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    teamGoalScorers: {
        flex: 1,
    },
    goalScorerRow: {
        flexDirection: "row",
        marginVertical: 2,
    },
    goalMinute: {
        width: 30,
        fontSize: 12,
        color: "#666",
    },
    goalScorer: {
        fontSize: 12,
        color: "#333",
    },
    matchInfoContainer: {
        alignItems: "center",
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    matchInfoText: {
        fontSize: 12,
        color: "#666",
        marginVertical: 2,
    },
    highlightsContainer: {
        backgroundColor: "#37003C",
        padding: 16,
    },
    highlightsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    highlightItem: {
        position: "relative",
        marginVertical: 4,
        borderRadius: 4,
        overflow: "hidden",
    },
    highlightImage: {
        width: "100%",
        height: 80,
        borderRadius: 4,
    },
    highlightOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 8,
    },
    highlightSource: {
        fontSize: 10,
        color: "white",
        marginBottom: 2,
    },
    highlightText: {
        fontSize: 12,
        color: "white",
        fontWeight: "500",
    },
    noHighlightsText: {
        color: "white",
        textAlign: "center",
        marginTop: 10,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "white",
        marginHorizontal: 16,
        marginTop: 16,
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
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
        marginBottom: 12,
    },
    reportText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
    },
    commentaryTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    commentaryTitle: {
        color: "#FF2882",
        marginRight: 4,
        marginBottom: 0,
    },
    commentaryItem: {
        flexDirection: "row",
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
    },
    commentIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    commentContent: {
        flex: 1,
    },
    commentTime: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#37003C",
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: "#333",
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
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#37003C",
        width: 40,
        textAlign: "center",
    },
    statLabel: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        textAlign: "center",
    },
    h2hRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    h2hColumn: {
        alignItems: "center",
    },
    h2hNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#37003C",
    },
    h2hLabel: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    h2hBarContainer: {
        flex: 1,
        alignItems: "center",
    },
    h2hBar: {
        flexDirection: "row",
        height: 8,
        width: "80%",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4,
    },
    h2hBarSegment: {
        height: 8,
    },
    homeWinsBar: {
        backgroundColor: "#FF2882",
    },
    drawsBar: {
        backgroundColor: "#37003C",
    },
    awayWinsBar: {
        backgroundColor: "#00FF87",
    },
    h2hBarLabel: {
        fontSize: 12,
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
    relatedItem: {
        flexDirection: "row",
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
    },
    relatedImage: {
        width: 80,
        height: 60,
        borderRadius: 4,
    },
    relatedContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    relatedSource: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    relatedTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    emptyContent: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: "#666",
        fontSize: 14,
    },
    loadingIndicator: {
        padding: 20,
    },
    noContentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    noContentText: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
    },

    // Lineup styles
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

    positionGroup: {
        marginBottom: 16, // khoảng cách giữa các nhóm
        backgroundColor: "#f5f5f5",
    },
    positionTitle: {
        fontSize: 18,
        color: "#37003C",
        fontWeight: "700",
        marginBottom: 8,
    },
    playerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E6E6E6",
    },
    playerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        backgroundColor: "#ccc", // hoặc bạn có thể để trống
    },
    playerInfo: {
        flex: 1,
        justifyContent: "center",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    shirtNumber: {
        fontSize: 14,
        color: "#37003C",
        fontWeight: "600",
    },
    playerName: {
        fontSize: 14,
        color: "#37003C",
        fontWeight: "700",
    },
    playerNationality: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
});

export default BattleDetailsScreen;
