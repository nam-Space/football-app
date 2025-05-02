import axios from "@/utils/axios.customize";
import apiFB from "../utils/configApiFoodBall";
/* Video */
export const getVideosAPI = () => axios.get(`/api/videos`);

export const getRelatedVideosAPI = (keyword) =>
    axios.get(`/api/videos/related-videos/${keyword}`);

export const getRelatedVideosBattleAPI = (config) =>
    axios.get(`/api/videos/related-videos-battle`, { params: { ...config } });

/* News */
export const getRelatedNewsAPI = (keyword) =>
    axios.get(`/api/news/related-news/${keyword}`);

export const getNewsDetailAPI = (config) =>
    axios.get(`/api/news/news-detail`, { params: { ...config } });

export const getNewsHighlight = (config) => {
    const url = `/api/news`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getRelatedNewsBattleAPI = (config) =>
    axios.get(`/api/news/related-news-battle`, { params: { ...config } });

/* User */
export const loginUserAPI = (data) => axios.post(`/api/users/login`, { ...data });

export const registerUserAPI = (data) => axios.post(`/api/users/register`, { ...data });

export const getUserAccountAPI = () => axios.get(`/api/users/account`);

export const updateUser = (id, data) => {
    const url = `/api/users/${id}`;
    return axios.put(url, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateUserFavouriteTeam = (data) =>
    axios.put(`/api/users/update-favourite`, { ...data });

export const getPlayerImageAPI = (playerName) =>
    axios.get(`/api/players/player-image-url/${playerName}`);

/* Match */
export const getMatchesAPI = (slug) =>
    axios.get(`/api/matches`, { params: { slug } });

export const getMatchesOfTeamIdAPI = (teamId, config) =>
    axios.get(`/api/matches/teamId/${teamId}`, { params: { ...config } });

export const getCompetitionMatchesAPI = (config) =>
    axios.get(`/api/competitions/competition-matches`, { params: { ...config } });

export const getStatisticOfTeamIdAPI = (teamId) =>
    axios.get(`/api/matches/statistics/${teamId}`);

/* Battle */
export const getBattleByTeamIdAPI = (config) =>
    axios.get(`/api/battles`, { params: { ...config } });

export const getBattleByIdAPI = (id) =>
    axios.get(`/api/battles/battle-detail/${id}`);

export const getBattleStatisticByIdAPI = (id) =>
    axios.get(`/api/battles/stats/${id}`);

export const getBattleStatisticByTeamIdAPI = (config) =>
    axios.get(`/api/battles/battle-stats`, { params: { ...config } });

export const getBattleReportByIdAPI = (id) =>
    axios.get(`/api/battles/report/${id}`);

export const getBattleReportByTeamIdAPI = (config) =>
    axios.get(`/api/battles/battle-report`, { params: { ...config } });

export const getBattleCommentaryByBattleIdAPI = (id) =>
    axios.get(`/api/battles/commentary/${id}`);

export const getBattleCommentaryByTeamIdAPI = (config) =>
    axios.get(`/api/battles/battle-commentary`, { params: { ...config } });

export const getBattleHighlightByTeamIdAPI = (config) =>
    axios.get(`/api/battles/battle-highlights`, { params: { ...config } });

export const getBattleHeadToHeadByTeamIdAPI = (config) =>
    axios.get(`/api/battles/head-to-head`, { params: { ...config } });

export const getBattleLineupByIdAPI = (id) =>
    axios.get(`/api/battles/lineup/${id}`);

/* Team */
export const getAllTeamAPI = () => axios.get(`/api/teams`);

export const getTeamDetailAPI = (teamId) =>
    axios.get(`/api/teams/${teamId}`);

export const getTeamMatchesAPI = (teamId, config) =>
    axios.get(`/api/teams/team-matches/${teamId}`, { params: { ...config } });

/* Player */
export const getPlayerDetailAPI = (playerId) =>
    axios.get(`/api/players/${playerId}`);

export const getPlayerStatsAPI = (playerId) =>
    axios.get(`/api/players/stats/${playerId}`);

/* Competitions */
export const getCompetitionDetailAPI = (competitionId = 2021) =>
    axios.get(`/api/competitions?competitionId=${competitionId}`);

export const getCompetitionStandingDetailAPI = (config) =>
    axios.get(`/api/competitions/standings`, { params: { ...config } });

export const getCompetitionScoreDetailAPI = (competitionId = 2021, params = {}) =>
    axios.get(`/api/competitions/scorers?competitionId=${competitionId}`, { params });

/* Comment */
export const getAllCommentsByArticleIdAPI = (articleId) =>
    axios.get(`/api/comments/${articleId}`);

export const createCommentAPI = (articleId, data) =>
    axios.post(`/api/comments/create/${articleId}`, { ...data });

export const updateCommentAPI = (commentId, data) => {
    const url = `/api/comments/update/${commentId}`;
    return axios.put(url, { ...data });
}

export const deleteCommentAPI = (id) => {
    const url = `/api/comments/delete/${id}`;
    return axios.delete(url);
}

export const getUpcomingMatches = async () => {
    const today = new Date();
    const plus2 = new Date();
    plus2.setDate(today.getDate() + 2);

    const format = (d) => d.toISOString().split("T")[0];
    const fromDate = format(today);
    const toDate = format(plus2);

    const slug = `/competitions/PL/matches?dateFrom=${fromDate}&dateTo=${toDate}&status=SCHEDULED`;
    const encodedSlug = encodeURIComponent(slug);

    const res = await apiFB.get("/competitions/PL/matches?dateFrom=2025-04-05&dateTo=2025-04-05&status=SCHEDULED");
    console.log(res);

    const matches = res?.data?.data?.matches || [];
    return { matches };
};

export const getVideos = async () => {
    try {
        const response = await fetch('https://www.premierleague.com/api/v1/video/latest');
        const data = await response.json();
        return data.videos || [];
    } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
    }
};

export const getMatchesFromESPN = async () => {
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi gọi API matches:', error);
        throw error;
    }
};
