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
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCompetitionStandingDetailAPI } from "@/utils/api";
import { router } from "expo-router";

// Available competitions
const COMPETITIONS = [
    { id: "PL", name: "Premier League" },
    { id: "PD", name: "La Liga" },
    { id: "FA", name: "FA Cup" },
    { id: "EFL", name: "Carabao Cup" },
    { id: "SA", name: "Serie A" },
    { id: "BL1", name: "Bundesliga" },
    { id: "FL1", name: "Ligue 1" },
    { id: "CL", name: "UEFA Champions League" },
    { id: "EL", name: "UEFA Europa League" },
    { id: "ECL", name: "UEFA Conference League" },
];

// Available seasons
const SEASONS = [
    { id: "2024", name: "2024/25" },
    { id: "2023", name: "2023/24" },
    { id: "2022", name: "2022/23" },
    { id: "2021", name: "2021/22" },
    { id: "2020", name: "2020/21" },
];

// Home/Away filter options
const HOME_AWAY_OPTIONS = [
    { id: "ALL", name: "All" },
    { id: "HOME", name: "Home" },
    { id: "AWAY", name: "Away" },
];

// Sort options
const SORT_OPTIONS = [
    { id: "POSITION", name: "Position" },
    { id: "POINTS", name: "Points" },
    { id: "GOAL_DIFF", name: "Goal Difference" },
    { id: "GOALS_FOR", name: "Goals For" },
    { id: "GOALS_AGAINST", name: "Goals Against" },
];

