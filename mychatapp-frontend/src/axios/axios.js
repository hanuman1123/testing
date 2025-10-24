import axios from "axios";

const API = axios.create({
  baseURL: "https://testing-04f4.onrender.com/api", // backend URL
  withCredentials: true,                // send HttpOnly cookies
});

export default API;
