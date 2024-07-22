import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function App() {
	const [messages, setMessages] = useState([{ id: 1, text: "Chào bạn, tôi là LearnifyAI", sender: "ai" }]);
	const [inputText, setInputText] = useState("");

	const sendMessage = () => {
		if (inputText.trim()) {
			setMessages([...messages, { id: messages.length + 1, text: inputText, sender: "user" }]);
			setInputText("");
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<Ionicons name="arrow-back" size={24} color="black" />
				<Text style={styles.title}>Giải đáp cùng AI</Text>
				<MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
			</View>

			<ScrollView style={styles.messagesContainer}>
				{messages.map((message) => (
					<View
						key={message.id}
						style={[styles.messageBubble, message.sender === "ai" ? styles.aiBubble : styles.userBubble]}
					>
						{message.sender === "ai" && (
							<Image
								source={{ uri: "https://img.icons8.com/emoji/48/000000/robot-emoji.png" }}
								style={styles.avatar}
							/>
						)}
						<Text style={styles.messageText}>{message.text}</Text>
						{message.sender === "user" && (
							<Image
								source={{ uri: "https://img.icons8.com/emoji/48/000000/woman-raising-hand.png" }}
								style={styles.avatar}
							/>
						)}
					</View>
				))}
			</ScrollView>
			<View style={styles.inputContainer}>
				<TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} />
				<TouchableOpacity onPress={sendMessage}>
					<Ionicons name="send" size={24} color="blue" />
				</TouchableOpacity>
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
	messageBubble: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 5,
		padding: 10,
		borderRadius: 10,
	},
	aiBubble: {
		alignSelf: "flex-start",
		backgroundColor: "#d1e7ff",
	},
	userBubble: {
		alignSelf: "flex-end",
		backgroundColor: "#d1e7ff",
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
