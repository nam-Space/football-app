import axios from "@/utils/axios.customize";

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1';
const FOOTBALL_DATA_URL = 'https://api.football-data.org/v4';
const FOOTBALL_DATA_TOKEN = '9f593c01e6e74e1e8e36348290c1cc2f';

// Tạo instance axios cho Football Data API
const footballDataApi = axios.create({
    baseURL: FOOTBALL_DATA_URL,
    headers: {
        'X-Auth-Token': FOOTBALL_DATA_TOKEN
    }
});

// Tạo instance axios cho ESPN API
const espnApi = axios.create({
    baseURL: BASE_URL
});

// API Videos
export const getVideosAPI = async () => {
    try {
        const response = await espnApi.get('/news');
        // Lọc các bài viết có video
        const videos = response.data.articles
            .filter(article => article.video && article.video.links.source.HD)
            .map(article => ({
                title: article.headline,
                thumbnail: article.video.thumbnail,
                url: article.video.links.source.HD.href
            }));
        return videos;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
};

// API News
export const getNewsHighlight = async () => {
    try {
        const response = await espnApi.get('/news');
        return response.data.articles.slice(0, 5); // Lấy 5 tin nổi bật
    } catch (error) {
        console.error('Error fetching news highlights:', error);
        throw error;
    }
};

export const getNewsFromESPN = async () => {
    try {
        const response = await espnApi.get('/news');
        return response.data.articles;
    } catch (error) {
        console.error('Error fetching news from ESPN:', error);
        throw error;
    }
};

export const getNewsDetail = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching news detail:', error);
        throw error;
    }
};

// API Matches
export const getMatchesFromESPN = async () => {
    try {
        const response = await espnApi.get('/scoreboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching matches from ESPN:', error);
        throw error;
    }
};

// API Standings
export const getCompetitionStandingDetailAPI = async () => {
    try {
        const response = await footballDataApi.get('/competitions/PL/standings');
        return response.data;
    } catch (error) {
        console.error('Error fetching standings:', error);
        throw error;
    }
};
