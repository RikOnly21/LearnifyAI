import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";

import React, { useEffect, useState } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Gif from "react-native-gif";
import { apiCall } from "../(api)/openAI";

import * as Speech from "expo-speech";

interface Mes {
	role: string;
	message: string;
	timestamp: number;
}
export default function App() {
	const [messages, setMessages] = useState<Mes[]>([]);

	const [recording, setRecording] = useState(false);

	const [result, setResult] = useState("");

	const [speaking, setSpeaking] = useState(false);

	//speak
	const speak = (text: string, language: string) => {
		setSpeaking(true);
		const cleanedText = removePunctuation(text);
		Speech.speak(cleanedText, {
			language,

			onStart: () => {
				setSpeaking(true); // Khi bắt đầu phát speech, set trạng thái là true
			},
			onDone: () => {
				setSpeaking(false); // Khi speech hoàn thành, set trạng thái là false
			},
			onStopped: () => {
				setSpeaking(false); // Khi speech bị dừng, set trạng thái là false
			},
			onError: () => {
				setSpeaking(false); // Khi có lỗi, cũng set trạng thái là false
			},
		});
	};

	//
	const speechStartHandler = () => {
		console.log("speech start handler");
	};

	const speechEndHandler = () => {
		setRecording(false);
		console.log("speech end handler");
	};

	const speechResultsHandler = async (e: SpeechResultsEvent) => {
		console.log("voice event: ", e);
		const text = e.value![0];
		if (!text) return;
		const resMesUser: Mes = {
			role: "User",
			message: text,
			timestamp: Date.now(),
		};
		setMessages((prevMessages) => [...prevMessages, resMesUser]);
		const data = await apiCall(
			"Khi phản hồi: các từ tiếng Việt không được nằm trong dấu ngoặc kép và tất cả các từ tiếng Anh phải nằm trong dấu ngoặc kép, các ví dụ bằng tiếng anh cũng phải bỏ vào giấu ngoặc kép, không sử dụng 2 dấu **, đây là 1 đoạn hội thoại. Đây là câu hỏi: " +
				text,
		);

		setResult(data);
		const resMesAI: Mes = {
			role: "AI",
			message: data, // Đảm bảo rằng content là một chuỗi
			timestamp: Date.now(),
		};
		setMessages((prevMessages) => [...prevMessages, resMesAI]);
	};

	const speechErrorHandler = (e: SpeechErrorEvent) => {
		console.log("speech error handler: ", e);
	};

	const startRecording = async () => {
		setRecording(true);

		try {
			await Voice.start("vi-VN");
		} catch (error) {
			console.log("error when startRecording :", error);
		}
	};

	const stopRecording = async () => {
		try {
			await Voice.stop();
			setRecording(false);

			//fetch response
		} catch (error) {
			console.log("error when stopRecording:", error);
		}
	};

	const clear = () => {
		setResult("");
		setMessages([]);
	};
	const removePunctuation = (text: string): string => {
		return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "  ");
	};

	const sendInitialConfiguration = async () => {
		const configText =
			"Giả sử bạn là một trợ lý để tôi học tiếng Anh. Bạn có thể dịch nghĩa, cho ví dụ câu, giải thích ngữ pháp,...Bạn có một nguyên tắc nhất định phải tuân theo là các từ tiếng Việt không được nằm trong dấu ngoặc kép và tất cả các từ tiếng Anh phải nằm trong dấu ngoặc kép, các ví dụ bằng tiếng anh cũng phải bỏ vào giấu ngoặc kép, không sử dụng 2 dấu **, đây là 1 đoạn hội thoại.";
		const data = await apiCall(configText);
		console.log("Cấu hình ban đầu được AI trả về kết quả: ", data);
	};

	const splitMessageByLanguage = (message: string): { text: string; language: string }[] => {
		const segments: { text: string; language: string }[] = [];
		const regex = /"([^"]+)"|([^"]+)/g;
		let match;

		while ((match = regex.exec(message)) !== null) {
			if (match[1]) {
				// Đoạn tiếng Anh trong dấu ngoặc kép
				segments.push({ text: match[1], language: "en-US" });
			}
			if (match[2]) {
				// Đoạn tiếng Việt ngoài dấu ngoặc kép
				const text = match[2].trim();
				if (text) {
					segments.push({ text, language: "vi-VN" });
				}
			}
		}

		return segments;
	};

	const speakMixedLanguageMessage = (message: string): void => {
		const segments = splitMessageByLanguage(message);
		for (let segment of segments) {
			speak(segment.text, segment.language);
		}
	};

	useEffect(() => {
		//voice handler events
		Voice.onSpeechStart = speechStartHandler;
		Voice.onSpeechEnd = speechEndHandler;
		Voice.onSpeechResults = speechResultsHandler;
		Voice.onSpeechError = speechErrorHandler;

		sendInitialConfiguration();
		return () => {
			//destroy the voice instance
			Voice.destroy().then(Voice.removeAllListeners);
		};
	}, []);
	useEffect(() => {
		if (result) {
			speakMixedLanguageMessage(result);
		}
	}, [result]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Ionicons name="arrow-back" size={24} color="black" />
				<View style={styles.headerTitleContainer}>
					<View>
						<Text style={styles.headerTitle}>LearnifyAI</Text>
						<Text style={styles.headerSubtitle}>Đang lắng nghe...</Text>
					</View>
				</View>
				<MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
			</View>
			{speaking ? (
				<>
					<Gif source={require("@/assets/gifs/Sofia.gif")} style={{ width: 200, height: 200 }} />
				</>
			) : (
				<>
					<Image source={require("@/assets/images/Sofia.png")} style={{ width: 115, height: 115 }} />
				</>
			)}

			<ScrollView style={styles.messagesContainer}>
				{messages
					.sort((a, b) => a.timestamp - b.timestamp)
					.map((message, index) => (
						<View
							key={index}
							style={message.role === "AI" ? styles.messageBubbleAI : styles.messageBubbleUser}
						>
							<Text>{message.message}</Text>
							<TouchableOpacity
								style={styles.iconButton}
								onPress={() => speakMixedLanguageMessage(message.message)}
							>
								<Image
									source={require("@/assets/images/speaker.png")}
									style={{ width: 20, height: 20 }}
								/>
							</TouchableOpacity>
						</View>
					))}

				{/* {messagesAI.length > 0 &&
					messagesAI.map((message, index) => (
						<Text key={index}>
							<Text key={index}>{message.message}</Text>
						</Text>
					))} */}
			</ScrollView>
			<View style={styles.inputContainer}>
				{recording ? (
					<TouchableOpacity style={styles.iconButton} onPress={stopRecording}>
						<Image source={require("@/assets/images/mic-on.png")} style={styles.iconImage} />
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.iconButton} onPress={startRecording}>
						<Image source={require("@/assets/images/mic-off.png")} style={styles.iconImage} />
					</TouchableOpacity>
				)}
				{messages.length > 0 && (
					<TouchableOpacity onPress={clear} style={styles.iconButton}>
						<Image source={require("@/assets/images/clear-icon.png")} style={styles.iconImage} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f8f8",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		backgroundColor: "#fff",
		elevation: 2,
	},
	headerTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
	},
	headerSubtitle: {
		fontSize: 12,
		color: "gray",
	},
	messagesContainer: {
		flex: 1,
		padding: 10,
	},
	messageBubbleAI: {
		alignSelf: "flex-start",
		backgroundColor: "#d1e7ff",
		padding: 10,
		borderRadius: 10,
		marginBottom: 10,
	},
	messageBubbleUser: {
		alignSelf: "flex-end",
		backgroundColor: "#d3d3d3",
		padding: 10,
		borderRadius: 10,
		marginBottom: 10,
	},
	messageText: {
		fontSize: 16,
	},
	inputContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 10,
		backgroundColor: "#333333",
		borderTopWidth: 1,
		borderColor: "#ddd",
	},
	iconButton: {
		padding: 10,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	iconImage: {
		width: 50,
		height: 50,
	},
});
