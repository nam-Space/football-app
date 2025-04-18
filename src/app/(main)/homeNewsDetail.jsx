import React, { useState, useEffect } from 'react';
import {
    View,
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useApp } from "@/context/AppContext";
import moment from "moment";
import {
    createCommentAPI,
    deleteCommentAPI,
    getAllCommentsByArticleIdAPI,
    updateCommentAPI,
} from "@/utils/api";

const HomeNewsDetailScreen = () => {
    const params = useLocalSearchParams();
    const { user } = useApp();
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [editCommentId, setEditCommentId] = useState(null);

    const handleCommentSubmit = async () => {
        if (comment.trim()) {
            const commentData = {
                content: comment,
                articleId: params.id,
            };

            try {
                let res;
                if (editCommentId) {
                    res = await updateCommentAPI(editCommentId, { content: comment });
                    setEditCommentId(null);
                    setComments(comments.map(c => 
                        c._id === editCommentId 
                            ? { ...c, content: comment }
                            : c
                    ));
                } else {
                    res = await createCommentAPI(commentData);
                    if (res.data) {
                        setComments([res.data, ...comments]);
                    }
                }
                setComment("");
            } catch (error) {
                console.error("Error submitting comment:", error);
            }
        }
    };

    const fetchComments = async () => {
        const res = await getAllCommentsByArticleIdAPI(params.id);
        if (res.data) {
            setComments(res.data);
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            const res = await deleteCommentAPI(commentId);

            if (res.data) {
                fetchComments();
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleCommentEdit = (comment) => {
        setComment(comment.content);
        setEditCommentId(comment._id);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchComments();
            } catch (error) {
                console.error("Error loading comments:", error);
            }
        };
        loadData();
    }, [params.id]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{params.title}</Text>
            </View>

            <View style={styles.content}>
                <WebView
                    source={{ uri: params.url }}
                    style={styles.webview}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scrollEnabled={true}
                    scalesPageToFit={true}
                    useWebKit={true}
                    injectedJavaScript={`
                        document.body.style.backgroundColor = '#1a1a1a';
                        document.body.style.color = '#ffffff';
                        document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                        document.body.style.padding = '10px';
                        document.body.style.margin = '0';
                        
                        // Ẩn các phần tử không cần thiết
                        const elementsToHide = ['header', 'footer', 'nav', 'aside', 'iframe', 'noscript'];
                        elementsToHide.forEach(tag => {
                            const elements = document.getElementsByTagName(tag);
                            for (let i = 0; i < elements.length; i++) {
                                elements[i].style.display = 'none';
                            }
                        });

                        // Điều chỉnh kích thước hình ảnh
                        const images = document.getElementsByTagName('img');
                        for (let i = 0; i < images.length; i++) {
                            images[i].style.maxWidth = '100%';
                            images[i].style.height = 'auto';
                        }

                        // Điều chỉnh video
                        const videos = document.getElementsByTagName('video');
                        for (let i = 0; i < videos.length; i++) {
                            videos[i].style.maxWidth = '100%';
                            videos[i].style.height = 'auto';
                        }
                    `}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    )}
                />
            </View>

            <View style={styles.footer}>
                <View style={styles.commentSection}>
                    <Text style={styles.commentTitle}>Bình luận ({comments.length})</Text>

                    {user ? (
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Viết bình luận..."
                                placeholderTextColor="#666"
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleCommentSubmit}
                            >
                                <Text style={styles.submitButtonText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={styles.loginButtonText}>Đăng nhập để bình luận</Text>
                        </TouchableOpacity>
                    )}

                    <ScrollView style={styles.commentsList}>
                        {comments.map((comment, index) => (
                            <View key={comment._id} style={styles.commentItem}>
                                <View style={styles.commentHeader}>
                                    <Image
                                        source={{ uri: comment.user?.avatar || 'https://via.placeholder.com/40' }}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.commentInfo}>
                                        <Text style={styles.name}>{comment.user?.name}</Text>
                                        <Text style={styles.commentTime}>
                                            {moment(comment.createdAt).fromNow()}
                                        </Text>
                                    </View>
                                    {user?._id === comment.user?._id && (
                                        <View style={styles.commentActions}>
                                            <TouchableOpacity
                                                onPress={() => handleCommentEdit(comment)}
                                                style={styles.editButton}
                                            >
                                                <Text style={styles.buttonText}>Sửa</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleCommentDelete(comment._id)
                                                }
                                                style={styles.deleteButton}
                                            >
                                                <Text style={styles.buttonText}>
                                                    Xóa
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.commentText}>
                                    {comment.content}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        height: 60,
    },
    content: {
        flex: 1,
    },
    footer: {
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#333',
        maxHeight: '40%',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    headerTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
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
    commentSection: {
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
    },
    commentInputContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#333',
        color: '#ffffff',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        minHeight: 40,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    loginButtonText: {
        color: '#ffffff',
    },
    commentsList: {
        flexGrow: 0,
    },
    commentItem: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    commentTime: {
        fontSize: 12,
        color: "#999",
        marginLeft: 10,
    },
    commentText: {
        fontSize: 14,
        color: "#fff",
    },
    commentActions: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: "#3b0053",
        padding: 5,
        borderRadius: 5,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: "#ff6347",
        padding: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
    },
});

export default HomeNewsDetailScreen;