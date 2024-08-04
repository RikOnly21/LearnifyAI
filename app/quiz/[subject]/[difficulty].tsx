import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import React, { useState } from "react";
import {
	GestureResponderEvent,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Gif from "react-native-gif";

import { api } from "@/lib/api";

const QuizScreen = () => {
	const { subject, difficulty } = useLocalSearchParams();
	const router = useRouter();

	const { user } = useUser();
	const [current, setCurrent] = useState(0);
	const [points, setPoints] = useState(0);
	const [happy, setHappy] = useState(3);
	const [position, setPosition] = useState<number>(0.1);
	const [incorrectOption, setIncorrect] = useState<string[]>([]);
	const [correct, setCorrect] = useState<string | undefined>(undefined);

	const [duration, setDuration] = useState<number | undefined>();

	const query = useQuery({
		queryKey: [user?.id, "quiz", subject, difficulty],
		queryFn: async () => {
			if (!user?.id) throw new Error("No user id");

			const body = {
				subject: subject === "custom" ? "random" : subject,
				difficulty,
				numOfQuestion: 2,
			};

			const res = await api.post("/api/user/questions/start", JSON.stringify(body), {
				headers: { "Content-Type": "application/json", "clerk-user-id": user.id },
			});

			if (res.status >= 400) throw new Error("Internal server error! Status: " + res.status);

			setIncorrect([]);
			setCorrect(undefined);

			const { data, questionId } = res.data as {
				data: { question: string; options: string[]; answer: string }[];
				questionId: string;
			};

			return { data, questionId, startDate: Date.now() };
		},
	});

	const handleAnswer = (_: GestureResponderEvent, option: string) => {
		if (correct || !query.isSuccess) return;

		const currentQuestion = query.data.data[current];

		if (option === currentQuestion.answer) {
			setHappy((happy) => Math.min(happy + 1, 3));
			setCorrect(option);

			setPoints((prev) => prev + 1);
		} else {
			setHappy((happy) => Math.max(happy - 1, 1));
			setIncorrect((prev) => [...prev, option]);
			setPoints((prev) => Math.max(0, prev - 0.5));
		}
	};

	const handleNextQuestion = async () => {
		setPosition(Math.min(current + 1 / query.data!.data.length, 1) * 100 - 20);
		setIncorrect([]);
		setCorrect(undefined);

		if (current + 1 === query.data!.data.length) await onFinishHandler();
		setCurrent((prev) => prev + 1);
	};

	const onFinishHandler = async () => {
		console.log("Ending test");
		setHappy(4);
		const body = {
			questionId: query.data!.questionId,
			points,
			startDate: query.data!.startDate,
			endDate: Date.now(),
		};

		console.log({
			...body,
			startDate: new Date(body.startDate),
			endDate: new Date(body.endDate),
		});

		const res = await api.post("/api/user/questions/end", JSON.stringify(body), {
			headers: {
				"Content-Type": "application/json",
				"clerk-user-id": user?.id,
			},
		});

		const data = res.data as { duration: number };

		setDuration(data.duration);
	};

	if (query.isLoading) {
		return (
			<View className="flex h-full items-center justify-center bg-white">
				<Gif
					source={require("@/assets/gifs/loading1-unscreen.gif")}
					style={styles.gif}
				></Gif>
			</View>
		);
	}

	if (query.isError) {
		return (
			<View className="flex h-full items-center justify-center bg-white">
				<Text className="text-xl">{query.error.message}</Text>
			</View>
		);
	}

	if (query.isSuccess) {
		return (
			<ScrollView style={styles.container}>
				<View style={styles.header}>
					{router.canGoBack() && (
						<TouchableOpacity onPress={() => router.back()}>
							<Ionicons name="arrow-back" size={24} color="black" />
						</TouchableOpacity>
					)}

					<Text style={styles.headerTitle}>Trắc nghiệm cùng LearnifyAI</Text>

					<Text> </Text>
				</View>
				{happy === 4 ? (
					<View style={{ paddingLeft: "30%" }}>
						<AnimationGif happy={happy} />
					</View>
				) : (
					<View style={{ paddingLeft: `${position}%` }}>
						<AnimationGif happy={happy} />
					</View>
				)}

				{current < query.data!.data.length && (
					<>
						<Text style={styles.question}>
							{(query.data.data[current] ?? { question: "???" }).question}
						</Text>

						{query.data.data[current].options.map((option, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.option,
									incorrectOption.includes(option)
										? { backgroundColor: "#FF4433" }
										: undefined,
									correct === option ? { backgroundColor: "#008000" } : undefined,
								]}
								disabled={incorrectOption.includes(option)}
								onPress={(event) => handleAnswer(event, option)}
							>
								<Text
									style={[
										styles.optionText,
										incorrectOption.includes(option)
											? { color: "white" }
											: undefined,
										correct === option ? { color: "white" } : undefined,
									]}
								>
									{option}
								</Text>
							</TouchableOpacity>
						))}

						<Text style={styles.totalText}>
							Số câu hiện tại: {current + 1}/{query.data.data.length}
						</Text>

						{typeof correct === "string" && (
							<TouchableOpacity
								style={styles.button}
								onPress={() => handleNextQuestion()}
							>
								<Text style={styles.buttonText}>Tiếp tục</Text>
							</TouchableOpacity>
						)}
					</>
				)}

				{current === query.data!.data.length && (
					<>
						<View style={styles.infoContainer}>
							<Ionicons name="medal" size={48} color="gold" />
							<Text style={styles.endText}>Số điểm của bạn là {points}</Text>
						</View>
						<View style={styles.infoContainer}>
							<Ionicons name="timer" size={48} color="silver" />
							<Text style={styles.endText}>Thời gian làm {duration}s</Text>
						</View>
					</>
				)}
			</ScrollView>
		);
	}
};

const AnimationGif = ({ happy }: { happy: number }) => {
	if (happy === 1)
		return <Gif source={require("@/assets/gifs/Alex-sad.gif")} style={styles.walkingGif}></Gif>;
	if (happy === 2)
		return (
			<Gif source={require("@/assets/gifs/Alex-normal.gif")} style={styles.walkingGif}></Gif>
		);
	if (happy === 3)
		return (
			<Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.walkingGif}></Gif>
		);
	if (happy === 4)
		return <Gif source={require("@/assets/gifs/Alex-win.gif")} style={styles.walkingGif}></Gif>;
	return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.walkingGif}></Gif>;
};

const styles = StyleSheet.create({
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		backgroundColor: "#f8f8f8",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
	},
	container: {
		overflow: "visible",
		flex: 1,
		padding: 20,
		paddingBottom: 50,
		backgroundColor: "#f8f8f8",
	},
	gif: {
		width: "100%",
		height: "50%",
	},
	walkingGif: {
		width: 100,
		height: 175,
	},
	question: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	option: {
		backgroundColor: "#f0f0f0",
		padding: 15,
		borderRadius: 5,
		marginBottom: 10,
	},
	optionText: {
		fontSize: 16,
	},
	totalText: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	button: {
		backgroundColor: "#007bff",
		padding: 15,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 5,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "bold",
	},
	infoContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	endText: {
		fontSize: 20,
		color: "#000",
		textAlign: "center", // Center text horizontally
		marginHorizontal: 20, // Add horizontal margin
		marginTop: 20, // Add top margin for spacing
	},
	endicon: {
		marginBottom: 10,
	},
});

export default QuizScreen;
