"use client"
import { useState, useEffect } from "react"
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
} from "react-native"
import { getCompetitionMatchesAPI, getCompetitionTeamsAPI } from "../../../utils/api"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function ClubsScreen() {
  const { season } = useLocalSearchParams() || {}
  const router = useRouter()
  const currentSeason = season || "2024"

  const [teamsWithCleanSheets, setTeamsWithCleanSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch teams
      const teamsResponse = await getCompetitionTeamsAPI({ competitionId: "PL", season: currentSeason, limit: 100  })
      if (!teamsResponse?.teams) throw new Error("Failed to fetch teams")
      const teams = teamsResponse.teams

      // Fetch matches
      const matchesResponse = await getCompetitionMatchesAPI({ competitionId: "PL", season: currentSeason, limit: 100  })
      if (!matchesResponse?.matches) throw new Error("Failed to fetch matches")
      const matches = matchesResponse.matches

      // Calculate clean sheets for each team
      const cleanSheetsCount = {}
      teams.forEach(team => {
        cleanSheetsCount[team.id] = { team, cleanSheets: 0 }
      })

      matches.forEach(match => {
        const homeTeamId = match.homeTeam.id
        const awayTeamId = match.awayTeam.id
        const homeGoals = match.score.fullTime.home
        const awayGoals = match.score.fullTime.away

        // Check for clean sheets
        if (awayGoals === 0 && cleanSheetsCount[homeTeamId]) {
          cleanSheetsCount[homeTeamId].cleanSheets += 1
        }
        if (homeGoals === 0 && cleanSheetsCount[awayTeamId]) {
          cleanSheetsCount[awayTeamId].cleanSheets += 1
        }
      })

      // Convert to array and sort by clean sheets
      const sortedTeams = Object.values(cleanSheetsCount)
        .filter(item => item.cleanSheets > 0)
        .sort((a, b) => b.cleanSheets - a.cleanSheets)

      setTeamsWithCleanSheets(sortedTeams)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [season])

  const navigateToTeamDetail = (teamId) => {
    const teamIdString = teamId ? teamId.toString() : null
    const seasonString = currentSeason ? currentSeason.toString() : null

    if (!teamIdString) {
      console.error("Invalid teamId:", teamId)
      return
    }
    if (!seasonString) {
      console.error("Invalid season:", currentSeason)
      return
    }

    router.push({ 
      pathname: '(main)/team',
      params: { season: seasonString, teamId: teamIdString },
    })
  }

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#37003C" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    )

  if (error)
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
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchData()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )

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
          <Text style={styles.headerTitle}>Clean Sheets</Text>
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
        {teamsWithCleanSheets.length > 0 && (
          <TouchableOpacity 
            style={styles.topTeam} 
            onPress={() => navigateToTeamDetail(teamsWithCleanSheets[0].team.id)}
            activeOpacity={0.9}
          >
            <View style={styles.topTeamContent}>
              <View style={styles.topTeamInfo}>
                <Text style={styles.topTeamRank}>1</Text>
                <Text style={styles.topTeamName}>{teamsWithCleanSheets[0].team.name}</Text>
                <Text style={styles.topTeamCleanSheets}>{teamsWithCleanSheets[0].cleanSheets}</Text>
              </View>
              <Image 
                source={{ uri: teamsWithCleanSheets[0].team.crest }} 
                style={styles.topTeamLogo} 
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        )}

        {/* List of other teams */}
        <View style={styles.teamsList}>
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, styles.posColumn]}>Pos</Text>
            <Text style={[styles.headerText, styles.clubColumn]}>Club</Text>
            <Text style={[styles.headerText, styles.valueColumn]}>Value</Text>
          </View>

          {teamsWithCleanSheets.slice(1).map((teamData, index) => (
            <Pressable
              key={teamData.team.id}
              style={({ pressed }) => [
                styles.teamRow,
                pressed && styles.teamRowPressed
              ]}
              onPress={() => navigateToTeamDetail(teamData.team.id)}
            >
              <Text style={[styles.posValue, styles.posColumn]}>{index + 2}</Text>
              <View style={[styles.clubColumn, styles.clubContainer]}>
                <Image 
                  source={{ uri: teamData.team.crest }} 
                  style={styles.clubLogo} 
                />
                <Text 
                  style={styles.clubName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {teamData.team.name}
                </Text>
              </View>
              <Text style={[styles.scoreValue, styles.valueColumn]}>{teamData.cleanSheets}</Text>
            </Pressable>
          ))}
        </View>
        
        {/* Extra padding at bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#37003C",
  },
  scrollView: {
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
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
    fontSize: 16,
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
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#37003C",
  },
  season: {
    fontSize: 24,
    color: "#37003C",
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
    fontStyle: "italic"
  },
  oracleLogo: {
    width: 180,
    height: 60,
  },
  topTeam: {
    backgroundColor: "#DB0007",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  topTeamContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  topTeamInfo: {
    flex: 1,
  },
  topTeamRank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  topTeamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  topTeamCleanSheets: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  topTeamLogo: {
    width: 100,
    height: 100,
    marginLeft: 16,
  },
  teamsList: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  listHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8a5a8e", // Lighter purple color for headers
    textTransform: "uppercase",
    textAlign:"center",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  teamRowPressed: {
    backgroundColor: "#f5f5f5",
  },
  posColumn: {
    width: 40,
  },
  clubColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  valueColumn: {
    width: 60,
    textAlign: "right",
  },
  posValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37003C",
  },
  clubContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubLogo: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  clubName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#37003C",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37003C",
    textAlign: "right",
  },
})