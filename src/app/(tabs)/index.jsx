import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    getCompetitionStandingDetailAPI,
    getMatchesAPI,
    getMatchesOfTeamIdAPI,
    getStatisticOfTeamIdAPI,
    getUpcomingMatches,
    getTeamDetailAPI,
    getNewsHighlight,
    getVideosAPI,
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
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const App = () => {
    const [activeTab, setActiveTab] = useState('matches');
    const [matches, setMatches] = useState([]); // lưu dữ liệu trận đấu

    const renderTabContent = () => {
        switch (activeTab) {
            case 'matches':
                return <MatchesTab />;
            case 'league':
                return <LeagueTableTab />;
            default:
                return <MatchesTab />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#e5006d" />
            <ScrollView style={styles.scrollView}>
                <Header matches={matches} setMatches={setMatches} /> {/* ✅ truyền state */}
                <NewsHighlight />
                <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
                {renderTabContent()}
                <ClubHighlight />
                <RelatedNews />
                <LatestNews />
                <LatestVideos />
            </ScrollView>
        </SafeAreaView>
    );
};


const Header = ({ matches, setMatches }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await getUpcomingMatches();
            const data = res?.matches || res?.data?.matches || res?.data?.data?.matches || [];
            setMatches(data.slice(0, 5)); // lấy 5 trận đầu
        } catch (err) {
            console.error('❌ Failed to fetch matches:', err);
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    const matchDate = matches[0]?.date || matches[0]?.kickoff || Date.now();
    const formattedDate = new Date(matchDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <LinearGradient colors={['#e5006d', '#ff0066']} style={styles.header}>
            <View style={styles.headerContent}>
                <Image
                    source={{
                        uri: 'https://raw.githubusercontent.com/Nghiahihihi/e-commerce/4fadb39ca180731848a5f395e6536e1646d473c9/media/product_images/epl%20logo-01.png',
                    }}
                    style={{
                        height: 90,
                        width: 220,
                        resizeMode: 'contain',
                        alignSelf: 'center',
                    }}
                />

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 10 }} color="#fff" />
                ) : matches.length > 0 ? (
                    <>
                        <Text style={styles.matchdayTitle}>Matchday Live</Text>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                        <MatchCards matches={matches} />
                        <MatchdayBanner />
                    </>
                ) : null}
            </View>
        </LinearGradient>
    );
};

const MatchCards = ({ matches }) => {
    if (!matches || matches.length === 0) return null;

    return (
        <View style={styles.matchCardsContainer}>
            {matches.map((match, index) => (
                <View key={index} style={styles.card}>
                    <Text>{match.homeTeam} vs {match.awayTeam}</Text>
                    {/* Tuỳ vào dữ liệu mà bạn render thêm giờ, sân, logo,... */}
                </View>
            ))}
        </View>
    );
};


// const MatchCards = () => {
//     const [matches, setMatches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchMatches();
//     }, []);

//     const fetchMatches = async () => {
//         try {
//             const { matches } = await getUpcomingMatches();
//             setMatches(matches);
//             setLoading(false);
//         } catch (err) {
//             console.error('🔥 API failed', err?.response?.data || err.message || err);
//             setError('Lỗi khi tải dữ liệu trận đấu');
//             setLoading(false);
//         }
//     };

//     const renderItem = ({ item }) => {
//         const homeName = item?.homeTeam?.name || 'Đội nhà';
//         const awayName = item?.awayTeam?.name || 'Đội khách';
//         const homeLogo = item?.homeTeam?.crest || item?.homeTeam?.crestUrl;
//         const awayLogo = item?.awayTeam?.crest || item?.awayTeam?.crestUrl;
//         const time = item?.utcDate
//             ? new Date(item.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             : '--:--';

//         return (
//             <View style={styles.card}>
//                 <View style={styles.teamBlock}>
//                     {homeLogo ? (
//                         <Image source={{ uri: homeLogo }} style={styles.logo} />
//                     ) : null}
//                     <Text style={styles.teamName}>{homeName}</Text>
//                 </View>

//                 <View style={styles.centerBlock}>
//                     <Text style={styles.time}>{time}</Text>
//                 </View>

