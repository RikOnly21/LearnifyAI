import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, GestureResponderEvent } from "react-native";
import Gif from "react-native-gif";
import Toast from "react-native-root-toast";

const QuizScreen = () => {
	const { user } = useUser();
	const [total, setTotal] = useState(0);
	const [point, setPoint] = useState(0);
	const [happy, setHappy] = useState(0);
	const [seconds, setSeconds] = useState(3);
	const [numberError, setNumberError] = useState(0);

	const [incorrectOption, setIncorrect] = useState<string[]>([]);
	const [correct, setCorrect] = useState<string | undefined>(undefined);

	const query = useQuery({
		queryKey: ["user", user?.id, "question", "tree"],
		queryFn: async () => {
			if (!user?.id) throw new Error("No user id");

			const body = { question: "Give me 10 questions about tree, all questions must be unique" };
			const res = await fetch("https://learnify-server-ruddy.vercel.app/api/user/questions/ask", {
				method: "POST",
				body: JSON.stringify(body),
				// @ts-ignore
				headers: {
					"Content-Type": "application/json",
					"clerk-user-id": user?.id,
				},
			});

			if (!res.ok) throw new Error("Internal server error");

			setIncorrect([]);
			setCorrect(undefined);

			const data = (await res.json()) as { data: { question: string; options: string[]; answer: string }[] };

			return data;
		},
	});

	const handleAnswer = (event: GestureResponderEvent, option: string) => {
		if (correct || !query.isSuccess) return;

		const currentQuestion = query.data.data[total];

		if (option === currentQuestion.answer) {
			setHappy((happy) => Math.max(happy + 1, 3));
			setCorrect(option);
		} else {
			setNumberError((numberError) => numberError + 1);
			setHappy((happy) => Math.min(happy - 1, 0));

			setIncorrect((prev) => [...prev, option]);
		}
	};

	const handleNextQuestion = async () => {
		setIncorrect([]);
		setCorrect(undefined);

		setTotal((total) => total + 1); // Tăng tổng số câu hỏi
	};

	if (query.isLoading) {
		return (
			<View>
				<Gif source={require("@/assets/gifs/loading1.gif")} style={styles.gif}></Gif>
			</View>
		);
	}

	if (query.isError) return <View>Error</View>;

	if (query.isSuccess) {
		return (
			<ScrollView style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Trắc nghiệm cùng LearnifyAI</Text>
				</View>

				<AnimationGif happy={happy} />
				<Text style={styles.question}>{query.data.data[total].question}</Text>

				{query.data.data[total].options.map((option, index) => (
					<TouchableOpacity
						key={index}
						style={[
							styles.option,
							incorrectOption.includes(option) ? { backgroundColor: "#FF4433" } : undefined,
							correct === option ? { backgroundColor: "#008000" } : undefined,
						]}
						disabled={incorrectOption.includes(option)}
						onPress={(event) => handleAnswer(event, option)}
					>
						<Text
							style={[
								styles.optionText,
								incorrectOption.includes(option) ? { color: "white" } : undefined,
								correct === option ? { color: "white" } : undefined,
							]}
						>
							{option}
						</Text>
					</TouchableOpacity>
				))}

				<Text style={styles.totalText}>
					Số câu hiện tại: {total + 1}/{query.data.data.length}
				</Text>

				{typeof correct === "string" && (
					<TouchableOpacity style={styles.button} onPress={() => handleNextQuestion()}>
						<Text style={styles.buttonText}>Tiếp tục</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		);
	}
};

const AnimationGif = ({ happy }: { happy: number }) => {
	if (happy === 1) return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.gif}></Gif>;
	if (happy === 2) return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.gif}></Gif>;

	return <Gif source={require("@/assets/gifs/Alex-happy.gif")} style={styles.gif}></Gif>;
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "column",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#ffffff", // white background for the header
		elevation: 2,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000", // black color for the title
	},
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f8f8f8",
	},
	gif: {
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
});

export default QuizScreen;
