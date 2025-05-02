import React, { useState } from 'react';
import {
    View,
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

const NewsDetailScreen = () => {
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: params.url }}
                style={styles.webview}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scrollEnabled={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    webview: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
});

export default NewsDetailScreen;