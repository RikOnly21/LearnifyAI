import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import React, { useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export default function Listen() {
	const { user } = useUser();

	const [inputText, setInputText] = useState("");
	const [isRevealed, setIsRevealed] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const query = useQuery({
		queryKey: ["audio", user?.id],
		refetchOnMount: true,
		staleTime: 0,
		queryFn: async () => {
			setIsRevealed(false);
			setIsCorrect(null);
			setInputText("");

			const res = await api.get<{ text: string }>("/api/user/listen", {
				headers: { "clerk-user-id": user!.id },
			});

			return res.data;
		},
	});

	const playAudio = async () => {
		if (!query.isSuccess) return;

		const options = {
			voice: "en-us-x-iob-local",
			quality: "Enhanced",
			language: "en-us",
			rate: 0.85,
		};

		Speech.speak(query.data.text, options);
	};

	const checkAnswer = () => {
		if (!query.isSuccess) return;

		if (inputText.trim().toLowerCase() === query.data.text.toLowerCase()) {
			setIsCorrect(true);
		} else {
			setIsCorrect(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Tập Nghe cùng AI</Text>
			</View>

			{(query.isLoading || query.isFetching) && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#4CAF50" />
					<Text style={styles.loadingText}>Đang tải...</Text>
				</View>
			)}

			{query.isSuccess && !query.isFetching && (
				<View style={styles.content}>
					<>
						<View className="w-full gap-4">
							<View style={styles.textContainer}>
								<Text
									style={[
										isRevealed || isCorrect
											? styles.revealText
											: styles.hiddenText,
									]}
								>
									{isRevealed || isCorrect
										? query.data?.text
										: query.data?.text.replace(/[a-z]/gi, "_")}
								</Text>
							</View>

							<TouchableOpacity onPress={playAudio} style={styles.playbutton}>
								<Ionicons name="volume-high-outline" size={30} color="#4CAF50" />
								<Text style={styles.playButtonText}>Listen</Text>
							</TouchableOpacity>
						</View>

						<TextInput
							placeholder="Nhập câu bạn nghe..."
							value={inputText}
							onChangeText={setInputText}
							multiline
							numberOfLines={2}
							style={[
								styles.input,
								typeof isCorrect === "boolean"
									? isCorrect
										? styles.correctInput
										: styles.incorrectInput
									: {},
							]}
						/>

						<TouchableOpacity
							onPress={checkAnswer}
							disabled={
								!query.isSuccess ||
								inputText.length === 0 ||
								isRevealed ||
								!!isCorrect
							}
							style={[
								styles.checkButton,
								!query.isSuccess ||
								inputText.length === 0 ||
								isRevealed ||
								!!isCorrect
									? styles.disabled
									: {},
							]}
						>
							<Ionicons name="checkmark-circle-outline" size={24} color="white" />
							<Text className="text-white">Kiểm tra</Text>
						</TouchableOpacity>

						<View className="mt-3 flex-row gap-4">
							<TouchableOpacity
								onPress={() => setIsRevealed(true)}
								disabled={!query.isSuccess || isCorrect || isRevealed}
								style={[
									styles.revealButton,
									!query.isSuccess || isCorrect || isRevealed
										? styles.disabled
										: {},
								]}
							>
								<Ionicons name="eye-outline" size={24} color="white" />
								<Text className="text-white">Xem đáp án</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => query.refetch()}
								style={styles.newButton}
							>
								<Ionicons name="reload-circle-outline" size={24} color="white" />
								<Text style={styles.newButtonText}>Câu mới</Text>
							</TouchableOpacity>
						</View>
					</>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		justifyContent: "space-between",
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
	content: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
	},
	loadingText: {
		fontSize: 18,
		color: "#666",
	},
	playbutton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E3FCEC",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		gap: 4,
	},

	playButtonText: {
		color: "#4CAF50",
	},
	hiddenText: {
		fontSize: 26,
		letterSpacing: 5,
		textAlign: "center",
	},
	revealText: {
		fontSize: 26,
		letterSpacing: 0,
		textAlign: "center",
	},
	textContainer: {
		minHeight: 60,
		justifyContent: "center",
	},
	input: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		marginTop: 20,
		backgroundColor: "#fff",
	},
	correctInput: {
		borderColor: "#4CAF50",
	},
	incorrectInput: {
		borderColor: "#FF5252",
	},
	checkButton: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#4CAF50",
		paddingVertical: 10,
		borderRadius: 8,
		marginTop: 20,
		gap: 4,
	},
	disabled: {
		opacity: 0.6,
	},
	revealButton: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FF9800",
		paddingVertical: 10,
		borderRadius: 8,
		gap: 4,
		flex: 1,
	},
	newButton: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#4CAF50",
		paddingVertical: 10,
		borderRadius: 8,
		flex: 1,
	},
	newButtonText: {
		color: "#fff",
		marginLeft: 8,
	},
	feedbackContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		marginTop: 20,
		gap: 4,
	},
	correctFeedback: {
		backgroundColor: "#4CAF50",
	},
	incorrectFeedback: {
		backgroundColor: "#FF5252",
	},
	feedbackmessage: {
		color: "#fff",
		marginLeft: 8,
	},
});
