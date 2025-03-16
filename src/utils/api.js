import axios from "@/utils/axios.customize";

export const getVideosAPI = () => {
    const url = `/api/videos`;
    return axios.get(url);
};

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

export const getAllTeamAPI = () => {
    const url = `/api/teams`;
    return axios.get(url);
};

export const getTeamDetailAPI = (teamId) => {
    const url = `/api/teams/${teamId}`;
    return axios.get(url);
};

export const getCompetitionStandingDetailAPI = (config) => {
    const url = `/api/competitions/standings`;
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