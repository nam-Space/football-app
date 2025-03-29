"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { getPlayerDetailAPI, getPlayerStatsAPI } from "@/utils/api"
import { theme } from "@/constants/theme"

const PlayerScreen = () => {
  const { playerId = "8080" } = useLocalSearchParams()
  const [player, setPlayer] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("Overview")

  useEffect(() => {
    fetchPlayerData()
  }, [playerId])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      const playerData = await getPlayerDetailAPI(playerId)
      setPlayer(playerData)

      const statsData = await getPlayerStatsAPI(playerId)
      setPlayerStats(statsData)

      setLoading(false)
    } catch (err) {
      console.error("Error fetching player data:", err)
      setError("Failed to load player data")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading player data...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="white" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlayerData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!player) return null

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(player.dateOfBirth)

  // Hardcode PL Debut since it's not in the API (as per screenshot)
  const plDebut = "19 August 2024"

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{player.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Player Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerPosition}>{player.position}</Text>
              <Text style={styles.playerNumber}>{player.shirtNumber}</Text>
            </View>
            <Image
              source={{ uri: player.image }}
              style={styles.playerImage}
            />
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy Player Shirt</Text>
            <Ionicons name="open-outline" size={16} color="black" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Overview" && styles.activeTab]}
            onPress={() => setActiveTab("Overview")}
          >
            <Text style={[styles.tabText, activeTab === "Overview" && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Stats" && styles.activeTab]}
            onPress={() => setActiveTab("Stats")}
          >
            <Text style={[styles.tabText, activeTab === "Stats" && styles.activeTabText]}>Stats</Text>
          </TouchableOpacity>
        </View>

        {activeTab === "Overview" ? (
          <View style={styles.statsContainer}>
            {/* Personal Details Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Personal details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nationality</Text>
                <View style={styles.nationalityContainer}>
                  <Image
                    source={{ uri: player.currentTeam.area.flag }}
                    style={styles.flagIcon}
                  />
                  <Text style={styles.detailValue}>{player.nationality}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date of Birth</Text>
                <Text style={styles.detailValue}>
                  {new Date(player.dateOfBirth).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '/')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{age}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Club</Text>
                <View style={styles.clubContainer}>
                  <Text style={styles.detailValue}>{player.currentTeam.name}</Text>
                  <Image source={{ uri: player.currentTeam.crest }} style={styles.clubLogo} />
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Position</Text>
                <Text style={styles.detailValue}>{player.position}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PL Debut</Text>
                <Text style={styles.detailValue}>{plDebut}</Text>
              </View>
            </View>

            {/* Premier League Record Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Premier League Record</Text>
              <View style={styles.recordContainer}>
                <View style={styles.recordItem}>
                  <Text style={styles.recordValue}>22</Text>
                  <Text style={styles.recordLabel}>Appearances</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordValue}>1</Text>
                  <Text style={styles.recordLabel}>Clean Sheets</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordValue}>3</Text>
                  <Text style={styles.recordLabel}>Wins</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordValue}>14</Text>
                  <Text style={styles.recordLabel}>Losses</Text>
                </View>
              </View>
            </View>

            {/* PL Playing Career */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>PL Playing Career</Text>
              <View style={styles.careerRow}>
                <Text style={styles.careerLabel}>Season</Text>
                <Text style={styles.careerLabel}>Club</Text>
                <Text style={styles.careerLabel}>Apps(Sub)</Text>
                <Text style={styles.careerLabel}>Goals</Text>
              </View>
              <View style={styles.careerRow}>
                <Text style={styles.careerValue}>2024/25</Text>
                <Text style={styles.careerValue}>LEI</Text>
                <Text style={styles.careerValue}>22(0)</Text>
                <Text style={styles.careerValue}>0</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {/* Goalkeeping Stats */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Goalkeeping</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Clean Sheets</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Saves</Text>
                <Text style={styles.statValue}>84</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Penalties Saved</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>gk_smother</Text>
                <Text style={styles.statValue}>5</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Punches</Text>
                <Text style={styles.statValue}>16</Text>
              </View>
            </View>

            {/* Defensive Stats */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Defence</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tackles</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Recoveries</Text>
                <Text style={styles.statValue}>162</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>duel_won</Text>
                <Text style={styles.statValue}>8</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>duel_lost</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Aerial Battles Won</Text>
                <Text style={styles.statValue}>4</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>aerial_lost</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Clearances</Text>
                <Text style={styles.statValue}>25</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Launches</Text>
                <Text style={styles.statValue}>239</Text>
              </View>
            </View>

            {/* Team Play Stats */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Team Play</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Passes</Text>
                <Text style={styles.statValue}>734</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accurate Long Balls</Text>
                <Text style={styles.statValue}>112</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#37003C",
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
    backgroundColor: "#37003C",
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: "#db1414", // Leicester City blue
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playerPosition: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  playerNumber: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  playerImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  buyButtonText: {
    color: "black",
    fontWeight: "600",
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: "#37003C",
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  statsContainer: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#0057B8",
  },
  sectionTitle: {
    color: "#37003C",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12, // Increased padding for better spacing
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    color: "#333",
    fontSize: 16,
    fontWeight: "400", // Match the lighter font weight in the screenshot
  },
  detailValue: {
    color: "#37003C",
    fontSize: 16,
    fontWeight: "600", // Slightly bolder for emphasis
  },
  nationalityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  clubContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubLogo: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  recordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  recordItem: {
    alignItems: "center",
    width: "45%",
    marginBottom: 16,
  },
  recordValue: {
    color: "#37003C",
    fontSize: 36,
    fontWeight: "bold",
  },
  recordLabel: {
    color: "#333",
    fontSize: 16,
    marginTop: 4,
  },
  careerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  careerLabel: {
    color: "#333",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  careerValue: {
    color: "#37003C",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statLabel: {
    color: "#333",
    fontSize: 16,
  },
  statValue: {
    color: "#37003C",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default PlayerScreen