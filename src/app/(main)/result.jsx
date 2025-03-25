import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator,
    Modal,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMatchesAPI } from "@/utils/api";
import { router } from "expo-router";

const competitions = [
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

function convertDateFormat(dateString) {
    // Danh sách tháng để chuyển đổi từ tên sang số
    const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
    };

    // Regex để tách thông tin từ chuỗi
    const regex = /(\w+), (\d{2}) (\w{3}) (\d{4})/;
    const match = dateString.match(regex);

    if (match) {
        const day = match[2];
        const month = months[match[3]];
        const year = match[4];

        return `${year}-${month}-${day}`;
    }

    return null; // Trả về null nếu chuỗi không đúng định dạng
}

const clubs = [{ id: "ALL", name: "All Clubs" }];

const DropdownModal = ({
    visible,
    onClose,
    items,
    selectedItem,
    onSelect,
    title,
}) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{title}</Text>
                <ScrollView>
                    {items.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.modalItem,
                                selectedItem.id === item.id &&
                                    styles.modalItemSelected,
                            ]}
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            <Text
                                style={[
                                    styles.modalItemText,
                                    selectedItem.id === item.id &&
                                        styles.modalItemTextSelected,
                                ]}
                            >
                                {item.name}
                            </Text>
                            {selectedItem.id === item.id && (
                                <Ionicons
                                    name="checkmark"
                                    size={24}
                                    color="#3b0053"
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Pressable>
    </Modal>
);

const Result = () => {
    const [matches, setMatches] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("First Team");
    const [selectedCompetition, setSelectedCompetition] = useState(
        competitions[0]
    );
    const [selectedClub, setSelectedClub] = useState(clubs[0]);
    const [competitionModalVisible, setCompetitionModalVisible] =
        useState(false);
    const [clubModalVisible, setClubModalVisible] = useState(false);

    const handleGetMatches = async (slug) => {
        setLoading(true);
        const res = await getMatchesAPI(
            slug
            // "competitions/CL/matches?dateFrom=2025-01-01&dateTo=2026-01-01&status=SCHEDULED"
            // "competitions/PL/matches?dateFrom=2025-01-01&dateTo=2026-01-01&status=SCHEDULED"
        );
        setLoading(false);
        const groupedMatches = groupMatchesByDate(res.data.matches.reverse());
        setMatches(groupedMatches);
    };

    useEffect(() => {
        handleGetMatches(
            `competitions/${selectedCompetition.id}/matches?dateFrom=2025-01-01&dateTo=2026-01-01&status=FINISHED`
        );
    }, [selectedCompetition.id]);

    const groupMatchesByDate = (matches) => {
        return matches.reduce((groups, match) => {
            const date = new Date(match.utcDate).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(match);
            return groups;
        }, {});
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getScoreDisplay = (match) => {
        if (match.status === "FINISHED") {
            return `${match.score.fullTime.home} - ${match.score.fullTime.away}`;
        } else {
            return formatTime(match.utcDate);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b0053" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchMatches}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fixtures</Text>
                <TouchableOpacity>
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View> */}

            {/* Tabs */}
            {/* <View style={styles.tabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {["First Team", "PL2", "U18"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab,
                            ]}
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
                </ScrollView>
            </View> */}

            {/* Filters */}
            <View style={styles.filters}>
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Competition</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setCompetitionModalVisible(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedCompetition.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#3b0053"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Club</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setClubModalVisible(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedClub.name}
                        </Text>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#3b0053"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown Modals */}
            <DropdownModal
                visible={competitionModalVisible}
                onClose={() => setCompetitionModalVisible(false)}
                items={competitions}
                selectedItem={selectedCompetition}
                onSelect={setSelectedCompetition}
                title="Select Competition"
            />

            <DropdownModal
                visible={clubModalVisible}
                onClose={() => setClubModalVisible(false)}
                items={clubs}
                selectedItem={selectedClub}
                onSelect={setSelectedClub}
                title="Select Club"
            />

            {/* Matches List */}
            <ScrollView style={styles.matchesList}>
                {Object.entries(matches).map(([date, dayMatches]) => (
                    <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>{date}</Text>
                        {dayMatches.map((match) => (
                            <TouchableOpacity
                                key={match.id}
                                style={styles.matchCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(main)/battleDetail",
                                        params: {
                                            homeTeamId: match.homeTeam.id,
                                            awayTeamId: match.awayTeam.id,
                                            matchDate: convertDateFormat(date),
                                        },
                                    })
                                }
                            >
                                <View style={styles.matchInfo}>
                                    <View style={styles.team}>
                                        <Text style={styles.teamName}>
                                            {match.homeTeam.shortName}
                                        </Text>
                                        <Image
                                            source={{
                                                uri: match.homeTeam.crest,
                                            }}
                                            style={styles.teamLogo}
                                        />
                                    </View>

                                    <View style={styles.matchTime}>
                                        <Text style={styles.timeText}>
                                            {getScoreDisplay(match)}
                                        </Text>
                                    </View>

                                    <View style={styles.team}>
                                        <Image
                                            source={{
                                                uri: match.awayTeam.crest,
                                            }}
                                            style={styles.teamLogo}
                                        />
                                        <Text style={styles.teamName}>
                                            {match.awayTeam.shortName}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
                                    color="#3b0053"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Result;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: "red",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#3b0053",
        padding: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "white",
        fontWeight: "500",
    },
    filterContainer: {
        flex: 1,
        marginHorizontal: 8,
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    dropdownText: {
        color: "#3b0053",
        fontSize: 16,
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxHeight: "70%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3b0053",
        marginBottom: 16,
        textAlign: "center",
    },
    modalItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalItemSelected: {
        backgroundColor: "#f0e6f5",
    },
    modalItemText: {
        fontSize: 16,
        color: "#333",
    },
    modalItemTextSelected: {
        color: "#3b0053",
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#3b0053",
        padding: 16,
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    tabs: {
        backgroundColor: "white",
        paddingVertical: 8,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: "#2196f3",
    },
    tabText: {
        color: "#666",
        fontWeight: "500",
    },
    activeTabText: {
        color: "white",
    },
    filters: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "white",
        marginTop: 1,
    },
    filterButton: {
        flex: 1,
        marginHorizontal: 8,
    },
    filterLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    filterValue: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 8,
        borderRadius: 4,
    },
    filterValueText: {
        color: "#3b0053",
        fontWeight: "500",
    },
    matchesList: {
        flex: 1,
    },
    dateGroup: {
        marginTop: 16,
    },
    dateHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3b0053",
        marginHorizontal: 16,
        marginBottom: 8,
    },
    matchCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 8,
        justifyContent: "space-between",
    },
    matchInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginRight: 16,
    },
    team: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    teamLogo: {
        width: 30,
        height: 30,
        marginHorizontal: 8,
    },
    teamName: {
        color: "#333",
        fontSize: 14,
        fontWeight: "500",
    },
    matchTime: {
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    timeText: {
        color: "#333",
        fontWeight: "500",
    },
});
