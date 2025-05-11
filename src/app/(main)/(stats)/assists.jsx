"use client";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCompetitionScoreDetailAPI, getPlayerImageAPI } from "../../../utils/api";

export default function AssistsScreen() {
  const { season, competitionId } = useLocalSearchParams();
  const router = useRouter();
  const currentSeason = season || "2024";
  const [scorers, setScorers] = useState([]);
  const [topScorerImage, setTopScorerImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch list of top scorers
      const scorersResponse = await getCompetitionScoreDetailAPI(competitionId, { season: currentSeason, limit: 100 });
      if (!scorersResponse?.scorers) throw new Error("Invalid player data");

      // Sắp xếp theo assists
      const sortedScorers = scorersResponse.scorers
        .filter((scorer) => scorer.assists > 0)
        .sort((a, b) => b.assists - a.assists);
      setScorers(sortedScorers);

      // Fetch image of the top assister
      const topAssisterName = sortedScorers[0]?.player?.name;
      if (topAssisterName) {
        const playerResponse = await getPlayerImageAPI(topAssisterName);
        setTopScorerImage(playerResponse?.imageUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [season, competitionId]);

  const navigateToPlayerDetail = (playerId) => {
    router.push({
      pathname: "(main)/player",
      params: { playerId, season: currentSeason },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#37003C" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#37003C" />
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>Player</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#37003C" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Player</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Title Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assists</Text>
          <Text style={styles.season}>{currentSeason}/25</Text>
        </View>

        {/* Oracle Sponsor */}
        <View style={styles.oracleContainer}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <Image
            source={{ uri: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" }}
            style={styles.oracleLogo}
            resizeMode="contain"
          />
        </View>

        {/* Top Assister Card */}
        {scorers.length > 0 && (
          <TouchableOpacity
            style={styles.topScorer}
            onPress={() => navigateToPlayerDetail(scorers[0].player.id)}
            activeOpacity={0.9}
          >
            <View style={styles.topScorerGradient}>
              <View style={styles.topScorerContent}>
                <View style={styles.topScorerInfo}>
                  <Text style={styles.topScorerRank}>1</Text>
                  <Text style={styles.topScorerName}>{scorers[0].player.name}</Text>
                  <View style={styles.topScorerTeam}>
                    <Image source={{ uri: scorers[0].team.crest }} style={styles.topScorerTeamLogo} />
                    <Text style={styles.topScorerTeamName}>{scorers[0].team.name}</Text>
                  </View>
                  <Text style={styles.topScorerGoals}>{scorers[0].assists}</Text>
                </View>
                <Image
                  source={{
                    uri: topScorerImage || "https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png",
                  }}
                  style={styles.topScorerImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* List of other assisters */}
        <View style={styles.scorersList}>
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, styles.posColumn]}>Pos</Text>
            <Text style={[styles.headerText, styles.playerColumn]}>Player</Text>
            <Text style={[styles.headerText, styles.clubColumn]}>Club</Text>
            <Text style={[styles.headerText, styles.valueColumn]}>Assists</Text>
          </View>

          {scorers.slice(1).map((scorer, index) => (
            <Pressable
              key={scorer.player.id}
              style={({ pressed }) => [styles.scorerRow, pressed && styles.scorerRowPressed]}
              onPress={() => navigateToPlayerDetail(scorer.player.id)}
            >
              <Text style={[styles.posValue, styles.posColumn]}>{index + 2}</Text>
              <Text style={[styles.playerName, styles.playerColumn]} numberOfLines={1} ellipsizeMode="tail">
                {scorer.player.name}
              </Text>
              <View style={[styles.clubContainer, styles.clubColumn]}>
                <Image source={{ uri: scorer.team.crest }} style={styles.clubLogo} />
                <Text style={styles.clubCode}>{scorer.team.tla}</Text>
              </View>
              <Text style={[styles.scoreValue, styles.valueColumn]}>{scorer.assists}</Text>
            </Pressable>
          ))}
        </View>

        {/* Extra padding at bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#37003C",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#DB0007",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#37003C",
  },
  backButton: {
    marginRight: 16,
  },
  headerBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    fontFamily: "System",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#37003C",
    fontFamily: "System",
  },
  season: {
    fontSize: 24,
    color: "#37003C",
    fontFamily: "System",
  },
  oracleContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  poweredByText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  oracleLogo: {
    width: 180,
    height: 60,
  },
  topScorer: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  topScorerGradient: {
    backgroundColor: "#DB0007",
    overflow: "hidden",
  },
  topScorerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  topScorerInfo: {
    flex: 1,
  },
  topScorerRank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  topScorerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  topScorerTeam: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  topScorerTeamLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  topScorerTeamName: {
    fontSize: 18,
    color: "white",
  },
  topScorerGoals: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  topScorerImage: {
    width: 100,
    height: 100,
    marginLeft: 16,
  },
  scorersList: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#8a5a8e",
    textTransform: "uppercase",
  },
  scorerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  scorerRowPressed: {
    backgroundColor: "#f5f5f5",
  },
  posColumn: {
    width: 40,
  },
  playerColumn: {
    flex: 1,
  },
  clubColumn: {
    width: 100,
    alignItems: "center",
  },
  valueColumn: {
    width: 60,
    textAlign: "right",
  },
  posValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#37003C",
  },
  playerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  clubContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  clubLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  clubCode: {
    fontSize: 16,
    color: "#666",
    textTransform: "uppercase",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#37003C",
    textAlign: "right",
  },
});