//                 <View style={styles.teamBlock}>
//                     {awayLogo ? (
//                         <Image source={{ uri: awayLogo }} style={styles.logo} />
//                     ) : null}
//                     <Text style={styles.teamName}>{awayName}</Text>
//                 </View>
//             </View>
//         );
//     };

//     if (loading) {
//         return <ActivityIndicator size="large" color="#007aff" />;
//     }

//     if (error) {
//         return (
//             <View style={{ padding: 20 }}>
//                 <Text style={{ color: 'red' }}>{error}</Text>
//             </View>
//         );
//     }

//     return (
//         <FlatList
//             data={matches}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
//             contentContainerStyle={styles.container}
//         />
//     );
// };



// const MatchCards = () => {
//     const [matches, setMatches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchMatches();
//     }, []);

//     const fetchMatches = async () => {
//         try {
//             const { matches } = await getUpcomingMatches();
//             setMatches(matches);
//             setLoading(false);
//         } catch (err) {
//             console.error("🔥 API failed", err?.response?.data || err.message || err);
//             setError('Lỗi khi tải dữ liệu trận đấu');
//             setLoading(false);
//         }
//     };

//     // if (loading) {
//     //     return <ActivityIndicator size="large" color="#0000ff" />;
//     // }

//     if (error) {
//         return <Text>{error}</Text>;
//     }

//     return (
//         <View style={styles.matchCardsContainer}>
//             {matches.map((match) => (
//                 <View key={match.id} style={styles.matchCard}>
//                     <View style={styles.matchContent}>
//                         <View style={styles.teamContainer}>
//                             <Text style={styles.teamName}>{match.homeTeam.name}</Text>
//                             <Image
//                                 source={{ uri: match.homeTeam.crest || match.homeTeam.crestUrl }} // crest for v4 API
//                                 style={styles.teamLogo}
//                             />
//                         </View>
//                         <View style={styles.scoreContainer}>
//                             <Text style={styles.scoreText}>
//                                 {new Date(match.utcDate).toLocaleString()}
//                             </Text>
//                         </View>
//                         <View style={styles.teamContainer}>
//                             <Image
//                                 source={{ uri: match.awayTeam.crest || match.awayTeam.crestUrl }}
//                                 style={styles.teamLogo}
//                             />
//                             <Text style={styles.teamName}>{match.awayTeam.name}</Text>
//                         </View>
//                     </View>
//                 </View>
//             ))}
//         </View>
//     );
// };


const MatchdayBanner = () => {
    return (
        <View style={styles.matchdayBanner}>
            <Text style={styles.matchdayBannerText}>Matchday Live</Text>
            <Text style={styles.arrowText}>→</Text>
        </View>
    );
};



// const NewsHighlight = () => {
//     const [news, setNews] = useState(null);

//     // Define styles inside the component
//     const styles = StyleSheet.create({
//         container: {
//             flex: 1,
//             backgroundColor: '#38004c', // Premier League purple
//         },
//         scrollView: {
//             flex: 1,
//         },
//         header: {
//             alignItems: 'center',
//             paddingVertical: 20,
//         },
//         logo: {
//             width: 200,
//             height: 50,
//         },
//         featureContainer: {
//             marginHorizontal: 15,
//             borderRadius: 15,
//             overflow: 'hidden',
//             marginBottom: 20,
//         },
//         mainImage: {
//             width: '100%',
//             height: 200,
//             borderRadius: 15,
//         },
//         featureTag: {
//             position: 'absolute',
//             top: 15,
//             left: 15,
//             backgroundColor: 'transparent',
//         },
//         featureTagText: {
//             color: 'white',
//             fontWeight: 'bold',
//             fontSize: 16,
//         },
//         newsTag: {
//             position: 'absolute',
//             top: 15,
//             left: 15,
//             backgroundColor: 'transparent',
//         },
//         titleContainer: {
//             position: 'absolute',
//             bottom: 0,
//             left: 0,
//             right: 0,
//             padding: 15,
//         },
//         mainTitle: {
//             color: 'white',
//             fontSize: 24,
//             fontWeight: 'bold',
//             marginBottom: 5,
//         },
//         subtitle: {
//             color: 'white',
//             fontSize: 16,
//         },
//         newsRow: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             marginHorizontal: 15,
//             marginBottom: 20,
//         },
//         newsItem: {
//             width: '48%',
//             borderRadius: 15,
//             overflow: 'hidden',
//         },
//         newsItemImage: {
//             width: '100%',
//             height: 120,
//             borderRadius: 15,
//         },
//         newsItemTitle: {
//             color: 'white',
//             fontSize: 14,
//             fontWeight: 'bold',
//             marginTop: 8,
//         },
//         questionContainer: {
//             marginHorizontal: 15,
//             marginBottom: 20,
//             padding: 15,
//             borderTopWidth: 1,
//             borderTopColor: 'rgba(255,255,255,0.2)',
//         },
//         questionText: {
//             color: 'white',
//             fontSize: 16,
//             fontWeight: 'bold',
//         },
//         navBar: {
//             flexDirection: 'row',
//             justifyContent: 'space-around',
//             paddingVertical: 15,
//             borderTopWidth: 1,
//             borderTopColor: 'rgba(255,255,255,0.2)',
//             marginTop: 20,
//         },
//         navItem: {
//             alignItems: 'center',
//         },
//         navText: {
//             color: 'white',
//             fontSize: 14,
//         }
//     });

