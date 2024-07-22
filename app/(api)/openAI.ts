import axios from "axios";
import { apiKey } from "../(components)/index";

const client = axios.create({
	headers: {
		Authorization: "Bearer " + apiKey,
		"content-Type": "application/json",
	},
});

const chatGPTEndpoint = "https://guujiyae.me/proxy/openai/v1/chat/completions";
export const apiCall = async (text: string) => {
	try {
		const res = await client.post(chatGPTEndpoint, {
			model: "gpt-4o",
			messages: [{ role: "system", content: text }],
		});

		const responseMes = res.data.choices[0].message.content;

		console.log("Dữ liệu trả về từ AI: ", responseMes);

		return responseMes;
	} catch (error) {
		console.log("error", error);
		return { success: false, msg: (error as Error).message };
	}
};
