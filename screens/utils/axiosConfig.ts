import axios from "axios";
import envs from "../../config/env"

export default axios.create({baseURL: envs.API_URL})