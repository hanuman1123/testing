import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api", // backend URL
  withCredentials: true,                // send HttpOnly cookies
});

export default API;
