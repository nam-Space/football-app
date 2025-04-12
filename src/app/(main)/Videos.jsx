import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { getVideosAPI } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Videos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const result = await getVideosAPI();
            if (Array.isArray(result)) {
                setVideos(result.slice(0, 20));
            }
            setLoading(false);
        } catch (err) {
            console.error("❌ Error fetching videos:", err);
            setLoading(false);
        }
    };

    const Header = () => (
        <LinearGradient
            colors={['#ff0080', '#ff8000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
        >
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Videos</Text>
            <View style={styles.placeholder} />
        </LinearGradient>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView style={styles.scrollView}>
                <View style={styles.videoGrid}>
                    {videos.map((video, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.videoItem}
                            onPress={() => {
                                router.push({
                                    pathname: "/videoDetail",
                                    params: {
                                        url: video.url,
                                        title: video.title,
                                        thumbnail: video.thumbnail
                                    }
                                });
                            }}
                        >
                            <View style={styles.thumbnailContainer}>
                                <Image
                                    source={{ uri: video.thumbnail }}
                                    style={styles.thumbnail}
                                />
                                <View style={styles.playButton}>
                                    <Ionicons name="play-circle" size={40} color="white" />
                                </View>
                            </View>
                            <View style={styles.videoInfo}>
                                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingBottom: 15,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoGrid: {
        padding: 10,
    },
    videoItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -20 },
            { translateY: -20 }
        ],
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});