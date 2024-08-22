import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
	const { user } = useUser();
	const router = useRouter();

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<Text style={styles.name}>Xin chào {user!.username} ✋!</Text>

					<View style={styles.profileImageContainer}>
						<Image source={{ uri: user!.imageUrl }} style={styles.profileImage} />
					</View>
				</View>

				<Image source={require("@/assets/images/english.png")} style={styles.bannerImage} />

				<View style={styles.categoryContainer}>
					{categories.map((category, index) => (
						<View key={index}>
							<Text style={styles.categoryTitle}>{category.title}</Text>

							<ScrollView
								contentContainerStyle={styles.cardContainer}
								horizontal
								showsHorizontalScrollIndicator={false}
							>
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

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	scrollView: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: 12,
	},
	name: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
	},
	profileImageContainer: {
		width: 40,
		height: 40,
		borderRadius: 25,
		overflow: "hidden",
	},
	profileImage: {
		width: "100%",
		height: "100%",
	},
	bannerImage: {
		width: "100%",
		height: 180,
		borderRadius: 15,
		marginBottom: 12,
		resizeMode: "cover",
	},
	categoryContainer: {
		rowGap: 12,
		paddingBottom: 40,
	},
	categoryTitle: {
		fontSize: 20,
		fontWeight: 700,
		color: "#333",
		marginBottom: 8,
	},
	cardContainer: {
		flexDirection: "row",
		paddingBottom: 4,
		gap: 12,
	},
	card: {
		width: 160,
		backgroundColor: "#fff",
		borderRadius: 15,
		paddingVertical: 15,
		paddingHorizontal: 10,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardImage: {
		width: 90,
		height: 90,
		borderRadius: 10,
		marginBottom: 10,
	},
	cardTitle: { fontSize: 14, textAlign: "center", color: "#555" },
});
