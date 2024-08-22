import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

import React, { useState } from "react";
import {
	ActivityIndicator,
	GestureResponderEvent,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Gif from "react-native-gif";

import { api } from "@/lib/api";

const numOfQuest = (diff: string) => {
	if (diff === "easy") return 5;
	if (diff === "medium") return 10;
	if (diff === "hard") return 20;

	return 5;
};

const QuizScreen = () => {
	const { subject, difficulty } = useLocalSearchParams();
	const router = useRouter();

	const { user } = useUser();
	const [current, setCurrent] = useState(0);
	const [points, setPoints] = useState(0);
	const [happy, setHappy] = useState(3);

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
				numOfQuestion: numOfQuest(difficulty as string),
			};

			const res = await api.post("/api/user/questions/start", JSON.stringify(body), {
				headers: { "Content-Type": "application/json", "clerk-user-id": user.id },
			});

			if (res.status >= 400) throw new Error("Internal server error! Status: " + res.status);

			setIncorrect([]);
			setCorrect(undefined);

			const { data, questionId } = res.data as {
				data: { question: string; options: string[]; answer: string; explain: string }[];
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

		const res = await api.post<{ duration: number }>(
			"/api/user/questions/end",
			JSON.stringify(body),
			{
				headers: { "Content-Type": "application/json", "clerk-user-id": user?.id },
			},
		);

		setDuration(res.data.duration);
	};

	if (query.isLoading || query.isFetching) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#4CAF50" />
				<Text style={styles.loadingText}>Đang tải...</Text>
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

					<Text></Text>
				</View>

				{happy === 4 ? (
					<View style={{ justifyContent: "center", alignItems: "center" }}>
						<AnimationGif happy={happy} />
					</View>
				) : (
					<View
						style={{
							width: "100%",
							paddingLeft: `${(current * 100) / query.data.data.length}%`,
						}}
					>
						<AnimationGif happy={happy} />
					</View>
				)}

				{current < query.data!.data.length && (
					<View style={styles.questionContainer}>
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

						{typeof correct === "string" && (
							<Text>{query.data.data[current].explain}</Text>
						)}

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
					</View>
				)}

				{current === query.data!.data.length && (
					<View style={styles.questionContainer}>
						<View style={styles.infoContainer}>
							<Ionicons name="medal" size={48} color="gold" />
							<Text style={styles.endText}>Số điểm của bạn là {points}</Text>
						</View>

						<View style={styles.infoContainer}>
							<Ionicons name="timer" size={48} color="silver" />
							<Text style={styles.endText}>Thời gian làm {duration}s</Text>
						</View>

						<Link
							href={`/quiz/${subject}/leaderboard/${difficulty}`}
							className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
						>
							Đi tới bảng xếp hạng
						</Link>
					</View>
				)}
			</ScrollView>
		);
	}
};

const AnimationGif = ({ happy }: { happy: number }) => {
	if (happy === 1)
		return <Gif source={require("@/assets/gifs/Alex-sad.gif")} style={styles.walkingGif} />;

	if (happy === 2)
		return <Gif source={require("@/assets/gifs/Alex-normal.gif")} style={styles.walkingGif} />;

	if (happy === 3)
		return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.walkingGif} />;

	if (happy === 4)
		return <Gif source={require("@/assets/gifs/Alex-win.gif")} style={styles.walkingGif} />;

	return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.walkingGif} />;
};

const styles = StyleSheet.create({
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#f8f8f8",
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
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
	},
	container: {
		overflow: "visible",
		flex: 1,
		paddingBottom: 50,
		backgroundColor: "#f8f8f8",
	},
	gif: {
		width: "50%",
		height: "25%",
	},
	walkingGif: {
		width: 100,
		height: 175,
	},
	questionContainer: {
		paddingHorizontal: 20,
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
		textAlign: "center",
		marginHorizontal: 20,
		marginTop: 20,
	},
	endicon: {
		marginBottom: 10,
	},
});

export default QuizScreen;
