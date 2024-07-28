import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUser, useAuth } from "@clerk/clerk-expo";
import Toast from "react-native-root-toast";

export default function App() {
	const { user } = useUser();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const { isLoaded, userId, sessionId, getToken } = useAuth();
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

	// const setFirstname = async (firstName: string) => {
	// 	try {
	// 		await user?.update({ firstName: firstName });
	// 		console.log("lưu đc rồi");
	// 	} catch (error) {
	// 		console.error("Error setting username:", error);
	// 	}
	// };
	const updateUser = async () => {
		if (!firstName || !lastName) return;

		try {
			console.log(firstName, lastName);
			await user?.update({ firstName, lastName }).then(() => user.reload());
		} catch (error) {
			console.log(new Error(error as string));
		}
	};
	// const setLastname = async (lastName: string) => {
	// 	try {
	// 		await user?.update({ lastName });
	// 	} catch (error) {
	// 		console.error("Error setting username:", error);
	// 	}
	// };
	const handleSaveChanges = async () => {
		if (!user) {
			Toast.show("You're not logged in!!", { duration: 5000 });
			return;
		}

		try {
			//setFirstname(firstName);
			console.log("firstName : ", firstName);
			console.log("LastName nè  : ", lastName);

			updateUser();

			//await user?.update({ firstName:firstName, lastName:lastName });
			// console.log(user?.primaryPhoneNumberId);
			// if (user?.primaryPhoneNumberId) {
			// }
			//await user?.createPhoneNumber({phoneNumber});

			// Thông báo thành công
			Toast.show("Changes saved successfully!", { duration: 5000 });
		} catch (error) {
			console.error("Error saving changes:", error);
			Toast.show("Failed to save changes.", { duration: 5000 });
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
				<Text style={styles.greeting}>Xin chào {user?.firstName?.toString() || "Thanh Phú"}</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

				<View style={styles.avatarSection}>
					<Image
						source={user?.hasImage ? { uri: user.imageUrl } : require("@/assets/images/logo.png")}
						style={styles.avatar}
					/>
					<TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
						<Text style={styles.changeAvatarButtonText}>Thay đổi ảnh đại diện</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Họ</Text>

					<TextInput
						onChangeText={setFirstName}
						style={styles.infoText}
						defaultValue={user?.firstName || "Họ người dùng trống"}
					/>
					<Text style={styles.label}>Tên</Text>

					<TextInput
						onChangeText={setLastName}
						style={styles.infoText}
						defaultValue={user?.lastName || "Tên người dùng trống"}
					/>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.label}>Email</Text>
					<Text style={styles.infoText}>{user?.emailAddresses.toString() || "Email trống"}</Text>
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

			<TouchableOpacity style={styles.changeAvatarButton} onPress={() => updateUser()}>
				<Text style={styles.changeAvatarButtonText}>Lưu thay đổi</Text>
			</TouchableOpacity>
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
		marginTop: 10,
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
