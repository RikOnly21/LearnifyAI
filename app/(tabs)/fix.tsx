import React, { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";

import Markdown from "react-native-markdown-display";

import { api } from "@/lib/api";

type Response = {
	orginal: string;
	fixed: string;
	explanation: string;
	isCorrect: boolean;
};

export default function Fix() {
	const { user } = useUser();
	const [sentence, setSentence] = useState("");

	const mutation = useMutation({
		mutationFn: async ({ sentence }: { sentence: string }) => {
			Keyboard.dismiss();

			const res = await api.post<Response>(
				"/api/user/fix",
				{ sentence },
				{ headers: { "clerk-user-id": user!.id } },
			);

			return res.data;
		},
	});

	return (
		<View className="flex flex-1 gap-4 bg-white">
			<View className="flex items-center justify-center py-4" style={styles.topBar}>
				<Text style={styles.title}>Sửa từ vựng cùng AI</Text>
			</View>

			<View className="flex flex-1 flex-col items-center gap-4 px-4">
				<TextInput
					className="w-full rounded-md border border-gray-300 p-4"
					placeholder="Nhập câu cần sửa"
					multiline
					style={styles.input}
					numberOfLines={5}
					onChangeText={setSentence}
				/>

				<TouchableOpacity
					className="w-full rounded-md bg-blue-500 p-2 disabled:opacity-50"
					onPress={() => mutation.mutate({ sentence })}
					disabled={mutation.isPending}
				>
					<Text className="text-center text-white">
						{mutation.isPending ? "Đang sửa..." : "Sửa"}
					</Text>
				</TouchableOpacity>

				{mutation.isSuccess && (
					<View className="flex w-full gap-4 rounded-md bg-white pb-2 pt-4 shadow-md">
						<Text style={styles.header} className="text-center">
							Giải thích từ AI
						</Text>

						{mutation.data.isCorrect && (
							<View className="w-full px-4">
								<View style={styles.resultContainer}>
									<Text style={styles.label} className="text-center">
										Câu của bạn đã đúng, không cần sửa
									</Text>
								</View>
							</View>
						)}

						{!mutation.data.isCorrect && (
							<View className="px-4">
								<View style={styles.resultContainer}>
									<Text style={styles.label}>Câu gốc:</Text>
									<Markdown style={{ strong: styles.originalText }}>
										{mutation.data.orginal}
									</Markdown>
								</View>

								<View style={styles.resultContainer}>
									<Text style={styles.label}>Câu mới:</Text>
									<Markdown style={{ strong: styles.fixedText }}>
										{mutation.data.fixed}
									</Markdown>
								</View>

								<View style={styles.resultContainer}>
									<Text style={styles.label}>Giải thích:</Text>
									<Markdown style={{ strong: styles.explanationText }}>
										{mutation.data.explanation}
									</Markdown>
								</View>
							</View>
						)}
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f5",
	},
	topBar: {
		backgroundColor: "#fff",
		elevation: 2,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	input: {
		textAlignVertical: "top",
	},
	resultContainer: {
		width: "100%",
		marginBottom: 12,
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#555",
	},
	originalText: {
		color: "#d9534f",
		fontStyle: "italic",
		fontWeight: "bold",
		textDecorationLine: "underline",
	},
	fixedText: {
		color: "#5cb85c",
		fontStyle: "italic",
		fontWeight: "bold",
		textDecorationLine: "underline",
	},
	explanationText: {
		fontWeight: "bold",
		textDecorationLine: "underline",
	},
});
