import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUser, useAuth } from "@clerk/clerk-expo";

export default function App() {
	const { user } = useUser();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const { isLoaded, userId, sessionId, getToken } = useAuth();

	const setProfileImage = async (base64: string) => {
		try {
			await user?.setProfileImage({ file: base64 }).then(() => user.reload());
		} catch (error) {
			console.error("Error setting profile image:", error);
		}
	};

	if (!isLoaded || !userId) {
		return null;
	}

	const pickImage = async () => {
		if (!user) {
			console.log("CHưa đăng nhập");
			return;
		}

		console.log("đã đăng nhập rồi nè má");
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
			selectionLimit: 1,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			const base64 = result.assets[0].base64;
			const mimeType = result.assets[0].mimeType;

			const image = `data:${mimeType};base64,${base64}`;

			await setProfileImage(image);
		} else {
			console.log("User canceled");
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<TouchableOpacity style={styles.backButton}>
				<Ionicons name="arrow-back" size={24} color="black" />
			</TouchableOpacity>

			<View style={styles.header}>
				<Text style={styles.greeting}>Xin chào,</Text>
				<Text style={styles.name}>{user?.firstName?.toString() || "Thanh Phú"}</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

				<View style={styles.avatarSection}>
					<Text style={styles.label}>Ảnh đại diện</Text>
					<Image
						source={user?.hasImage ? { uri: user.imageUrl } : require("@/assets/images/logo.png")}
						style={styles.avatar}
					/>
					<TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
						<Text style={styles.changeAvatarButtonText}>Thay đổi ảnh đại diện</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Tên người dùng</Text>
					<Text style={styles.infoText}>{user?.fullName || "Thanh Phú"}</Text>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Email</Text>
					<Text style={styles.infoText}>{user?.emailAddresses.toString() || "thanhphuy12102@gmail.com"}</Text>
				</View>

				{/* Tài khoản liên kết và các nút điều hướng khác */}
			</View>
		</ScrollView>
	);
}

// Phần StyleSheet của bạn
// ...
const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		backgroundColor: "#f8f9fa",
	},
	backButton: {
		alignSelf: "flex-start",
		marginBottom: 20,
	},
	header: {
		alignItems: "center",
		marginBottom: 20,
	},
	greeting: {
		fontSize: 18,
		color: "gray",
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	avatarSection: {
		alignItems: "center",
		marginBottom: 20,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 10,
	},
	changeAvatarButton: {
		backgroundColor: "#007bff",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	changeAvatarButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	infoSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	label: {
		fontWeight: "bold",
		color: "gray",
	},
	infoText: {
		fontWeight: "bold",
	},
	linkedAccountSection: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	linkedAccountText: {
		flex: 1,
		marginLeft: 10,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	cancelButton: {
		backgroundColor: "red",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	cancelButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	saveButton: {
		backgroundColor: "#007bff",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	saveButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
