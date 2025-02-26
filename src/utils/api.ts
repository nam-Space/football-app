import axios from "@/utils/axios.customize";

export const getVideos = () => {
    const url = `/api/videos`;
    return axios.get(url);
};
