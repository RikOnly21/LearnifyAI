import Voice, { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";
import { useMutation } from "@tanstack/react-query";

import { useUser } from "@clerk/clerk-expo";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import LinearGradient from "react-native-linear-gradient";
import React, { useEffect, useState } from "react";
import {
	Image,
	PermissionsAndroid,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Gif from "react-native-gif";
import Toast from "react-native-root-toast";

interface Message {
	role: "assistant" | "user";
	content: string;
}

export default function App() {
	const { user } = useUser();

	const [messages, setMessages] = useState<Message[]>([]);

	const [recording, setRecording] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [male, setMale] = useState(false);

	const [voiceNow, setVoiceNow] = useState("en-us-x-iob-local");

	const [imageurl, setImageurl] = useState({
		static: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.png",
		animate: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.gif",
	});

	const mutation = useMutation({
		onError: (error) => Toast.show(error.message, { duration: 5000 }),
		mutationFn: async (mes: Message[]) => {
			const body = [
				{
					role: "system",
					content: `Suppose you are a person for me to practice speaking English. Make up your name that for a ${
						male ? "male" : "female"
					}!`,
				},
				...mes,
			] as Message[];

			const res = await api.post("/api/user/voice", JSON.stringify(body), {
				headers: {
					"Content-Type": "application/json",
					"clerk-user-id": user!.id,
				},
			});

			if (res.status >= 400) {
				throw new Error("Status: " + res.status + " - " + res.statusText);
			}

			const { message } = res.data as { message: string };
			setMessages([
				...messages,
				{ role: "user", content: mes.at(-1)!.content },
				{ role: "assistant", content: message },
			]);

			speak(message, "en-us");
		},
	});

	const speechResultsHandler = async (e: SpeechResultsEvent) => {
		console.log("On Result:", e);

		const content = e.value![0];
		if (!content) return;

		setMessages((prev) => {
			const data = [...prev, { content, role: "user" } as const];
			mutation.mutate(data);

			return data;
		});
	};

	const requestMicrophonePermission = async () => {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
				{
					title: "Microphone Permission",
					message: "App needs access to your microphone ",
					buttonNeutral: "Ask Me Later",
					buttonNegative: "Cancel",
					buttonPositive: "OK",
				},
			);

			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log("You can use the microphone");
				return true;
			} else {
				console.log("Microphone permission denied");
				return false;
			}
		} catch (err) {
			console.warn(err);
		}

		return false;
	};

	//speak
	const speak = (text: string, language: string) => {
		setSpeaking(true);
		const cleanedText = removePunctuation(text);

		const options = {
			voice: voiceNow,
			quality: "Enhanced",
			language,
			rate: 0.85,

			onStart: () => setSpeaking(true),
			onDone: () => setSpeaking(false),
			onStopped: () => setSpeaking(false),
			onError: () => setSpeaking(false),
		};

		Speech.speak(cleanedText, options);
	};

	const stopSpeaking = () => {
		Speech.stop();

		setSpeaking(false);
		setRecording(false);
	};

	const setGender = () => {
		if (male) {
			setImageurl({
				static: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.png",
				animate: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.gif",
			});

			setVoiceNow("en-us-x-iob-local");
			setMale(false);
		} else {
			setImageurl({
				static: "https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.png",
				animate: "https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.gif",
			});

			setVoiceNow("en-us-x-iol-local");
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

	const speechErrorHandler = (e: SpeechErrorEvent) => {
		console.log("speech error handler: ", e);
		setSpeaking(false);
		setRecording(false);
	};

	const startRecording = async () => {
		setRecording(true);

		const success = await requestMicrophonePermission();
		if (!success) return;
		try {
			await Voice.start("en-US");
		} catch (error) {
			console.log("error when startRecording :", error);
		}
	};

	const stopRecording = async () => {
		console.log("isAvailable", await Voice.isAvailable());

		try {
			await Voice.stop();
			setRecording(false);
		} catch (error) {
			console.log("error when stopRecording:", error);
		}
	};

	const clear = () => {
		setMessages([]);
	};

	const removePunctuation = (text: string): string => {
		return text.replace(/[/#!$%\^&\*;:{}=\-_`~()]/g, "  ");
	};

	const onSpeechPartialResults = (e: SpeechResultsEvent) => {
		console.log("onSpeechPartialResults: ", e);
	};

	useEffect(() => {
		Voice.onSpeechStart = speechStartHandler;
		Voice.onSpeechEnd = speechEndHandler;
		Voice.onSpeechResults = speechResultsHandler;
		Voice.onSpeechError = speechErrorHandler;
		Voice.onSpeechPartialResults = onSpeechPartialResults;

		return () => void Voice.destroy().then(Voice.removeAllListeners);
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>LearnifyAI</Text>
				{recording && <Text style={styles.headerSubtitle}> Đang lắng nghe...</Text>}
			</View>

			{speaking ? (
				<Gif
					source={{ uri: imageurl.animate }}
					style={{ width: 200, height: 200, alignSelf: "center" }}
				/>
			) : (
				<Image
					source={{ uri: imageurl.static }}
					style={{ width: 200, height: 200, alignSelf: "center" }}
				/>
			)}

			<ScrollView style={styles.messagesContainer}>
				{messages.map((message, index) => (
					<View
						key={index}
						style={
							message.role === "assistant"
								? styles.messageBubbleAI
								: styles.messageBubbleUser
						}
					>
						<Text>{message.content}</Text>
						{message.role === "assistant" && (
							<TouchableOpacity
								style={styles.iconButton}
								onPress={() =>
									speaking ? stopSpeaking() : speak(message.content, "en-us")
								}
							>
								<Image
									source={require("@/assets/images/speaker.png")}
									style={{ width: 20, height: 20 }}
								/>
							</TouchableOpacity>
						)}
					</View>
				))}
			</ScrollView>
			<LinearGradient style={styles.inputContainer} colors={["#e0f7fa", "#b2ebf2"]}>
				<TouchableOpacity style={styles.iconButton} onPress={setGender}>
					<Ionicons name="swap-horizontal-sharp" size={24} color="#00796b"></Ionicons>
				</TouchableOpacity>

				{recording ? (
					<TouchableOpacity style={styles.iconButton} onPress={stopRecording}>
						<Ionicons name="mic" size={24} color="#0288d1"></Ionicons>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.iconButton} onPress={startRecording}>
						<Ionicons name="mic-off" size={24} color="#0288d1"></Ionicons>
					</TouchableOpacity>
				)}

				{messages.length > 0 && (
					<TouchableOpacity onPress={clear} style={styles.iconButton}>
						<Ionicons name="trash-bin" size={24} color="#d32f2f"></Ionicons>
					</TouchableOpacity>
				)}
			</LinearGradient>
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
		backgroundColor: "#ffffff",
		elevation: 2,
	},
	headerTitleContainer: {
		flex: 1,
		alignItems: "center",
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
		color: "#000000",
	},
	headerSubtitle: {
		fontSize: 12,
		color: "#888888",
	},
	messagesContainer: {
		flex: 1,
		padding: 10,
	},
	messageBubbleAI: {
		alignSelf: "flex-start",
		backgroundColor: "#B3E5FC",
		padding: 10,
		borderRadius: 20,
		marginBottom: 10,
		maxWidth: "80%",
		marginLeft: 10,
	},
	messageBubbleUser: {
		alignSelf: "flex-end",
		backgroundColor: "#E0F2F1",
		padding: 10,
		borderRadius: 20,
		marginBottom: 10,
		maxWidth: "80%",
		marginRight: 10,
	},
	messageText: {
		fontSize: 16,
		color: "#000000",
	},
	inputContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 10,
		backgroundColor: "#dbfaf2",
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
