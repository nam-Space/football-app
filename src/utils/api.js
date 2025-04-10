import axios from "@/utils/axios.customize";
import apiFB from "../utils/configApiFoodBall";
/* Video */
export const getVideosAPI = () => {
    const url = `/api/videos`;
    return axios.get(url);
};

export const getRelatedVideosAPI = (keyword) => {
    const url = `/api/videos/related-videos/${keyword}`;
    return axios.get(url);
};

export const getRelatedVideosBattleAPI = (config) => {
    const url = `/api/videos/related-videos-battle`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};


/* News */
export const getRelatedNewsAPI = (keyword) => {
    const url = `/api/news/related-news/${keyword}`;
    return axios.get(url);
};

export const getNewsDetailAPI = (config) => {
    const url = `/api/news/news-detail`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getRelatedNewsBattleAPI = (config) => {
    const url = `/api/news/related-news-battle`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getNewsHighlight = (config) => {
    const url = `/api/news`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};


/* User */
export const loginUserAPI = (data) => {
    const url = `/api/users/login`;
    return axios.post(url, { ...data });
};

export const registerUserAPI = (data) => {
    const url = `/api/users/register`;
    return axios.post(url, { ...data });
};

export const getUserAccountAPI = (data) => {
    const url = `/api/users/account`;
    return axios.get(url);
};

export const updateUserFavouriteTeam = (data) => {
    const url = `/api/users/update-favourite`;
    return axios.post(url, {
        ...data
    });
}

export const getPlayerImageAPI = (playerName) => {
    const url = `/api/players/player-image-url/${playerName}`;
    return axios.get(url);
}

/* Match */

export const getMatchesAPI = (slug) => {
    const url = `/api/matches`;
    return axios.get(url, {
        params: {
            slug
        }
    });
};

export const getMatchesOfTeamIdAPI = (teamId, config) => {
    const url = `/api/matches/teamId/${teamId}`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getCompetitionMatchesAPI = (config) => {
    const url = `/api/competitions/competition-matches`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getStatisticOfTeamIdAPI = (teamId) => {
    const url = `/api/matches/statistics/${teamId}`;
    return axios.get(url);
};

/* Battle */
export const getBattleByTeamIdAPI = (config) => {
    const url = `/api/battles`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleByIdAPI = (id) => {
    const url = `/api/battles/battle-detail/${id}`;
    return axios.get(url);
};

export const getBattleStatisticByIdAPI = (id) => {
    const url = `/api/battles/stats/${id}`;
    return axios.get(url);
};

export const getBattleStatisticByTeamIdAPI = (config) => {
    const url = `/api/battles/battle-stats`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleReportByIdAPI = (id) => {
    const url = `/api/battles/report/${id}`;
    return axios.get(url);
};

export const getBattleReportByTeamIdAPI = (config) => {
    const url = `/api/battles/battle-report`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleCommentaryByBattleIdAPI = (id) => {
    const url = `/api/battles/commentary/${id}`;
    return axios.get(url);
};

export const getBattleCommentaryByTeamIdAPI = (config) => {
    const url = `/api/battles/battle-commentary`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleHighlightByTeamIdAPI = (config) => {
    const url = `/api/battles/battle-highlights`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleHeadToHeadByTeamIdAPI = (config) => {
    const url = `/api/battles/head-to-head`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

export const getBattleLineupByIdAPI = (id) => {
    const url = `/api/battles/lineup/${id}`;
    return axios.get(url);
};

/* Team */
export const getAllTeamAPI = () => {
    const url = `/api/teams`;
    return axios.get(url);
};

export const getTeamDetailAPI = (teamId) => {
    const url = `/api/teams/${teamId}`;
    return axios.get(url);
};

export const getTeamMatchesAPI = (teamId, config) => {
    const url = `/api/teams/team-matches/${teamId}`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

/* Competitions */

export const getCompetitionStandingDetailAPI = (config) => {
    const url = `/api/competitions/standings`;
    return axios.get(url, {
        params: {
            ...config
        }
    });
};

/* Comment */
export const getAllCommentsByArticleIdAPI = (articleId) => {
    const url = `/api/comments/${articleId}`;
    return axios.get(url);
}

export const createCommentAPI = (articleId, data) => {
    const url = `/api/comments/create/${articleId}`;
    return axios.post(url, { ...data });
}


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

    // const res = await axios.get("/api/matches/competitions/PL/matches?dateFrom=2025-04-05&dateTo=2025-04-05&status=SCHEDULED", {
    //     // params: { slug: encodedSlug },
    // });

    const res = await apiFB.get("/competitions/PL/matches?dateFrom=2025-04-05&dateTo=2025-04-05&status=SCHEDULED");
    console.log(res);

    const matches = res?.data?.data?.matches || [];
    return { matches };
};