//     useEffect(() => {
//         fetchNews();
//     }, []);

//     const fetchNews = async () => {
//         try {
//             const result = await getNewsHighlight();
//             const article = result[0]; // lấy bài đầu tiên

//             if (article) {
//                 setNews({
//                     title: article.headline,
//                     description: article.description,
//                     mainImage: article.images?.[0]?.url,
//                     gallery: [
//                         article.images?.[0]?.url,
//                         article.images?.[1]?.url || article.images?.[0]?.url,
//                     ],
//                     info: [
//                         `🕒 ${new Date(article.published).toLocaleString()}`,
//                         `📌 ESPN`,
//                         article.categories?.find(c => c.type === 'team')?.description || 'Premier League',
//                     ],
//                 });
//             }
//         } catch (err) {
//             console.error('❌ Failed to fetch ESPN news:', err);
//         }
//     };

//     if (!news) return null;

//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView style={styles.scrollView}>
//                 {/* Premier League Logo */}
//                 <View style={styles.header}>
//                     <Image
//                         source={{ uri: 'https://logodownload.org/wp-content/uploads/2016/03/premier-league-logo-0.png' }}
//                         style={styles.logo}
//                         resizeMode="contain"
//                     />
//                 </View>

//                 {/* Main Feature */}
//                 <View style={styles.featureContainer}>
//                     <Image
//                         source={{ uri: news.mainImage }}
//                         style={styles.mainImage}
//                         resizeMode="cover"
//                     />

//                     {/* Dòng Feature tag nếu vẫn muốn giữ */}
//                     <View style={styles.featureTag}>
//                         <Text style={styles.featureTagText}>Feature</Text>
//                     </View>

//                     {/* 👇 Đưa text ra ngoài hình ảnh */}
//                     <View style={styles.featureTextContainer}>
//                         <Text style={styles.mainTitle}>{news.title}</Text>
//                         <Text style={styles.subtitle}>{news.description}</Text>
//                     </View>
//                 </View>

//                 {/* News Gallery */}
//                 <View style={styles.newsRow}>
//                     <View style={styles.newsItem}>
//                         <Image
//                             source={{ uri: news.gallery[0] }}
//                             style={styles.newsItemImage}
//                             resizeMode="cover"
//                         />
//                         <View style={styles.featureTag}>
//                             <Text style={styles.featureTagText}>Feature</Text>
//                         </View>
//                         <Text style={styles.newsItemTitle}>Preview: All you need to know ahead of more European quarter-finals</Text>
//                     </View>

//                     <View style={styles.newsItem}>
//                         <Image
//                             source={{ uri: news.gallery[1] }}
//                             style={styles.newsItemImage}
//                             resizeMode="cover"
//                         />
//                         <View style={styles.newsTag}>
//                             <Text style={styles.featureTagText}>News</Text>
//                         </View>
//                         <Text style={styles.newsItemTitle}>Premier League claims fifth UEFA Champions League spot</Text>
//                     </View>
//                 </View>

