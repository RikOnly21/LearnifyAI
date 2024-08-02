import React from "react";
import { StyleSheet, View, Text, ScrollView, Image, SafeAreaView } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

// Sample data for the leaderboard
const users = [
	{ id: 1, username: "Username1", score: "10d", time: "13.6s", avatar: "https://example.com/avatar1.png" },
	{ id: 2, username: "Username2", score: "10d", time: "16.9s", avatar: "https://example.com/avatar2.png" },
	{ id: 3, username: "Username3", score: "9d", time: "12s", avatar: "https://example.com/avatar3.png" },
	{ id: 4, username: "Username4", score: "1d", time: "3.01s", avatar: "https://example.com/avatar4.png" },
	{ id: 5, username: "Username5", score: "1d", time: "3.5s", avatar: "https://example.com/avatar5.png" },
];

const App = () => {
	const { user } = useUser();

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				<View style={styles.topThreeContainer}>
					{users.slice(0, 3).map((user, index) => (
						<View
							key={user.id}
							style={[styles.topUserContainer, { backgroundColor: getPodiumColor(index + 1) }]}
						>
							<Text style={[styles.rank, styles.topThreeRankStyle]}>{index + 1}</Text>
							<Image source={{ uri: user.avatar }} style={styles.largeAvatar} />
							<Text style={styles.username}>{user.username}</Text>
							<Text style={styles.score}>{user.score}</Text>
							<Text style={styles.time}>{user.time}</Text>
						</View>
					))}
				</View>
				{users.slice(3).map((user, index) => (
					<View key={user.id} style={styles.regularUserContainer}>
						<Text style={styles.rank}>{index + 4}</Text>
						<Image source={{ uri: user.avatar }} style={styles.avatar} />
						<View style={styles.infoContainer}>
							<Text style={styles.username}>{user.username}</Text>
							<Text style={styles.score}>{user.score}</Text>
							<Text style={styles.time}>{user.time}</Text>
						</View>
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

const getPodiumColor = (rank: number) => {
	switch (rank) {
		case 1:
			return "#FFD700"; // gold
		case 2:
			return "#C0C0C0"; // silver
		case 3:
			return "#CD7F32"; // bronze
		default:
			return "transparent";
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	topThreeContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 10,
	},
	topUserContainer: {
		alignItems: "center",
		padding: 10,
		borderRadius: 10,
	},
	topThreeRankStyle: { fontSize: 24, color: "white", fontWeight: "bold", marginBottom: 8 },
	regularUserContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		padding: 10,
		marginVertical: 2,
	},
	rank: {
		fontSize: 18,
		marginRight: 10,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	largeAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	infoContainer: {
		flex: 1,
	},
	username: {
		fontSize: 16,
		fontWeight: "bold",
	},
	score: {
		fontSize: 14,
		color: "#888",
	},
	time: {
		fontSize: 12,
		color: "#666",
	},
});

export default App;
