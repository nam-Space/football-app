import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { router } from "expo-router";
import { getNewsHighlight } from "@/utils/api";
import { Ionicons } from '@expo/vector-icons';

const NewsScreen = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [webViewHeight, setWebViewHeight] = useState(0);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const result = await getNewsHighlight();
            const formattedNews = result.map(article => ({
                id: article.id,
                title: article.headline,
                description: article.description,
                image: article.images?.[0]?.url,
                url: article.links?.web?.href,
                publishedDate: new Date(article.published).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));
            setNews(formattedNews);
        } catch (err) {
            console.error('❌ Failed to fetch news:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNews();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>News</Text>
            </View>
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#37003C"]}
                    />
                }
            >
                {/* News List */}
                {news.map((article, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.newsItem}
                        onPress={() => {
                            router.push({
                                pathname: "/newsDetail",
                                params: {
                                    id: article.id,
                                    title: article.title,
                                    image: article.image,
                                    description: article.description,
                                    url: article.url,
                                    publishedDate: article.publishedDate
                                }
                            });
                        }}
                    >
                        <Image
                            source={{ uri: article.image }}
                            style={styles.newsImage}
                            resizeMode="cover"
                        />
                        <View style={styles.newsContent}>
                            <Text style={styles.newsTitle}>{article.title}</Text>
                            <Text style={styles.newsDescription}>{article.description}</Text>
                            <Text style={styles.newsDate}>{article.publishedDate}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#38004c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#4a0063',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#38004c',
    },
    scrollView: {
        flex: 1,
    },
    newsItem: {
        marginHorizontal: 15,
        marginVertical: 10,
        backgroundColor: '#4a0063',
        borderRadius: 10,
        overflow: 'hidden',
    },
    newsImage: {
        width: '100%',
        height: 200,
    },
    newsContent: {
        padding: 15,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    newsDescription: {
        fontSize: 14,
        color: '#ffffff99',
        marginBottom: 8,
        lineHeight: 20,
    },
    newsDate: {
        fontSize: 12,
        color: '#ffffff77',
    },
});

export default NewsScreen; 