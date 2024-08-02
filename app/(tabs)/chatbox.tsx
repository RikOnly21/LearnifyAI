import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useMutation, useQuery } from "@tanstack/react-query";

import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-root-toast";

type Message = {
	messages: { id: string; content: string; role: "USER" | "AI"; createdAt: Date }[];
};

export default function App() {
	const [inputText, setInputText] = useState("");
	const { user } = useUser();

	const query = useQuery({
		queryKey: ["user", "messages"],
		queryFn: async () => {
			if (!user) {
				Toast.show("You're not logged in!!", { duration: 5000 });
				throw new Error("You're not logged in!!");
			}

			const headers = new Headers();
			headers.set("clerk-user-id", user.id);

			const res = await fetch("https://learnify-server-ruddy.vercel.app/api/user/messages", { headers });
			if (!res.ok) throw new Error("Internal server error!");

			return (await res.json()) as Message;
		},
	});

	const sendMessage = useMutation({
		onSuccess: () => setInputText(""),
		mutationFn: async () => {
			if (!user) {
				Toast.show("You're not logged in!!", { duration: 5000 });
				throw new Error("You're not logged in!!");
			}

			const headers = new Headers();
			headers.set("clerk-user-id", user.id);
			headers.set("Content-Type", "application/json");

			const res = await fetch("https://learnify-server-ruddy.vercel.app/api/user/messages/create", {
				headers,
				method: "POST",
				body: JSON.stringify([
					{ content: "Chào bạn, tôi là LearnifyAI!!!", role: "assistant" },
					...(query.data?.messages || []).map(({ content, role }) => ({
						content,
						role: role === "AI" ? "assistant" : "user",
					})),
					{ content: inputText, role: "user" },
				]),
			});

			if (!res.ok) throw new Error("Internal server error!");
			await query.refetch();
		},
	});

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<Ionicons name="arrow-back" size={24} color="white" />
				<Text style={styles.title}>Giải đáp cùng AI</Text>
				<MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
			</View>

			{query.isSuccess && <MessagesView messages={query.data.messages} />}
			{query.isLoading && <MessagesView messages={[]} />}

			<View style={styles.inputContainer}>
				<TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} />
				<TouchableOpacity onPress={() => sendMessage.mutate()} disabled={sendMessage.isPending}>
					{sendMessage.isPending ? (
						<Ionicons name="stop-circle" size={24} color="black" />
					) : (
						<Ionicons name="send" size={24} color="blue" />
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const MessagesView = ({ messages }: { messages?: { id: string; content: string; role: "USER" | "AI" }[] }) => {
	return (
		<ScrollView style={styles.messagesContainer}>
			<View style={[styles.messagesContainer]}>
				<Image
					source={{ uri: "https://img.icons8.com/emoji/48/000000/robot-emoji.png" }}
					style={styles.avatar}
				/>

				<Text style={styles.messageBubbleAI}>Chào bạn, tôi là LearnifyAI!!!</Text>
			</View>

			{messages &&
				messages.map((message) => (
					<View
						key={message.id}
						style={[message.role === "AI" ? styles.messageBubbleAI : styles.messageBubbleUser]}
					>
						<Text style={styles.messageText}>{message.content}</Text>
					</View>
				))}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f5",
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		backgroundColor: "#fff",
		elevation: 2,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
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
	},
	avatar: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderColor: "#ddd",
	},
	textInput: {
		flex: 1,
		padding: 10,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 20,
		marginRight: 10,
	},
});
