import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";

import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const categories = [
	{
		title: "Học từ vựng",
		items: [
			{
				subject: "trees",
				title: "Chủ đề cây cối",
				image: require("@/assets/images/tree.png"),
			},
			{
				subject: "animals",
				title: "Chủ đề động vật",
				image: require("@/assets/images/animal.png"),
			},
			{
				subject: "household_appliances",
				title: "Chủ đề vật dụng trong gia đình",
				image: require("@/assets/images/household-appliance.png"),
			},
			{
				subject: "school",
				title: "Chủ đề trường học",
				image: require("@/assets/images/school.png"),
			},
			{
				subject: "colors",
				title: "Chủ đề màu sắc",
				image: require("@/assets/images/color.png"),
			},
			{
				subject: "custom",
				title: "Bài tập ngẫu nhiên",
				image: require("@/assets/images/hmm.png"),
			},
		],
	},
	{
		title: "Học mẫu câu",
		items: [
			{
				subject: "health_inquiries",
				title: "Mẫu câu hỏi thăm sức khỏe",
				image: require("@/assets/images/health.png"),
			},
			{
				subject: "time_inquiries",
				title: "Mẫu câu hỏi về thời gian",
				image: require("@/assets/images/time.png"),
			},
			{
				subject: "hobbies_inquiries",
				title: "Mẫu câu hỏi về sở thích",
				image: require("@/assets/images/favorite.png"),
			},
			{
				subject: "custom_inquiries",
				title: "Bài tập ngẫu nhiên",
				image: require("@/assets/images/hmm1.png"),
			},
		],
	},
	{
		title: "Bài tập",
		items: [
			{
				subject: "sentence_exercises",
				title: "Bài tập về mẫu câu",
				image: require("@/assets/images/sentense.png"),
			},
			{
				subject: "fill_in_the_blank_exercises",
				title: "Bài tập điền khuyết",
				image: require("@/assets/images/fill.png"),
			},
			{
				subject: "listening_skills_exercises",
				title: "Bài tập về kĩ năng nghe",
				image: require("@/assets/images/listening.png"),
			},
			{
				subject: "custom_exercises",
				title: "Bài tập ngẫu nhiên",
				image: require("@/assets/images/hmm2.png"),
			},
		],
	},
];

export default function App() {
	const { isLoaded, isSignedIn } = useAuth();
	const { user } = useUser();
	const router = useRouter();

	if (!isLoaded) return null;
	if (!isSignedIn || !user) return <Redirect href="/" />;

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text style={styles.name}>Xin chào {user.username} ✋!</Text>
					<Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
				</View>

				<Image source={require("@/assets/images/english.png")} style={styles.bannerImage} />

				<View style={styles.categoryContainer}>
					{categories.map((category, index) => (
						<View key={index}>
							<View>
								<Text style={styles.categoryTitle}>{category.title}</Text>
							</View>

							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								{category.items.map((item, idx) => (
									<TouchableOpacity
										key={idx}
										style={styles.card}
										onPress={() => router.push("/quiz/" + item.subject)}
									>
										<Image source={item.image} style={styles.cardImage} />
										<Text style={styles.cardTitle}>{item.title}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	signOutButton: {
		backgroundColor: "red",
		borderRadius: 5,
		paddingVertical: 5,
		paddingHorizontal: 15,
	},
	profileContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	signOutImage: {
		width: 20,
		height: 20,
	},
	scrollView: {
		padding: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		paddingBottom: 12,
	},
	greeting: {
		fontSize: 18,
		marginRight: 5,
		color: "#fff",
	},
	name: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginLeft: "auto",
	},
	searchInput: {
		flex: 1,
		height: 40,
	},
	bannerImage: {
		width: "100%",
		height: 150,
		borderRadius: 10,
		marginBottom: 10,
	},
	categoryContainer: {
		display: "flex",
		rowGap: 10,
		paddingBottom: 30,
	},
	categoryTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	card: {
		width: 150,
		marginRight: 10,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E0F2F1",
		borderRadius: 10,
		padding: 10,
	},
	cardImage: {
		width: 80,
		height: 80,
		borderRadius: 15,
	},
	cardTitle: {
		fontSize: 14,
		textAlign: "center",
		color: "#00363A",
	},
});
