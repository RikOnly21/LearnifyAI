import { useAuth, useUser } from "@clerk/clerk-expo";

import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";

import React from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const categories = [
	{
		title: "Chat với AI",
		items: [
			{ title: "Dịch nghĩa", image: require("@/assets/images/translate.png") },
			{ title: "Hỏi- đáp", image: require("@/assets/images/QNA.png") },
		],
	},
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
<<<<<<< HEAD
	const { isLoaded, signOut, isSignedIn, sessionId } = useAuth();
=======
	const { isLoaded, signOut, isSignedIn } = useAuth();
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	const { user } = useUser();

	if (!isLoaded) return null;
	if (!isSignedIn || !user) return <Redirect href="/" />;

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text style={styles.greeting}>Xin chào,</Text>
					<Text style={styles.name}>{user.username}</Text>
					<Button title="Signout" onPress={() => signOut({ redirectUrl: "/" })}></Button>
					<Image
						source={{ uri: "https://img.icons8.com/emoji/96/000000/man-student.png" }}
						style={styles.profileImage}
					/>
				</View>

				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
					<TextInput style={styles.searchInput} placeholder="Search" />
				</View>

				<Image source={{ uri: "https://img.icons8.com/ios/452/english.png" }} style={styles.bannerImage} />

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
