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

