import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";

import React, { useEffect, useState } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Gif from "react-native-gif";
import { apiCall } from "../(api)/openAI";
import { PermissionsAndroid } from "react-native";
import * as Speech from "expo-speech";

interface Mes {
	role: string;
	message: string;
	timestamp: number;
}
export default function App() {
	const [messages, setMessages] = useState<Mes[]>([]);
	const [result, setResult] = useState("");

	const [recording, setRecording] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [male, setMale] = useState(false);

	const requestMicrophonePermission = async () => {
		try {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
				title: "Microphone Permission",
				message: "App needs access to your microphone ",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK",
			});
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log("You can use the microphone");
			} else {
				console.log("Microphone permission denied");
			}
		} catch (err) {
			console.warn(err);
		}
	};

	const [imageurl, setImageurl] = useState(
		"https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.png?updatedAt=1722067178988",
	);
	const [gifurl, setGifurl] = useState(
		"https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.gif?updatedAt=1722069093057",
	);
	const [voiceNow, setVoiceNow] = useState("en-us-x-iob-local");
	//speak
	const speak = (text: string, language: string) => {
		setSpeaking(true);
		const cleanedText = removePunctuation(text);
		const options = {
			voice: voiceNow, // Sử dụng giọng đọc đã chọn
			quality: "Enhanced",
			language,
			rate: 0.85,

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
		};
		Speech.speak(cleanedText, options);
	};
	const stopSpeaking = () => {
		Speech.stop();
		setSpeaking(false);
	};

	const setGender = () => {
		if (male) {
			setImageurl("https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.png?updatedAt=1722067178988");
			setGifurl("https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.gif?updatedAt=1722069093057");
			setVoiceNow("en-us-x-iob-local");
			console.log("Vừa chuyển sang con gái");
			setMale(false);
		} else {
			setImageurl("https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.png?updatedAt=1722067178971");
			setGifurl("https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.gif?updatedAt=1722069092988");
			setVoiceNow("en-us-x-iol-local");
			console.log("Vừa chuyển sang con trai");
			setMale(true);
		}
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
		const data = await apiCall(text);
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
		await requestMicrophonePermission();
		console.log("zô recording");
		try {
			await Voice.start("en-US");
			console.log("Bắt đầu recording");
		} catch (error) {
			console.log("error when startRecording :", error);
		}
	};

	const stopRecording = async () => {
		console.log(Voice.isAvailable());
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
		return text.replace(/[/#!$%\^&\*;:{}=\-_`~()]/g, "  ");
	};

	const sendInitialConfiguration = async () => {
		const configText =
			"Suppose you are a person for me to practice speaking English. Can you answer me personal questions like your name, age, etc. that you make up?";
		const data = await apiCall(configText);
		console.log("Cấu hình ban đầu được AI trả về kết quả: ", data);
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
			speak(result, "en-us");
		}
	}, [result]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>LearnifyAI</Text>
				{recording && <Text style={styles.headerSubtitle}> Đang lắng nghe...</Text>}
			</View>

			{speaking ? (
				<Gif source={{ uri: gifurl }} style={{ width: 200, height: 200, alignSelf: "center" }} />
			) : (
				<Image source={{ uri: imageurl }} style={{ width: 200, height: 200, alignSelf: "center" }} />
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
							{message.role === "AI" && (
								<TouchableOpacity
									style={styles.iconButton}
									onPress={() => (speaking ? stopSpeaking() : speak(message.message, "en-us"))}
								>
									<Image
										source={require("@/assets/images/speaker.png")}
										style={{ width: 20, height: 20 }}
									/>
								</TouchableOpacity>
							)}
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
				<TouchableOpacity style={styles.iconButton} onPress={setGender}>
					<Image source={require("@/assets/images/convert-icon.png")} style={styles.iconImage} />
				</TouchableOpacity>
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
		flexDirection: "column",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#ffffff", // white background for the header
		elevation: 2,
	},
	headerTitleContainer: {
		flex: 1,
		alignItems: "center", // Center title text horizontally
		justifyContent: "center",
	},
	avatar: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000", // black color for the title
	},
	headerSubtitle: {
		fontSize: 12,
		color: "#888888", // grey color for the subtitle
	},
	messagesContainer: {
		flex: 1,
		padding: 10,
	},
	messageBubbleAI: {
		alignSelf: "flex-start",
		backgroundColor: "#e0f7fa", // light blue for AI messages
		padding: 10,
		borderRadius: 20,
		marginBottom: 10,
		maxWidth: "80%",
		marginLeft: 10,
	},
	messageBubbleUser: {
		alignSelf: "flex-end",
		backgroundColor: "#cfd8dc", // light grey for user messages
		padding: 10,
		borderRadius: 20,
		marginBottom: 10,
		maxWidth: "80%",
		marginRight: 10,
	},
	messageText: {
		fontSize: 16,
		color: "#000000", // black color for message text
	},
	inputContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 10,
		backgroundColor: "#072D44",
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
