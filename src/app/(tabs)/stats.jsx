"use client";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getCompetitionDetailAPI,
  getCompetitionStandingDetailAPI,
  getCompetitionScoreDetailAPI,
  getTeamMatchesAPI,
  getPlayerImageAPI,
} from "../../utils/api";
import { useRouter } from "expo-router";

const colors = {
  primary: "#37003C",
  secondary: "#DB0007",
  white: "white",
  gray: "#e0e0e0",
  lightGray: "#f5f5f5",
};

const StatCard = ({ title, value, image, teamLogo, playerId, teamId, season }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={() => {
        if (playerId) {
          router.push({
            pathname: "(main)/player",
            params: { season },
          });
        } else if (teamId) {
          router.push({
            pathname: "(main)/teams",
            params: { season },
          });
        }
      }}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.playerImage}
          defaultSource={{ uri: "https://via.placeholder.com/250x250" }}
        />
      ) : (
        teamLogo && (
          <View style={styles.teamLogoContainer}>
            <Image source={{ uri: teamLogo }} style={styles.teamLogoBackground} />
          </View>
        )
      )}
      <View style={styles.statCardContent}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={styles.statCardValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const MenuLink = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuLink} onPress={onPress}>
      <Text style={styles.menuLinkText}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
};

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);

        // 1. Get competition details
        const competitionResponse = await getCompetitionDetailAPI();
        if (!competitionResponse?.currentSeason || !competitionResponse.id) {
          throw new Error("Invalid competition data");
        }
        const competitionId = competitionResponse.id;
        const currentSeason = competitionResponse.currentSeason;
        const seasonYear = currentSeason.startDate.split("-")[0];
        const nextYear = (parseInt(seasonYear) + 1).toString().slice(-2);
        const season = `${seasonYear}/${nextYear}`;

        // 2. Get standings
        const standingsResponse = await getCompetitionStandingDetailAPI({ season: seasonYear });
        if (!standingsResponse?.standings?.[0]?.table?.[0]) {
          throw new Error("Invalid standings data");
        }
        const topTeam = standingsResponse.standings[0].table[0];
        const teamId = topTeam.team.id;
        const teamGoals = topTeam.goalsFor;

        // 3. Get top scorer
        const scorersResponse = await getCompetitionScoreDetailAPI(competitionId, { season: seasonYear });
        if (!scorersResponse?.scorers?.[0]) {
          throw new Error("Invalid scorers data");
        }
        const topScorer = scorersResponse.scorers[0];
        const topScorerGoals = topScorer.goals;
        const topScorerAssists = topScorer.assists || 0;
        const topScorerName = topScorer.player.name;
        const topScorerId = topScorer.player.id;

        // Get player image
        const playerResponse = await getPlayerImageAPI(topScorerName);
        if (!playerResponse?.imageUrl) {
          console.warn(`No image found for player: ${topScorerName}`);
        }
        const playerImage = playerResponse?.imageUrl || "https://via.placeholder.com/250x250";

        // 4. Get team matches with status FINISHED for the entire season
        const startDate = currentSeason.startDate;
        const endDate = currentSeason.endDate;
        let allMatches = [];
        let page = 1;
        const limit = 100;

        while (isMounted) {
          const teamMatchesResponse = await getTeamMatchesAPI(teamId, {
            season: seasonYear,
            dateFrom: startDate,
            dateTo: endDate,
            status: "FINISHED",
            limit,
            page,
          });

          if (!teamMatchesResponse?.matches) {
            console.error("No matches found in teamMatchesResponse");
            throw new Error("Failed to fetch team matches");
          }

          allMatches = [...allMatches, ...teamMatchesResponse.matches];
          if (teamMatchesResponse.matches.length < limit) break; // No more matches
          page += 1;
        }

        // Remove duplicates (if any) based on match ID
        const uniqueMatches = Array.from(new Map(allMatches.map((match) => [match.id, match])).values());
        let cleanSheets = 0;

        // Calculate Clean Sheets for competition matches only
        uniqueMatches.forEach((match) => {
          if (match.competition?.id !== competitionId) return; // Only competition matches
          if (!match.score?.fullTime) return; // Ensure full-time score exists
          const isHomeTeam = match.homeTeam?.id === teamId;
          const opponentScore = isHomeTeam ? match.score.fullTime.away : match.score.fullTime.home;
          if (opponentScore === 0) {
            cleanSheets += 1;
          }
        });

        // Set stats
        if (isMounted) {
          setStats({
            season,
            topStats: {
              playerGoals: {
                title: "Goals",
                value: topScorerGoals,
                image: playerImage,
                playerId: topScorerId,
                season: seasonYear,
              },
              playerAssists: {
                title: "Assists",
                value: topScorerAssists,
                image: playerImage,
                playerId: topScorerId,
                season: seasonYear,
              },
              teamGoals: {
                title: "Goals",
                value: teamGoals,
                teamLogo: topTeam.team.crest,
                teamId: teamId,
                season: seasonYear,
              },
              cleanSheets: {
                title: "Clean Sheets",
                value: cleanSheets,
                teamLogo: topTeam.team.crest,
                teamId: teamId,
                season: seasonYear,
              },
            },
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch stats. Please check API permissions or subscription.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered By</Text>
            <Text style={styles.oracleText}>ORACLE CLOUD</Text>
          </View>
        </View>

        {/* Top Stats Section */}
        <View style={styles.topStatsSection}>
          <Text style={styles.sectionTitle}>{stats.season} Top Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard {...stats.topStats.playerGoals} />
            <StatCard {...stats.topStats.playerAssists} />
            <StatCard {...stats.topStats.teamGoals} />
            <StatCard {...stats.topStats.cleanSheets} />
          </View>
        </View>

        {/* Menu Links */}
        <View style={styles.menuSection}>
          {/* TODO: Implement navigation for menu links */}
          <MenuLink title="Statistics" onPress={() => {}} />
          <MenuLink title="All-time Stats" onPress={() => {}} />
          <MenuLink title="Records" onPress={() => {}} />
          <MenuLink title="Player Comparison" onPress={() => {}} />
          <MenuLink title="PL2 Stats" onPress={() => {}} />
          <MenuLink title="U18 Stats" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.white,
  },
  poweredBy: {
    alignItems: "flex-start",
  },
  poweredByText: {
    color: colors.white,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "normal",
    textTransform: "capitalize",
    lineHeight: 12,
  },
  oracleText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "normal",
    textTransform: "uppercase",
    lineHeight: 20,
  },
  topStatsSection: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  playerImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  teamLogoContainer: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  teamLogoBackground: {
    width: 80,
    height: 80,
    opacity: 0.2,
  },
  statCardContent: {
    backgroundColor: colors.white,
    padding: 6,
    alignItems: "center",
  },
  statCardTitle: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "normal",
  },
  statCardValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightGray,
  },
  menuLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  menuLinkText: {
    fontSize: 18,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.white,
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});