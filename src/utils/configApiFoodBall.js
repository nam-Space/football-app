import axios from "axios";

const backend = "https://api.football-data.org/v4";
const instance = axios.create({
    baseURL: backend,
    timeout: 60 * 1000, //60s
});

// Add a request interceptor
instance.interceptors.request.use(
    async function (config) {
        config.headers["X-Auth-Token"] = "c142faaca6f848a094bdbd906395a82d";
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        if (response.data) return response.data;
        return response;
    },
    function (error) {
        if (error?.response?.data) return error?.response?.data;
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    }
);

export default instance;
