import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";

import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import Voice, { SpeechErrorEvent, SpeechResultsEvent } from "@react-native-voice/voice";
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

import { api } from "@/lib/api";

interface Message {
	role: "assistant" | "user" | "system";
	content: string;
}

const voices: Record<string, { name: string; static: string; animate: string; voice: string }> = {
	male: {
		name: "Deni",
		static: "https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.png",
		animate: "https://ik.imagekit.io/RikOnly21/learnifyAI/Deni.gif",
		voice: "en-us-x-iol-local",
	},
	female: {
		name: "Sofia",
		static: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.png",
		animate: "https://ik.imagekit.io/RikOnly21/learnifyAI/Sofia.gif",
		voice: "en-us-x-iob-local",
	},
};

export default function App() {
	const { user } = useUser();

	const [messages, setMessages] = useState<Message[]>([]);

	const [recording, setRecording] = useState(false);
	const [speaking, setSpeaking] = useState(false);

	const [voiceState, setVoice] = useState(voices.female);

	const mutation = useMutation({
		onError: (error) => Toast.show(error.message, { duration: 5000 }),
		mutationFn: async (mes: Message[]) => {
			const body: Message[] = [
				{
					role: "system",
					content: `You are a AI, whose role is to help me practice speaking English. Your name is ${voiceState.name}.`,
				},
				...mes,
			];

			const res = await api.post("/api/user/voice", JSON.stringify(body), {
				headers: { "Content-Type": "application/json", "clerk-user-id": user!.id },
			});

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
			const data = [...prev, { role: "user", content }] satisfies Message[];
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
			voice: voiceState.voice,
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

	const toggleGender = () => {
		const newVoice = voiceState.name === voices.male.name ? voices.female : voices.male;
		const updatedMessage = messages.map((message) => {
			if (message.role === "user") return message;

			const updatedContent = message.content.replaceAll(voiceState.name, newVoice.name);
			return { role: message.role, content: updatedContent };
		});

		setVoice(newVoice);
		setMessages(updatedMessage);
	};

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
		if (speaking) stopSpeaking();

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

	const clearHistory = () => {
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
				<Text style={styles.headerTitle}>Nói chuyện cùng {voiceState.name}</Text>
			</View>

			<View>
				{speaking ? (
					<Gif
						source={{ uri: voiceState.animate }}
						style={{ width: 200, height: 200, alignSelf: "center" }}
					/>
				) : (
					<Image
						source={{ uri: voiceState.static }}
						style={{ width: 200, height: 200, alignSelf: "center" }}
					/>
				)}
			</View>

			<ScrollView style={styles.messagesContainer}>
				{messages.map((message, index) => (
					<Message
						key={index}
						message={message}
						speaking={speaking}
						stopSpeaking={stopSpeaking}
						speak={speak}
					/>
				))}
			</ScrollView>

			<View className="flex-row justify-evenly border-t border-gray-300 py-2">
				<TouchableOpacity style={styles.iconButton} onPress={toggleGender}>
					<Ionicons name="swap-horizontal-sharp" size={24} color="#00796b" />
					<Text style={styles.iconText}>Đổi giới tính</Text>
				</TouchableOpacity>

				{recording ? (
					<TouchableOpacity style={styles.iconButton} onPress={stopRecording}>
						<Ionicons name="mic" size={24} color="#0288d1" />
						<Text style={styles.iconText}>Đang lắng nghe...</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.iconButton} onPress={startRecording}>
						<Ionicons name="mic-off" size={24} color="#0288d1" />
						<Text style={styles.iconText}>Nói chuyện</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={clearHistory}
					style={[styles.iconButton, { opacity: messages.length === 0 ? 0.5 : 1 }]}
					disabled={messages.length === 0}
				>
					<Ionicons name="trash-bin" size={24} color="#d32f2f" />
					<Text style={styles.iconText}>Xóa lịch sử</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const Message = ({
	message,
	speaking,
	stopSpeaking,
	speak,
}: {
	message: Message;
	speaking: boolean;
	stopSpeaking: () => void;
	speak: (text: string, language: string) => void;
}) => {
	return (
		<View
			style={[
				styles.messageBubble,
				message.role === "assistant" ? styles.messageBubbleAI : styles.messageBubbleUser,
			]}
		>
			{message.role === "assistant" && (
				<TouchableOpacity
					onPress={() => {
						if (speaking) stopSpeaking();
						speak(message.content, "en-us");
					}}
				>
					<Ionicons name="volume-high" size={20} color="black" />
				</TouchableOpacity>
			)}

			<Text
				className={`${message.role === "assistant" ? "text-black" : "text-white"} max-w-[90%]`}
			>
				{message.content}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 8,
		backgroundColor: "#f8f8f8",
	},
	header: {
		flexDirection: "column",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#ffffff",
		elevation: 2,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
	},
	avatar: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	headerSubtitle: {
		fontSize: 12,
		color: "#888888",
	},
	messagesContainer: {
		flex: 1,
		padding: 10,
	},
	messageBubble: {
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 8,
		marginBottom: 10,
		maxWidth: "80%",
		minHeight: 40,
		gap: 8,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { height: 2, width: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 3,
	},
	messageBubbleAI: {
		alignSelf: "flex-start",
		marginLeft: 10,
		backgroundColor: "#d1d5db",
	},
	messageBubbleUser: {
		alignSelf: "flex-end",
		marginRight: 10,
		backgroundColor: "#3b82f6",
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
		alignItems: "center",
		justifyContent: "center",
	},
	iconText: {
		fontSize: 12,
	},
});
