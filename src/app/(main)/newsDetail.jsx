import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import RenderHtml from "react-native-render-html";
import { theme } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import moment from "moment"; // Để tính toán và hiển thị thời gian
import { useApp } from "@/context/AppContext";
import {
    createCommentAPI,
    deleteCommentAPI,
    getAllCommentsByArticleIdAPI,
    getNewsDetailAPI,
    updateCommentAPI,
} from "@/utils/api";

const tagsStyles = {
    div: {
        color: theme.colors.dark,
    },
    p: {
        color: theme.colors.dark,
    },
    h1: {
        color: theme.colors.dark,
    },
    h2: {
        color: theme.colors.dark,
    },
    h3: {
        color: theme.colors.dark,
    },
};

const NewsDetail = () => {
    const { id } = useLocalSearchParams();

    const { user } = useApp();
    const { width } = useWindowDimensions();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState(""); // State để lưu bình luận
    const [comments, setComments] = useState([]); // State để lưu danh sách các bình luận
    const [editCommentId, setEditCommentId] = useState(null); // ID của bình luận đang được sửa

    useEffect(() => {
        const getNewsDetail = async () => {
            setLoading(true);
            const res = await getNewsDetailAPI({
                articleId: id,
            });
            const data = res;
            setArticle(data);
            setLoading(false);
        };

        getNewsDetail();
    }, [id]);

    // Hàm để gửi bình luận đến server
    const handleCommentSubmit = async () => {
        if (comment.trim()) {
            const commentData = {
                articleId: id,
                commentContent: comment,
                titleArticle: article.title, // Tên người dùng mặc định (hoặc có thể lấy từ user data)
                descriptionArticle: article.description,
                contentArticle: article.content,
                urlArticle: article.url,
            };

            try {
                let res;
                if (editCommentId) {
                    // Nếu đang sửa bình luận, gọi API sửa
                    res = await updateCommentAPI(editCommentId, commentData);
                    setEditCommentId(null); // Reset ID khi đã sửa xong
                } else {
                    // Gửi bình luận mới
                    res = await createCommentAPI(id, commentData);
                }

                if (res.data) {
                    setComment(""); // Clear comment input
                    fetchComments(); // Load lại danh sách bình luận
                }
            } catch (error) {
                console.error("Error submitting comment:", error);
            }
        }
    };

    // Hàm để lấy danh sách bình luận
    const fetchComments = async () => {
        const res = await getAllCommentsByArticleIdAPI(id);
        if (res.data) {
            setComments(res.data);
        }
    };

    // Hàm để xóa bình luận
    const handleCommentDelete = async (commentId) => {
        try {
            const res = await deleteCommentAPI(commentId);

            if (res.data) {
                fetchComments(); // Load lại danh sách bình luận
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    // Hàm để chỉnh sửa bình luận
    const handleCommentEdit = (comment) => {
        setComment(comment.commentContent);
        setEditCommentId(comment._id); // Set ID của bình luận đang sửa
    };

    useEffect(() => {
        fetchComments(); // Lấy các bình luận ngay khi bài viết được tải
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b0053" />
            </View>
        );
    }

    if (!article || !article.html?.trim()) {
        return <Text>This page doesn't have content</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <RenderHtml
                contentWidth={width}
                source={{ html: article?.html }}
                tagsStyles={tagsStyles}
            />

            <View style={styles.commentSection}>
                <Text style={styles.commentTitle}>Comments</Text>

                {comments.map((comment, index) => (
                    <View key={index} style={styles.commentContainer}>
                        <View style={styles.commentHeader}>
                            <Image
                                source={{ uri: comment.avatar }}
                                style={styles.avatar}
                            />
                            <Text style={styles.name}>{comment.user.name}</Text>
                            <Text style={styles.commentTime}>
                                {moment(comment.createdAt).fromNow()}{" "}
                                {/* Hiển thị thời gian */}
                            </Text>
                        </View>
                        <Text style={styles.commentText}>
                            {comment.commentContent}
                        </Text>

                        {/* Sửa và xóa bình luận */}
                        {user._id == comment.user._id && (
                            <View style={styles.commentActions}>
                                <TouchableOpacity
                                    onPress={() => handleCommentEdit(comment)}
                                    style={styles.editButton}
                                >
                                    <Text style={styles.buttonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        handleCommentDelete(comment._id)
                                    }
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.buttonText}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}

                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment"
                    value={comment}
                    onChangeText={setComment}
                />
                <TouchableOpacity
                    onPress={handleCommentSubmit}
                    style={styles.submitButton}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        padding: 10,
    },
    commentSection: {
        marginTop: 20,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.colors.dark,
    },
    commentContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.dark,
    },
    commentTime: {
        fontSize: 12,
        color: theme.colors.grey,
        marginLeft: 10,
    },
    commentText: {
        fontSize: 14,
        color: theme.colors.dark,
    },
    commentActions: {
        flexDirection: "row",
        marginTop: 10,
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
    commentInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: "#3b0053",
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
    submitButtonText: {
        color: "#fff",
        textAlign: "center",
    },
});

export default NewsDetail;
