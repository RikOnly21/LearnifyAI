import axios from "axios";

export const api = axios.create({
	baseURL: "https://learnify-server-ruddy.vercel.app",
});
