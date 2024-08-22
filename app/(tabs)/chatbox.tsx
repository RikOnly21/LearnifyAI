import { useUser } from "@clerk/clerk-expo";
import { UserResource } from "@clerk/types";

import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Keyboard,
	LayoutChangeEvent,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Markdown from "react-native-markdown-display";

import { api } from "@/lib/api";

export type Message = {
	messages: { id: string; content: string; role: "USER" | "ASSISTANT" }[];
};

const defaultMessage = {
	id: "0",
	content: "Chào bạn, tôi là LearnifyAI!",
	role: "ASSISTANT",
} satisfies Message["messages"][number];

export default function App() {
	const [inputText, setInputText] = useState("");
	const { user } = useUser();

	const [messages, setMessages] = useState<Message["messages"]>([defaultMessage]);

	const flatListRef = useRef<FlatList<Message["messages"][number]> | null>(null);

	const [listHeight, setListHeight] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);

	const query = useQuery({
		queryKey: ["user", "messages", user?.id],
		queryFn: async () => {
			const res = await api.get<Message>("/api/user/messages", {
				headers: { "clerk-user-id": user?.id },
			});

			const data = res.data.messages;
			setMessages([defaultMessage, ...data]);

			await new Promise((resolve) => setTimeout(resolve, 10000));

			return data;
		},
	});

	const sendMessageMutation = useMutation({
		onSuccess: (data) => {
			setMessages((prev) => [
				...prev,
				{ id: Math.random().toString(), content: data, role: "ASSISTANT" },
			]);

			if (flatListRef.current) {
				flatListRef.current.scrollToOffset({
					offset: contentHeight - listHeight,
					animated: true,
				});
			}
		},
		mutationFn: async () => {
			const body = JSON.stringify(
				messages.map(({ content, role }) => ({ content, role: role.toLowerCase() })),
			);

			const res = await api.post<{ message: string }>("/api/user/messages/create", body, {
				headers: { "clerk-user-id": user?.id, "Content-Type": "application/json" },
			});

			return res.data.message;
		},
	});

	const handleSendMessage = () => {
		if (inputText.trim() === "") return;

		Keyboard.dismiss();
		setMessages((prev) => [
			...prev,
			{ id: Math.random().toString(), content: inputText, role: "USER" },
		]);
		setInputText("");

		sendMessageMutation.mutate();
	};

	useEffect(() => {
		if (messages.length > 0 && flatListRef.current) {
			flatListRef.current.scrollToOffset({
				offset: contentHeight - listHeight,
				animated: true,
			});
		}
	}, [messages, contentHeight, listHeight]);

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.title}>Trò chuyện cùng AI</Text>
			</View>

			{(query.isSuccess || query.isError) && (
				<MessagesView
					messages={messages}
					user={user}
					ref={flatListRef}
					onLayout={(event: LayoutChangeEvent) =>
						setListHeight(event.nativeEvent.layout.height)
					}
					onContentSizeChange={(_: number, contentHeight: number) =>
						setContentHeight(contentHeight)
					}
				/>
			)}

			{(query.isLoading || query.isFetching) && !(query.isError || query.isSuccess) && (
				<View style={{ flex: 1 }}>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#4CAF50" />
						<Text style={styles.loadingText}>Đang tải...</Text>
					</View>
				</View>
			)}

			<View style={styles.inputContainer} className="px-4">
				<TextInput
					style={styles.textInput}
					value={inputText}
					onChangeText={setInputText}
					placeholder="Nhập tin nhắn..."
				/>

				<TouchableOpacity
					onPress={handleSendMessage}
					style={{
						opacity:
							sendMessageMutation.isPending || query.isFetching || query.isLoading
								? 0.5
								: 1,
					}}
					disabled={sendMessageMutation.isPending || query.isFetching || query.isLoading}
				>
					{sendMessageMutation.isPending || query.isFetching || query.isLoading ? (
						<Ionicons name="stop-circle" size={24} color="#D3D3D3" />
					) : (
						<Ionicons name="send" size={24} color="#1E90FF" />
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const MessagesView = React.forwardRef(
	(
		{
			messages,
			user,
			onLayout,
			onContentSizeChange,
		}: {
			messages?: Message["messages"];
			user?: UserResource | null;
			onLayout: (event: LayoutChangeEvent) => void;
			onContentSizeChange: (contentWidth: number, contentHeight: number) => void;
		},
		ref: React.Ref<FlatList<Message["messages"][number]>>,
	) => {
		return (
			<FlatList
				style={styles.messagesContainer}
				data={messages}
				ref={ref}
				keyExtractor={(item) => item.id}
				onLayout={onLayout}
				onContentSizeChange={onContentSizeChange}
				renderItem={({ item }) => (
					<MessageBubble content={item.content} role={item.role} user={user} />
				)}
			/>
		);
	},
);

const MessageBubble = ({
	content,
	role,
	user,
}: {
	content: string;
	role: "USER" | "ASSISTANT";
	user?: UserResource | null;
}) => {
	const isAssistant = role === "ASSISTANT";

	return (
		<View
			style={[styles.messageContainer, isAssistant ? styles.messageAI : styles.messageUser]}
		>
			<Image
				source={isAssistant ? require("@/assets/images/logo.png") : { uri: user?.imageUrl }}
				style={styles.logo}
			/>

			<View
				style={[
					styles.messageBubble,
					isAssistant ? styles.messageBubbleAI : styles.messageBubbleUser,
				]}
			>
				<Markdown>{content}</Markdown>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 8,
		backgroundColor: "#f0f0f5",
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
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
	messageContainer: {
		gap: 8,
		flexDirection: "row",
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	messageAI: {
		alignSelf: "flex-start",
	},
	messageUser: {
		alignSelf: "flex-end",
		flexDirection: "row-reverse",
	},
	messageBubble: {
		paddingHorizontal: 8,
		minHeight: 40,
		borderRadius: 12,
		maxWidth: "85%",
		shadowColor: "#000",
		shadowOffset: { height: 2, width: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 3,
	},
	messageBubbleAI: {
		alignSelf: "flex-start",
		backgroundColor: "#B3E5FC",
	},
	messageBubbleUser: {
		alignSelf: "flex-end",
		backgroundColor: "#DCF8C6",
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
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		marginRight: 10,
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
	logo: {
		width: 40,
		height: 40,
		borderRadius: 100,
	},
});
