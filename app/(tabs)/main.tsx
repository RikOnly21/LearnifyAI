import { useAuth, useUser } from "@clerk/clerk-expo";

import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";

import React from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const categories = [
	{
		title: "Học từ vựng",
		items: [
			{ title: "Chủ đề cây cối", image: require("@/assets/images/tree.png") },
			{ title: "Chủ đề động vật", image: require("@/assets/images/animal.png") },
			{ title: "Chủ đề vật dụng trong gia đình", image: require("@/assets/images/household-appliance.png") },
			{ title: "Chủ đề trường học", image: require("@/assets/images/school.png") },
			{ title: "Chủ đề màu sắc", image: require("@/assets/images/color.png") },
			{ title: "Chủ đề bạn muốn là gì?", image: require("@/assets/images/hmm.png") },
		],
	},
	{
		title: "Học mẫu câu",
		items: [
			{ title: "Mẫu câu hỏi thăm sức khỏe", image: require("@/assets/images/health.png") },
			{ title: "Mẫu câu hỏi về thời gian", image: require("@/assets/images/time.png") },
			{ title: "Mẫu câu hỏi về sở thích", image: require("@/assets/images/favorite.png") },
			{ title: "Mẫu câu bạn muốn tìm hiểu là gì?", image: require("@/assets/images/hmm1.png") },
		],
	},
	{
		title: "Bài tập",
		items: [
			{ title: "Bài tập về mẫu câu", image: require("@/assets/images/sentense.png") },
			{ title: "Bài tập điền khuyết", image: require("@/assets/images/fill.png") },
			{ title: "Bài tập về kĩ năng nghe", image: require("@/assets/images/listening.png") },
			{ title: "Bạn bài tập gì?", image: require("@/assets/images/hmm2.png") },
		],
	},
];

export default function App() {
	const { isLoaded, signOut, isSignedIn, sessionId } = useAuth();
	const { user } = useUser();

	if (!isLoaded) return null;
	if (!isSignedIn || !user) return <Redirect href="/" />;

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text style={styles.greeting}>Xin chào,</Text>
					<Text style={styles.name}>{user.username}</Text>
					<TouchableOpacity style={styles.signOutButton} onPress={() => signOut({ redirectUrl: "/" })}>
						<Text style={styles.signOutButtonText}>SIGN OUT</Text>
					</TouchableOpacity>
					<Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
				</View>

				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
					<TextInput style={styles.searchInput} placeholder="Search" />
				</View>

				<Image source={require("@/assets/images/english.png")} style={styles.bannerImage} />

				{categories.map((category, index) => (
					<View key={index} style={styles.categoryContainer}>
						<Text style={styles.categoryTitle}>{category.title}</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{category.items.map((item, idx) => (
								<TouchableOpacity key={idx} style={styles.card}>
									<Image source={item.image} style={styles.cardImage} />
									<Text style={styles.cardTitle}>{item.title}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f8f8",
	},
	signOutButton: {
		backgroundColor: "#007bff", // Màu nền xanh dương
		borderRadius: 15, // Làm tròn các góc
		paddingVertical: 10, // Độ dày dọc của nút
		paddingHorizontal: 30, // Độ dày ngang của nút
		shadowColor: "#000", // Màu bóng
		shadowOffset: { width: 0, height: 1 }, // Độ lệch bóng
		shadowOpacity: 0.2, // Độ mờ của bóng
		shadowRadius: 1.41, // Bán kính làm mờ bóng
		elevation: 2, // Độ nổi cho Android
	},
	signOutButtonText: {
		color: "#fff", // Màu chữ trắng
		fontWeight: "bold", // Độ đậm của chữ
		textAlign: "center", // Căn giữa chữ trong nút
	},
	scrollView: {
		padding: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	greeting: {
		fontSize: 18,
		marginRight: 5,
	},
	name: {
		fontSize: 18,
		fontWeight: "bold",
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginLeft: "auto",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 20,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		height: 40,
	},
	bannerImage: {
		width: "100%",
		height: 150,
		borderRadius: 10,
		marginBottom: 20,
	},
	categoryContainer: {
		marginBottom: 20,
	},
	categoryTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	card: {
		width: 150,
		marginRight: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 10,
		alignItems: "center",
	},
	cardImage: {
		width: 80,
		height: 80,
		marginBottom: 10,
	},
	cardTitle: {
		fontSize: 14,
		textAlign: "center",
	},
});
