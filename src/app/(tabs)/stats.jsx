"use client";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import {
  getCompetitionDetailAPI,
  getCompetitionStandingDetailAPI,
  getCompetitionScoreDetailAPI,
  getTeamMatchesAPI,
} from "../../utils/api";

const StatCard = ({ title, value, image, teamLogo }) => {
  return (
    <View style={styles.statCard}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.playerImage}
          defaultSource={{ uri: "https://via.placeholder.com/250x250" }} // Fallback image
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
    </View>
  );
};

const MenuLink = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuLink} onPress={onPress}>
      <Text style={styles.menuLinkText}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#37003C" />
    </TouchableOpacity>
  );
};

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin giải đấu để xác định mùa giải hiện tại
        const competitionResponse = await getCompetitionDetailAPI();
        const currentSeason = competitionResponse.currentSeason;
        const seasonYear = currentSeason.startDate.split("-")[0]; // 2024
        const nextYear = (parseInt(seasonYear) + 1).toString().slice(-2); // "25"
        const season = `${seasonYear}/${nextYear}`; // "2024/25"

        // 2. Lấy bảng xếp hạng để tìm đội đứng đầu
        const standingsResponse = await getCompetitionStandingDetailAPI({ season: seasonYear });
        const topTeam = standingsResponse.standings[0].table[0]; // Đội đứng đầu
        const teamId = topTeam.team.id; // 64 (Liverpool FC)
        const teamGoals = topTeam.goalsFor; // 69

        // 3. Lấy cầu thủ ghi bàn hàng đầu
        const scorersResponse = await getCompetitionScoreDetailAPI(2021, { season: seasonYear });
        const topScorer = scorersResponse.scorers[0]; // Cầu thủ ghi bàn hàng đầu
        const topScorerGoals = topScorer.goals; // 27
        const topScorerAssists = topScorer.assists || 0; // 16
        const topScorerName = topScorer.player.name; // "Mohamed Salah"

        // Lấy ảnh cầu thủ từ TheSportsDB
        const playerResponse = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(topScorerName)}`
        );
        const playerImage = playerResponse.data.player && playerResponse.data.player[0]?.strThumb
          ? playerResponse.data.player[0].strThumb
          : "https://via.placeholder.com/250x250"; // Fallback image

        // 4. Lấy danh sách trận đấu của đội đứng đầu để tính Clean Sheets
        const teamMatchesResponse = await getTeamMatchesAPI(teamId, {
          season: seasonYear,
          dateFrom: currentSeason.startDate, // "2024-08-16"
          dateTo: currentSeason.endDate, // "2025-05-25"
        });
        const matches = teamMatchesResponse.matches;
        let cleanSheets = 0;
        const cleanSheetMatches = []; // Để debug

        // Tính Clean Sheets: Chỉ tính các trận thuộc Premier League (competition.id === 2021)
        matches.forEach((match) => {
          // Lọc các trận thuộc Premier League
          if (match.competition.id !== 2021) return; // Bỏ qua nếu không phải Premier League

          if (!match.score || !match.score.fullTime) return; // Bỏ qua nếu không có dữ liệu tỷ số
          const isHomeTeam = match.homeTeam.id === teamId;
          const opponentScore = isHomeTeam ? match.score.fullTime.away : match.score.fullTime.home;
          if (opponentScore === 0) {
            cleanSheets += 1;
            cleanSheetMatches.push({
              matchId: match.id,
              homeTeam: match.homeTeam.name,
              awayTeam: match.awayTeam.name,
              score: `${match.score.fullTime.home}-${match.score.fullTime.away}`,
              date: match.utcDate,
            });
          }
        });

        // Tổng hợp dữ liệu để hiển thị
        setStats({
          season: season, // "2024/25"
          topStats: {
            playerGoals: {
              title: "Goals",
              value: topScorerGoals, // 27
              image: playerImage, // Ảnh từ TheSportsDB
            },
            playerAssists: {
              title: "Assists",
              value: topScorerAssists, // 16
              image: playerImage,
            },
            teamGoals: {
              title: "Goals",
              value: teamGoals, // 69
              teamLogo: topTeam.team.crest,
            },
            cleanSheets: {
              title: "Clean Sheets",
              value: cleanSheets, // Phải là 12
              teamLogo: topTeam.team.crest,
            },
          },
        });
      } catch (err) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
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
    backgroundColor: "#37003C",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#37003C",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  poweredBy: {
    alignItems: "flex-start",
  },
  poweredByText: {
    color: "white",
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "normal", // Không đậm
    textTransform: "capitalize", 
    lineHeight: 12, // Giảm khoảng cách giữa 2 dòng
  },
  oracleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "normal", // Không đậm
    textTransform: "uppercase", // Chữ in hoa
    lineHeight: 20, // Giảm khoảng cách
  },
  topStatsSection: {
    padding: 16,
    backgroundColor: "#37003C",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#DB0007",
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
    backgroundColor: "#DB0007",
  },
  teamLogoBackground: {
    width: 80,
    height: 80,
    opacity: 0.2,
  },
  statCardContent: {
    backgroundColor: "white",
    padding: 6,
    alignItems: "center",
  },
  statCardTitle: {
    fontSize: 16,
    color: "#37003C",
    textAlign: "center",
    fontWeight: "normal", // Không đậm
  },
  statCardValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#37003C",
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  menuLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuLinkText: {
    fontSize: 18,
    color: "#37003C",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});