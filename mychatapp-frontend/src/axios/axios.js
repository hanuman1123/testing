import axios from "axios";

const API = axios.create({
  baseURL: "https://testing-8yiu.vercel.app/api", // backend URL
  withCredentials: true,                // send HttpOnly cookies
});

export default API;
