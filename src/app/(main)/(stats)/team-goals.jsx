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
import { getCompetitionStandingDetailAPI } from "../../../utils/api";

export default function TeamGoalsScreen() {
  const { season, competitionId } = useLocalSearchParams();
  const router = useRouter();
  const currentSeason = season || "2024";
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCompetitionStandingDetailAPI({ season: currentSeason });
      if (!response?.standings?.[0]?.table) throw new Error("Invalid standings data");

      // Sắp xếp theo goalsFor
      const sortedTeams = response.standings[0].table.sort((a, b) => b.goalsFor - a.goalsFor);
      setTeams(sortedTeams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [season, competitionId]);

  const navigateToTeamDetail = (teamId) => {
    router.push({
      pathname: "(main)/teams",
      params: { teamId, season: currentSeason },
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
          <Text style={styles.headerBarTitle}>Clubs</Text>
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
        <Text style={styles.headerBarTitle}>Clubs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Title Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Goals</Text>
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

        {/* Top Team Card */}
        {teams.length > 0 && (
          <TouchableOpacity
            style={styles.topScorer}
            onPress={() => navigateToTeamDetail(teams[0].team.id)}
            activeOpacity={0.9}
          >
            <View style={styles.topScorerGradient}>
              <View style={styles.topScorerContent}>
                <View style={styles.topScorerInfo}>
                  <Text style={styles.topScorerRank}>1</Text>
                  <Text style={styles.topScorerName}>{teams[0].team.name}</Text>
                  <Text style={styles.topScorerGoals}>{teams[0].goalsFor}</Text>
                </View>
                <Image source={{ uri: teams[0].team.crest }} style={styles.topScorerImage} resizeMode="contain" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* List of other teams */}
        <View style={styles.scorersList}>
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, styles.posColumn]}>Pos</Text>
            <Text style={[styles.headerText, styles.playerColumn]}>Team</Text>
            <Text style={[styles.headerText, styles.valueColumn]}>Goals</Text>
          </View>

          {teams.slice(1).map((team, index) => (
            <Pressable
              key={team.team.id}
              style={({ pressed }) => [styles.scorerRow, pressed && styles.scorerRowPressed]}
              onPress={() => navigateToTeamDetail(team.team.id)}
            >
              <Text style={[styles.posValue, styles.posColumn]}>{index + 2}</Text>
              <View style={[styles.clubContainer, styles.playerColumn]}>
                <Image source={{ uri: team.team.crest }} style={styles.clubLogo} />
                <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
                  {team.team.name}
                </Text>
              </View>
              <Text style={[styles.scoreValue, styles.valueColumn]}>{team.goalsFor}</Text>
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
    marginBottom:  20
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
  },
  clubLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#37003C",
    textAlign: "right",
  },
});