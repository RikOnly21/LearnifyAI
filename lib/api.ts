import axios from "axios";

export const api = axios.create({
	// baseURL: "https://learnify-server-ruddy.vercel.app",
	baseURL: "http://192.168.1.8:3000",
});
