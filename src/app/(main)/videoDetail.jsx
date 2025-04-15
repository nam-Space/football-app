import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function VideoDetail() {
    const params = useLocalSearchParams();

    React.useEffect(() => {
        StatusBar.setHidden(true);
        return () => StatusBar.setHidden(false);
    }, []);

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: params.url }}
                style={styles.video}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={false}
                automaticallyAdjustContentInsets={true}
            />
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
}); 