//             </ScrollView>
//         </SafeAreaView>
//     );
// };

const NewsHighlight = () => {
    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const result = await getNewsHighlight();
            const selectedArticles = result.slice(0, 3); // lấy 3 bài đầu tiên

            const formattedNews = selectedArticles.map(article => ({
                title: article.headline,
                description: article.description,
                image: article.images?.[0]?.url,
                url: article.links?.web?.href,
            }));

            setNewsList(formattedNews);
        } catch (err) {
            console.error('❌ Failed to fetch ESPN news:', err);
        }
    };

    if (newsList.length === 0) return null;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#38004c',
        },
        scrollView: {
            flex: 1,
        },
        header: {
            alignItems: 'center',
            paddingVertical: 20,
        },
        logo: {
            width: 200,
            height: 50,
        },
        featureContainer: {
            marginHorizontal: 15,
            borderRadius: 15,
            overflow: 'hidden',
            marginBottom: 20,
            backgroundColor: '#fff',
        },
        mainImage: {
            width: '100%',
            height: 200,
        },
        featureTag: {
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: '#000000aa',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 5,
        },
        featureTagText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
        featureTextContainer: {
            padding: 12,
        },
        mainTitle: {
            color: '#000',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 5,
        },
        subtitle: {
            color: '#444',
            fontSize: 14,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Premier League Logo */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://logodownload.org/wp-content/uploads/2016/03/premier-league-logo-0.png' }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Render mỗi bài báo */}
                {newsList.map((article, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.featureContainer}
                        onPress={() => Linking.openURL(article.url)}
                    >
                        <Image
                            source={{ uri: article.image }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                        <View style={styles.featureTag}>
                            <Text style={styles.featureTagText}>News</Text>
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.mainTitle}>{article.title}</Text>
                            <Text style={styles.subtitle}>{article.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};



const TabSelector = ({ activeTab, setActiveTab }) => {
    return (
        <View style={styles.tabSelector}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'matches' && styles.activeTabButton]}
                onPress={() => setActiveTab('matches')}
            >
                <Text style={styles.tabButtonText}>Matches</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'league' && styles.activeTabButton]}
                onPress={() => setActiveTab('league')}
            >
                <Text style={styles.tabButtonText}>League Table</Text>
            </TouchableOpacity>
        </View>
    );
};

// const MatchesTab = () => {
//     return (
//         <View style={styles.tabContent}>
//             <View style={styles.matchweekHeader}>
//                 <Text style={styles.matchweekTitle}>Matchweek 28</Text>
//             </View>
//             <View style={styles.matchweekSubheader}>
//                 <Text style={styles.matchweekSubheaderText}>All times shown are your local time</Text>
//             </View>
//             <View style={styles.matchweekDateHeader}>
//                 <Text style={styles.matchweekDateText}>Saturday 09 March</Text>
//             </View>

//             {/* Matches for Saturday */}
//             {[1, 2, 3, 4].map((index) => (
//                 <View key={index} style={styles.matchweekMatch}>
//                     <View style={styles.matchweekTeamContainer}>
//                         <Image
//                             source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t13.png' }}
//                             style={styles.matchweekTeamLogo}
//                         />
//                     </View>
//                     <View style={styles.matchweekTimeContainer}>
//                         <Text style={styles.matchweekTimeText}>21:00</Text>
//                     </View>
//                     <View style={styles.matchweekTeamContainer}>
//                         <Image
//                             source={{ uri: 'https://resources.premierleague.com/premierleague/badges/t1.png' }}
//                             style={styles.matchweekTeamLogo}
//                         />
//                     </View>
//                     <TouchableOpacity style={styles.matchweekArrow}>
//                         <Text style={styles.matchweekArrowText}>→</Text>
//                     </TouchableOpacity>
//                 </View>
//             ))}

//             <View style={styles.viewAllFixtures}>
//                 <Text style={styles.viewAllFixturesText}>View all fixtures →</Text>
//             </View>
//         </View>
//     );
// };