const LeagueTable = ({ navigation }) => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("First Team");
    const [expandedRow, setExpandedRow] = useState(null);

    // Filter states
    const [selectedCompetition, setSelectedCompetition] = useState(
        COMPETITIONS[0]
    );
    const [selectedSeason, setSelectedSeason] = useState(SEASONS[0]);
    const [selectedHomeAway, setSelectedHomeAway] = useState(
        HOME_AWAY_OPTIONS[0]
    );
    const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

    // Modal states
    const [competitionModalVisible, setCompetitionModalVisible] =
        useState(false);
    const [seasonModalVisible, setSeasonModalVisible] = useState(false);
    const [homeAwayModalVisible, setHomeAwayModalVisible] = useState(false);
    const [sortModalVisible, setSortModalVisible] = useState(false);

    useEffect(() => {
        fetchStandings();
    }, [selectedCompetition, selectedSeason]);

    const fetchStandings = async () => {
        try {
            setLoading(true);
            const response = await getCompetitionStandingDetailAPI({
                competitionId: selectedCompetition.id,
                season: selectedSeason.id || 2024,
            });
            const data = response;

            if (data.error) {
                setStandings([]);
                setLoading(false);
                return;
            }

            let filteredTable = data.standings[0].table;

            // Apply home/away filter if needed
            if (selectedHomeAway.id === "HOME" && data.standings[1]) {
                filteredTable = data.standings[1].table; // Home standings
            } else if (selectedHomeAway.id === "AWAY" && data.standings[2]) {
                filteredTable = data.standings[2].table; // Away standings
            }

            // Apply sorting if needed
            if (selectedSort.id !== "POSITION") {
                filteredTable = [...filteredTable].sort((a, b) => {
                    switch (selectedSort.id) {
                        case "POINTS":
                            return b.points - a.points;
                        case "GOAL_DIFF":
                            return b.goalDifference - a.goalDifference;
                        case "GOALS_FOR":
                            return b.goalsFor - a.goalsFor;
                        case "GOALS_AGAINST":
                            return a.goalsAgainst - b.goalsAgainst;
                        default:
                            return a.position - b.position;
                    }
                });
            }

            setStandings(filteredTable);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching standings:", error);
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tables</Text>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {["First Team", "PL2", "U18"].map((tab) => (
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

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Competition</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setCompetitionModalVisible(true)}
                    >
                        <Text style={styles.filterValue}>
                            {selectedCompetition.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#37003C"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Season</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setSeasonModalVisible(true)}
                    >
                        <Text style={styles.filterValue}>
                            {selectedSeason.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#37003C"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Home/Away</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setHomeAwayModalVisible(true)}
                    >
                        <Text style={styles.filterValue}>
                            {selectedHomeAway.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#37003C"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Sort by</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setSortModalVisible(true)}
                    >
                        <Text style={styles.filterValue}>
                            {selectedSort.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#37003C"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, styles.positionColumn]}>
                Pos
            </Text>
            <Text style={[styles.columnHeader, styles.clubColumn]}>Club</Text>
            <Text style={[styles.columnHeader, styles.statsColumn]}>PL</Text>
            <Text style={[styles.columnHeader, styles.statsColumn]}>W</Text>
            <Text style={[styles.columnHeader, styles.statsColumn]}>D</Text>
            <Text style={[styles.columnHeader, styles.statsColumn]}>L</Text>
            <Text style={[styles.columnHeader, styles.statsColumn]}>GD</Text>
            <Text style={[styles.columnHeader, styles.ptsColumn]}>PTS</Text>
        </View>
    );

    const renderTableRow = (team, index) => {
        return (
            <TouchableOpacity
                key={team.team.id}
                style={styles.tableRow}
                onPress={() => {
                    setExpandedRow(
                        expandedRow === team.team.id ? null : team.team.id
                    );
                    router.push({
                        pathname: "/Club",
                        params: {
                            teamName1: team.team.shortName,
                        },
                    });
                }}
            >
                <Text style={[styles.cell, styles.positionColumn]}>
                    {team.position}
                </Text>
                <View style={[styles.cell, styles.clubColumn, styles.clubCell]}>
                    <Image
                        source={{ uri: team.team.crest }}
                        style={styles.teamLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.clubAbbr}>{team.team.tla}</Text>
                </View>
                <Text style={[styles.cell, styles.statsColumn]}>
                    {team.playedGames}
                </Text>
                <Text style={[styles.cell, styles.statsColumn]}>
                    {team.won}
                </Text>
                <Text style={[styles.cell, styles.statsColumn]}>
                    {team.draw}
                </Text>
                <Text style={[styles.cell, styles.statsColumn]}>
                    {team.lost}
                </Text>
                <Text style={[styles.cell, styles.statsColumn]}>
                    {team.goalDifference > 0
                        ? `+${team.goalDifference}`
                        : team.goalDifference}
                </Text>
                <Text style={[styles.cell, styles.ptsColumn]}>
                    {team.points}
                </Text>
                <Ionicons
                    name={
                        expandedRow === team.team.id
                            ? "chevron-up"
                            : "chevron-down"
                    }
                    size={20}
                    color="#37003C"
                />
            </TouchableOpacity>
        );
    };

    const renderFilterModal = (
        visible,
        setVisible,
        title,
        options,
        selectedOption,
        setSelectedOption
    ) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#37003C" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.modalOption,
                                    selectedOption.id === option.id &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => {
                                    setSelectedOption(option);
                                    setVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedOption.id === option.id &&
                                            styles.selectedOptionText,
                                    ]}
                                >
                                    {option.name}
                                </Text>
                                {selectedOption.id === option.id && (
                                    <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color="#00B2FF"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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

    return (
        <SafeAreaView style={styles.container}>
            {/* {renderHeader()} */}
            <ScrollView style={styles.content}>
                {/* {renderTabs()} */}
                {renderFilters()}
                {renderTableHeader()}
                {standings.map((team, index) => renderTableRow(team, index))}
            </ScrollView>

            {/* Filter Modals */}
            {renderFilterModal(
                competitionModalVisible,
                setCompetitionModalVisible,
                "Select Competition",
                COMPETITIONS,
                selectedCompetition,
                setSelectedCompetition
            )}

            {renderFilterModal(
                seasonModalVisible,
                setSeasonModalVisible,
                "Select Season",
                SEASONS,
                selectedSeason,
                setSelectedSeason
            )}

            {renderFilterModal(
                homeAwayModalVisible,
                setHomeAwayModalVisible,
                "Select Home/Away",
                HOME_AWAY_OPTIONS,
                selectedHomeAway,
                setSelectedHomeAway
            )}

            {renderFilterModal(
                sortModalVisible,
                setSortModalVisible,
                "Sort By",
                SORT_OPTIONS,
                selectedSort,
                setSelectedSort
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#37003C",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    content: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    tabContainer: {
        flexDirection: "row",
        padding: 8,
        backgroundColor: "white",
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: "#00B2FF",
    },
    tabText: {
        color: "#37003C",
        fontWeight: "500",
    },
    activeTabText: {
        color: "white",
    },
    filtersContainer: {
        padding: 16,
        backgroundColor: "white",
        marginTop: 8,
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    filterItem: {
        flex: 1,
        marginRight: 8,
    },
    filterLabel: {
        color: "#666",
        marginBottom: 4,
    },
    filterButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
        backgroundColor: "#f5f5f5",
        borderRadius: 4,
    },
    filterValue: {
        color: "#37003C",
        fontWeight: "500",
    },
    tableHeader: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    columnHeader: {
        color: "#666",
        fontSize: 12,
        fontWeight: "500",
    },
    tableRow: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
        alignItems: "center",
    },
    cell: {
        fontSize: 14,
        color: "#37003C",
    },
    positionColumn: {
        width: 40,
    },
    clubColumn: {
        flex: 1,
        marginRight: 8,
    },
    clubCell: {
        flexDirection: "row",
        alignItems: "center",
    },
    statsColumn: {
        width: 40,
        textAlign: "center",
    },
    ptsColumn: {
        width: 40,
        textAlign: "center",
        fontWeight: "bold",
    },
    teamLogo: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    clubAbbr: {
        color: "#37003C",
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#37003C",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#37003C",
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    selectedOption: {
        backgroundColor: "#F0F8FF",
    },
    modalOptionText: {
        fontSize: 16,
        color: "#333",
    },
    selectedOptionText: {
        color: "#00B2FF",
        fontWeight: "500",
    },
    loadingText: {
        color: "white",
        marginTop: 10,
        fontSize: 16,
    },
});

export default LeagueTable;
