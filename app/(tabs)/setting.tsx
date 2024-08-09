import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import React, { useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-root-toast";

export default function App() {
	const { user } = useUser();
	const { isLoaded, signOut } = useAuth();

	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [firstName, setFirstName] = useState(user?.firstName);
	const [lastName, setLastName] = useState(user?.lastName);
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumbers || "");

	const setProfileImage = async (base64: string) => {
		try {
			await user?.setProfileImage({ file: base64 }).then(() => user.reload());
		} catch (error) {
			console.error("Error setting profile image:", error);
		}
	};

	const updateUser = async () => {
		if (!firstName || !lastName) return;

		try {
			console.log(firstName, lastName);
			await user?.update({ firstName, lastName }).then(() => user.reload());
		} catch (error) {
			console.log(new Error(error as string));
		}
	};

	const handleSaveChanges = async () => {
		if (!user) {
			Toast.show("You're not logged in!!", { duration: 5000 });
			return;
		}

		try {
			updateUser();
			Toast.show("Changes saved successfully!", { duration: 5000 });
		} catch (error) {
			console.error("Error saving changes:", error);
			Toast.show("Failed to save changes.", { duration: 5000 });
		}
	};

	if (!isLoaded) return null;

	const pickImage = async () => {
		if (!user) return;

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
			<View style={styles.header}>
				<Text style={styles.greeting}>
					Xin chào {user?.firstName?.toString() || user?.username}
				</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

				<View className="gap-2" style={styles.avatarSection}>
					<Image
						source={
							user?.hasImage
								? { uri: user.imageUrl }
								: require("@/assets/images/logo.png")
						}
						style={styles.avatar}
					/>
					<LinearGradient colors={["#42a5f5", "#2196f3"]} style={{ borderRadius: 8 }}>
						<TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
							<Text style={styles.changeAvatarButtonText}>Thay đổi ảnh đại diện</Text>
						</TouchableOpacity>
					</LinearGradient>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Họ</Text>
					<TextInput
						onChangeText={setFirstName}
						style={styles.infoText}
						defaultValue={user?.firstName || "Trống"}
					/>

					<Text style={styles.label}>Tên</Text>
					<TextInput
						onChangeText={setLastName}
						style={styles.infoText}
						defaultValue={user?.lastName || "Trống"}
					/>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.infoText}
						defaultValue={user?.emailAddresses.toString()}
					/>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Số điện thoại</Text>
					<TextInput
						onChangeText={setPhoneNumber}
						style={styles.infoText}
						defaultValue={user?.phoneNumbers.toString() || "Chưa có số điện thoại"}
					/>
				</View>
			</View>

			<View style={styles.lastContainer}>
				<LinearGradient colors={["#66bb6a", "#43a047"]} style={{ borderRadius: 8 }}>
					<TouchableOpacity style={styles.saveChange} onPress={() => updateUser()}>
						<Ionicons name="save" size={24} color="white" />
						<Text style={styles.changeAvatarButtonText}>Lưu thay đổi</Text>
					</TouchableOpacity>
				</LinearGradient>

				<LinearGradient colors={["#ef5350", "#c62828"]} style={{ borderRadius: 8 }}>
					<TouchableOpacity
						style={styles.saveChange}
						onPress={() => signOut({ redirectUrl: "/" })}
					>
						<MaterialIcons name="logout" size={24} color="white" />
						<Text style={styles.changeAvatarButtonText}>Đăng Xuất</Text>
					</TouchableOpacity>
				</LinearGradient>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		backgroundColor: "#f8f9fa",
		gap: 12,
	},
	backButton: {
		alignSelf: "flex-start",
		marginBottom: 20,
	},
	header: {
		alignItems: "center",
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
		borderRadius: 8,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	lastContainer: {
		width: "100%", // Chiếm toàn bộ chiều rộng
		flexDirection: "row", // Sắp xếp theo hàng ngang
		justifyContent: "space-around",
	},
	avatarSection: {
		alignItems: "center",
		marginBottom: 15,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	saveChange: {
		flex: 1, // Chiếm toàn bộ không gian
		flexDirection: "row", // Sắp xếp theo hàng ngang
		alignItems: "center", // Căn giữa theo chiều dọc
		justifyContent: "center", // Căn giữa theo chiều ngang
		paddingLeft: 16, // Padding trái
		paddingRight: 16, // Padding phải
		paddingTop: 8, // Padding trên
		paddingBottom: 8, // Padding dưới
		borderRadius: 8, // Độ bo góc
	},
	changeAvatarButton: {
		borderRadius: 8, // Độ bo góc
		paddingLeft: 16, // Padding trái
		paddingRight: 16, // Padding phải
		paddingTop: 8, // Padding trên
		paddingBottom: 8,
	},
	changeAvatarButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	infoSection: {
		flexDirection: "row",
		justifyContent: "space-between",
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