const MatchesTab = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Giả sử bạn đã có API để lấy các trận đấu sắp tới
                const data = await getMatchesOfTeamIdAPI(teamId, {
                    status: "SCHEDULED",
                    limit: 5, // Lấy 5 trận đấu sắp tới
                });
                setMatches(data.matches); // Lưu vào state
                setLoading(false);
            } catch (err) {
                setError("Lỗi khi tải dữ liệu trận đấu");
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    // if (loading) {
    //     return <ActivityIndicator size="large" color="#0000ff" />;
    // }

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.tabContent}>
            <View style={styles.matchweekHeader}>
                <Text style={styles.matchweekTitle}>Matchweek 28</Text> {/* Sử dụng matchweek từ dữ liệu */}
            </View>
            <View style={styles.matchweekSubheader}>
                <Text style={styles.matchweekSubheaderText}>All times shown are your local time</Text>
            </View>
            {/* Hiển thị các trận đấu sắp tới */}
            {matches.map((match, index) => (
                <View key={index} style={styles.matchweekMatch}>
                    <View style={styles.matchweekTeamContainer}>
                        <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                        <Image
                            source={{ uri: match.homeTeam.crestUrl }}
                            style={styles.matchweekTeamLogo}
                        />
                    </View>
                    <View style={styles.matchweekTimeContainer}>
                        <Text style={styles.matchweekTimeText}>{new Date(match.utcDate).toLocaleTimeString()}</Text>
                    </View>
                    <View style={styles.matchweekTeamContainer}>
                        <Image
                            source={{ uri: match.awayTeam.crestUrl }}
                            style={styles.matchweekTeamLogo}
                        />
                        <Text style={styles.teamName}>{match.awayTeam.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.matchweekArrow}>
                        <Text style={styles.matchweekArrowText}>→</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.viewAllFixtures}>
                <Text style={styles.viewAllFixturesText}>View all fixtures →</Text>
            </View>
        </View>
    );
};

const LeagueTableTab = () => {
    const [rankings, setRankings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                const data = await getCompetitionStandingDetailAPI();
                const tableData = data.standings[0].table.map((item) => ({
                    position: item.position,
                    team: item.team.name,
                    teamLogo: item.team.crest,  // Lấy crest thay vì crestUrl
                    played: item.playedGames,
                    goalDifference: item.goalDifference,
                    points: item.points
                }));
                setRankings(tableData); // Lưu dữ liệu vào state
            } catch (err) {
                setError('Lỗi khi tải dữ liệu từ API');
            }
        };

        fetchStandings();
    }, []);

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <View style={styles.tabContent}>
            <View style={styles.leagueTableHeader}>
                <View style={styles.leagueTableHeaderCell}>
                    <Text style={styles.leagueTableHeaderText}>Pos</Text>
                </View>
                <View style={[styles.leagueTableHeaderCell, styles.leagueTableTeamCell]}>
                    <Text style={styles.leagueTableHeaderText}></Text>
                </View>
                <View style={styles.leagueTableHeaderCell}>
                    <Text style={styles.leagueTableHeaderText}>Pl</Text>
                </View>
                <View style={styles.leagueTableHeaderCell}>
                    <Text style={styles.leagueTableHeaderText}>GD</Text>
                </View>
                <View style={styles.leagueTableHeaderCell}>
                    <Text style={styles.leagueTableHeaderText}>Pts</Text>
                </View>
            </View>

            {rankings.map((item, index) => (
                <View key={index} style={styles.leagueTableRow}>
                    <View style={styles.leagueTableCell}>
                        <Text style={styles.leagueTablePositionText}>{item.position}</Text>
                    </View>
                    <View style={[styles.leagueTableCell, styles.leagueTableTeamCell]}>
                        {/* Hiển thị logo đội bóng */}
                        <Image
                            source={{ uri: item.teamLogo }}  // Lấy logo từ crest
                            style={styles.leagueTableTeamLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.leagueTableTeamText}>{item.team}</Text>
                    </View>
                    <View style={styles.leagueTableCell}>
                        <Text style={styles.leagueTableText}>{item.played}</Text>
                    </View>
                    <View style={styles.leagueTableCell}>
                        <Text style={styles.leagueTableText}>{item.goalDifference}</Text>
                    </View>
                    <View style={styles.leagueTableCell}>
                        <Text style={styles.leagueTableText}>{item.points}</Text>
                    </View>
                </View>
            ))}
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

