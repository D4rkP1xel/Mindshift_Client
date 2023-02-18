import axios from "axios";

export default axios.create({baseURL: process.env.RAILWAY_STATIC_URL !== undefined ? process.env.RAILWAY_STATIC_URL : "http://10.0.2.2:3001"})