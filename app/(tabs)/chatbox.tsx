import React, { useRef, useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	FlatList,
	Keyboard,
	LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-root-toast";

type Message = {
	messages: { id: string; content: string; role: "USER" | "AI"; createdAt: Date }[];
};

export default function App() {
	const [inputText, setInputText] = useState("");
	const { user } = useUser();
	const flatListRef = useRef<FlatList<{
		id: string;
		content: string;
		role: "USER" | "AI";
	}> | null>(null);
	const [listHeight, setListHeight] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);

	const query = useQuery({
		queryKey: ["user", "messages"],
		queryFn: async () => {
			if (!user) {
				Toast.show("You're not logged in!!", { duration: 5000 });
				throw new Error("You're not logged in!!");
			}

			const headers = new Headers();
			headers.set("clerk-user-id", user.id);

			const res = await fetch("https://learnify-server-ruddy.vercel.app/api/messages", {
				headers,
			});
			if (!res.ok) throw new Error("Internal server error!");

			return (await res.json()) as Message;
		},
	});

	const sendMessage = useMutation({
		onSuccess: () => setInputText(""),
		mutationFn: async () => {
			Keyboard.dismiss();
			if (!user) {
				Toast.show("You're not logged in!!", { duration: 5000 });
				throw new Error("You're not logged in!!");
			}

			const headers = new Headers();
			headers.set("clerk-user-id", user.id);
			headers.set("Content-Type", "application/json");

			const res = await fetch(
				"https://learnify-server-ruddy.vercel.app/api/messages/create",
				{
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
				},
			);

			if (!res.ok) throw new Error("Internal server error!");
			await query.refetch();
			if (flatListRef.current) {
				flatListRef.current.scrollToOffset({
					offset: contentHeight - listHeight,
					animated: true,
				});
			}
		},
	});

	useEffect(() => {
		if (query.data && flatListRef.current) {
			flatListRef.current.scrollToOffset({
				offset: contentHeight - listHeight,
				animated: true,
			});
		}
	}, [query.data, contentHeight, listHeight]);

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.title}>Giải đáp cùng AI</Text>
			</View>

			{query.isSuccess && (
				<MessagesView
					messages={query.data.messages}
					ref={flatListRef}
					onLayout={(event: LayoutChangeEvent) =>
						setListHeight(event.nativeEvent.layout.height)
					}
					onContentSizeChange={(contentWidth: number, contentHeight: number) =>
						setContentHeight(contentHeight)
					}
				/>
			)}
			{query.isLoading && (
				<MessagesView
					messages={[]}
					ref={flatListRef}
					onLayout={(event: LayoutChangeEvent) =>
						setListHeight(event.nativeEvent.layout.height)
					}
					onContentSizeChange={(contentWidth: number, contentHeight: number) =>
						setContentHeight(contentHeight)
					}
				/>
			)}

			<View style={styles.inputContainer}>
				<TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} />
				<TouchableOpacity
					onPress={() => sendMessage.mutate()}
					disabled={sendMessage.isPending}
				>
					{sendMessage.isPending ? (
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
			onLayout,
			onContentSizeChange,
		}: {
			messages?: { id: string; content: string; role: "USER" | "AI" }[];
			onLayout: (event: LayoutChangeEvent) => void;
			onContentSizeChange: (contentWidth: number, contentHeight: number) => void;
		},
		ref: React.Ref<FlatList<{ id: string; content: string; role: "USER" | "AI" }>>,
	) => {
		return (
			<FlatList
				style={styles.messagesContainer}
				data={messages}
				ref={ref}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View
						style={[
							item.role === "AI" ? styles.messageBubbleAI : styles.messageBubbleUser,
						]}
					>
						<Text style={styles.messageText}>{item.content}</Text>
					</View>
				)}
				onLayout={onLayout}
				onContentSizeChange={onContentSizeChange}
			/>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