// const LatestNews = () => {
//     const newsItems = [
//         {
//             id: 1,
//             title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
//             image: "https://resources.premierleague.pulselive.com/photo-resources/2024/09/13/afa04f3e-dc38-486b-bd5e-130a53392e45/PL2425-SQUAD-LISTS-2.png?width=1400&height=800"
//         },
//         {
//             id: 2,
//             title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
//             image: "https://resources.premierleague.pulselive.com/photo-resources/2024/09/13/afa04f3e-dc38-486b-bd5e-130a53392e45/PL2425-SQUAD-LISTS-2.png?width=1400&height=800"
//         },
//         {
//             id: 3,
//             title: "Live blog: Memorable updates: Dunk, Isak, Maddison out for 'weeks'",
//             image: "https://resources.premierleague.pulselive.com/photo-resources/2024/09/13/afa04f3e-dc38-486b-bd5e-130a53392e45/PL2425-SQUAD-LISTS-2.png?width=1400&height=800"
//         }
//     ];

//     return (
//         <View style={styles.latestNews}>
//             <Text style={styles.sectionTitle}>Latest News</Text>
//             {newsItems.map((item) => (
//                 <View key={item.id} style={styles.latestNewsItem}>
//                     <Image
//                         source={{ uri: item.image }}
//                         style={styles.latestNewsImage}
//                     />
//                     <Text style={styles.latestNewsTitle}>{item.title}</Text>
//                 </View>
//             ))}
//             <TouchableOpacity style={styles.moreButton}>
//                 <Text style={styles.moreButtonText}>More News →</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };
const LatestNews = () => {
    const [newsItems, setNewsItems] = useState([]);

    useEffect(() => {
        fetchLatestNews();
    }, []);

    const fetchLatestNews = async () => {
        try {
            const result = await getNewsHighlight(); // hoặc getLatestNews nếu có riêng
            const sliced = result.slice(0, 3).map(article => ({
                id: article.id,
                title: article.headline,
                image: article.images?.[0]?.url || '', // fallback rỗng nếu thiếu ảnh
                url: article.links?.web?.href || '',
            }));
            setNewsItems(sliced);
        } catch (err) {
            console.error('❌ Failed to fetch latest news:', err);
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
                        if (item.url) {
                            Linking.openURL(item.url);
                        }
                    }}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={styles.latestNewsImage}
                    />
                    <Text style={styles.latestNewsTitle}>{item.title}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreButtonText}>More News →</Text>
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
            // console.log("✅ Fetched videos:", result);
            if (Array.isArray(result)) {
                setVideos(result.slice(0, 3)); // ✅ lấy đúng 3 video đầu
            } else {
                // console.warn("⚠️ result is not an array:", result);
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
                    onPress={() => Linking.openURL(video.url)}
                >
                    <Image
                        source={{ uri: video.thumbnail }}
                        style={styles.latestVideoImage}
                    />
                    <Text style={styles.latestVideoTitle}>{video.title}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreButtonText}>More Videos →</Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 20 : 0,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    premierLogo: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    matchdayTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateText: {
        color: 'white',
        fontSize: 16,
    },
    matchCardsContainer: {
        backgroundColor: '#e5006d',
        paddingBottom: 10,
    },
    matchCard: {
        backgroundColor: 'white',
        margin: 10,
        marginBottom: 5,
        borderRadius: 10,
        padding: 15,
    },
    matchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
    },
    teamLogo: {
        width: 25,
        height: 25,
    },
    teamName: {
        fontSize: 14,
        marginHorizontal: 10,
    },
    scoreContainer: {
        flex: 1,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    matchdayBanner: {
        backgroundColor: '#e5006d',
        padding: 15,
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    matchdayBannerText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrowText: {
        color: 'white',
        fontSize: 18,
    },
    newsHighlight: {
        margin: 10,
        marginTop: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    newsHighlightImage: {
        width: '100%',
        height: 200,
    },
    newsHighlightOverlay: {
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    newsHighlightTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    newsHighlightSubtitle: {
        color: '#ccc',
        fontSize: 14,
    },
    newsHighlightGallery: {
        flexDirection: 'row',
        padding: 10,
    },
    newsHighlightGalleryImage: {
        width: '48%',
        height: 80,
        marginRight: '4%',
        borderRadius: 5,
    },
    newsHighlightButtons: {
        flexDirection: 'row',
        padding: 10,
        paddingTop: 0,
    },
    newsHighlightButton: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    newsHighlightButtonText: {
        fontSize: 12,
    },
    newsHighlightInfo: {
        padding: 10,
    },
    newsHighlightInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    newsHighlightInfoIcon: {
        width: 30,
        height: 30,
        backgroundColor: '#37003c',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    newsHighlightInfoIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    newsHighlightInfoText: {
        fontSize: 14,
        flex: 1,
    },
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    activeTabButton: {
        backgroundColor: '#00b2ff',
    },
    tabButtonText: {
        fontWeight: 'bold',
        color: '#333',
    },
    tabContent: {
        margin: 10,
        marginTop: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    matchweekHeader: {
        backgroundColor: '#00b2ff',
        padding: 15,
    },
    matchweekTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    matchweekSubheader: {
        padding: 10,
        backgroundColor: '#f2f2f2',
    },
    matchweekSubheaderText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    matchweekDateHeader: {
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    matchweekDateText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    matchweekMatch: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
    },
    matchweekTeamContainer: {
        width: 40,
        alignItems: 'center',
    },
    matchweekTeamLogo: {
        width: 25,
        height: 25,
    },
    matchweekTimeContainer: {
        flex: 1,
        alignItems: 'center',
    },
    matchweekTimeText: {
        fontWeight: 'bold',
    },
    matchweekArrow: {
        width: 30,
        alignItems: 'center',
    },
    matchweekArrowText: {
        fontSize: 16,
    },
    viewAllFixtures: {
        padding: 15,
        alignItems: 'center',
    },
    viewAllFixturesText: {
        color: '#00b2ff',
        fontWeight: 'bold',
    },
    leagueTableHeader: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    leagueTableHeaderCell: {
        width: 40,
        alignItems: 'center',
    },
    leagueTableTeamCell: {
        flex: 1,
        alignItems: 'flex-start',
    },
    leagueTableHeaderText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#666',
    },
    leagueTableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        alignItems: 'center',
    },
    leagueTableCell: {
        width: 40,
        alignItems: 'center',
    },
    leagueTablePositionText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    leagueTableTeamLogo: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    leagueTableTeamText: {
        fontSize: 14,
    },
    leagueTableText: {
        fontSize: 14,
    },
    clubHighlight: {
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    clubHighlightGradient: {
        padding: 20,
    },
    clubHighlightContent: {
        alignItems: 'center',
    },
    clubHighlightLogo: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    clubHighlightName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    clubHighlightButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    clubHighlightButtonText: {
        color: 'white',
        marginRight: 5,
    },
    clubHighlightButtonIcon: {
        color: 'white',
    },
    relatedNews: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    relatedNewsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
    },
    relatedNewsLogo: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    relatedNewsTitle: {
        flex: 1,
        fontSize: 14,
    },
    moreButton: {
        alignItems: 'center',
        marginTop: 5,
    },
    moreButtonText: {
        color: '#00b2ff',
        fontWeight: 'bold',
    },
    latestNews: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
    },
    latestNewsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
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
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 80, // Extra space for bottom navigation
    },
    latestVideoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
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
    // bottomNav: {
    //     flexDirection: 'row',
    //     backgroundColor: '#fff',
    //     paddingVertical: 10,
    //     borderTopWidth: 1,
    //     borderTopColor: '#e0e0e0',
    //     position: 'absolute',
    //     bottom: 0,
    //     left: 0,
    //     right: 0,
    // },
    // navItem: {
    //     flex: 1,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
    // navIcon: {
    //     width: 24,
    //     height: 24,
    //     marginBottom: 5,
    //     tintColor: '#999',
    // },
    // navText: {
    //     color: '#999',
    //     fontSize: 12,
    // },
    // activeNavText: {
    //     color: '#37003c',
    // },
});

export default App;