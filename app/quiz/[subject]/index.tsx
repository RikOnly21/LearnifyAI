import TabLayout from "@/app/(tabs)/_layout";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function App() {
	const { subject } = useLocalSearchParams();
	const router = useRouter();

	return (
		<>
			<View style={styles.container}>
				<View style={styles.header}>
					{router.canGoBack() && (
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color="black" />
						</TouchableOpacity>
					)}
					<Text style={styles.title}>Chọn độ khó</Text>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => router.navigate(`/quiz/${subject}/easy`)}
						activeOpacity={0.7}
					>
						<View style={styles.buttonContent}>
							<Ionicons name="star" size={24} color="yellow" />
							<Text style={styles.buttonText}>Easy</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.button}
						onPress={() => router.navigate(`/quiz/${subject}/medium`)}
						activeOpacity={0.7}
					>
						<View style={styles.buttonContent}>
							<Ionicons name="star" size={24} color="yellow" />
							<Ionicons name="star" size={24} color="yellow" />
							<Text style={styles.buttonText}>Medium</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.button}
						onPress={() => router.navigate(`/quiz/${subject}/hard`)}
						activeOpacity={0.7}
					>
						<View style={styles.buttonContent}>
							<Ionicons name="star" size={24} color="yellow" />
							<Ionicons name="star" size={24} color="yellow" />
							<Ionicons name="star" size={24} color="yellow" />
							<Text style={styles.buttonText}>Hard</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.button}
						onPress={() => router.navigate(`/quiz/${subject}/leaderboard`)}
						activeOpacity={0.7}
					>
						<View style={styles.buttonContent}>
							<Text style={styles.buttonText}>Bảng xếp hạng</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
			<TabLayout />
		</>
	);
}

const styles = StyleSheet.create({
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		backgroundColor: "#DBFAF2",
		paddingVertical: 10,
	},
	container: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "#fff",
	},
	backButton: {
		position: "absolute",
		left: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#000",
	},
	buttonContainer: {
		marginTop: 150,
	},
	button: {
		marginVertical: 12,
		backgroundColor: "#77E4C8",
		padding: 18,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	buttonText: {
		color: "#000",
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		marginLeft: 10,
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
});
