import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllTeamAPI, updateUserFavouriteTeam } from "@/utils/api";
import { useApp } from "@/context/AppContext";

const TeamPickerModal = ({ visible, onClose }) => {
    const { user, setUser } = useApp();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible) {
            fetchTeams();
        }
    }, [visible]);

    const handleTeamSelect = async (team) => {
        // console.log("Selected team:", team);
        const { id, name, shortName, address, crest, tla, venue, website } =
            team;
        // Handle team selection here
        const res = await updateUserFavouriteTeam({
            id,
            name,
            shortName,
            address,
            crest,
            tla,
            venue,
            website,
        });
        if (res.data) {
            setUser({
                ...user,
                ...res.data,
            });
            onClose();
        }
    };

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await getAllTeamAPI();
            if (!response) {
                throw new Error("Failed to fetch teams");
            }
            const data = response;
            const sortedTeams = [...data.teams].sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            setTeams(sortedTeams);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching teams:", err);
            setError("Failed to load teams. Please try again.");
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#37003C" />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchTeams}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScrollView style={styles.teamsList}>
                {teams.map((team) => (
                    <TouchableOpacity
                        key={team.id}
                        style={styles.teamItem}
                        onPress={() => {
                            handleTeamSelect(team);
                        }}
                    >
                        <Image
                            source={{ uri: team.crest }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.teamName}>
                            {team.shortName || team.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pick your team</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#37003C" />
                        </TouchableOpacity>
                    </View>
                    {renderContent()}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    modalContent: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
        backgroundColor: "white",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#37003C",
    },
    closeButton: {
        padding: 8,
    },
    teamsList: {
        flex: 1,
        backgroundColor: "white",
    },
    teamItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    teamLogo: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    teamName: {
        fontSize: 16,
        color: "#333333",
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
        color: "#FF0000",
        marginBottom: 16,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#37003C",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "white",
        fontSize: 16,
    },
});

export default TeamPickerModal;
