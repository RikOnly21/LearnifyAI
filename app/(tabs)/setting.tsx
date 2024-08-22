import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import React, { useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Toast from "react-native-root-toast";

import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
	const { user } = useUser();
	const { isLoaded, signOut } = useAuth();

	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [username, setUsername] = useState(user?.username || "");
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumbers || "");

	const updateUserMutation = useMutation({
		onError: (error) => Toast.show("Lưu thay đổi thất bại!", { duration: 5000 }),
		onSuccess: () => Toast.show("Lưu thay đổi thành công!", { duration: 5000 }),
		mutationFn: async () => {
			console.log(lastName, firstName, username);
			await user?.update({ firstName, lastName, username }).then(() => user.reload());
		},
	});

	const setProfileImage = async (base64: string) => {
		try {
			await user?.setProfileImage({ file: base64 }).then(() => user.reload());
		} catch (error) {
			console.error("Error setting profile image:", error);
			Toast.show("Lưu ảnh đại diện thất bại!", { duration: 5000 });
		}
	};

	const updateUser = async () => {
		if (!firstName || !lastName || !username) return;
		updateUserMutation.mutate();
	};

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

	if (!isLoaded) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Thông tin cá nhân</Text>
			</View>

			<View style={{ paddingHorizontal: 20, gap: 12 }}>
				<View style={styles.card}>
					<Text style={styles.sectionTitle}>
						Xin chào {`${user?.lastName} ${user?.firstName}` || user?.username}
					</Text>

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
								<Text style={styles.changeAvatarButtonText}>
									Thay đổi ảnh đại diện
								</Text>
							</TouchableOpacity>
						</LinearGradient>
					</View>

					<View style={styles.infoSection}>
						<Text style={styles.label}>Username</Text>
						<TextInput
							onChangeText={setUsername}
							style={styles.infoText}
							defaultValue={user?.username || "Trống"}
						/>
					</View>

					<View style={styles.infoSection}>
						<Text style={styles.label}>Họ</Text>
						<TextInput
							onChangeText={setLastName}
							style={styles.infoText}
							defaultValue={user?.lastName || "Trống"}
						/>

						<Text style={styles.label}>Tên</Text>
						<TextInput
							onChangeText={setFirstName}
							style={styles.infoText}
							defaultValue={user?.firstName || "Trống"}
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
					<LinearGradient
						colors={["#66bb6a", "#43a047"]}
						style={{
							borderRadius: 8,
							flex: 1,
							opacity: updateUserMutation.isPending ? 0.5 : 1,
						}}
					>
						<TouchableOpacity
							style={styles.saveChange}
							onPress={() => updateUser()}
							disabled={updateUserMutation.isPending}
						>
							<Ionicons name="save" size={24} color="white" />
							<Text style={styles.changeAvatarButtonText}>
								{updateUserMutation.isPending ? "Đang Lưu..." : "Lưu Thay Đổi"}
							</Text>
						</TouchableOpacity>
					</LinearGradient>

					<LinearGradient
						colors={["#ef5350", "#c62828"]}
						style={{ borderRadius: 8, flex: 1 }}
					>
						<TouchableOpacity
							style={styles.saveChange}
							onPress={() => signOut({ redirectUrl: "/" })}
						>
							<MaterialIcons name="logout" size={24} color="white" />
							<Text style={styles.changeAvatarButtonText}>Đăng Xuất</Text>
						</TouchableOpacity>
					</LinearGradient>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#f8f9fa",
		gap: 12,
	},
	backButton: {
		alignSelf: "flex-start",
		marginBottom: 20,
	},
	header: {
		flexDirection: "column",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#ffffff",
		elevation: 2,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
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
		marginBottom: 10,
		textAlign: "center",
	},
	lastContainer: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-around",
		gap: 12,
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
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 8,
		gap: 8,
		paddingBottom: 8,
		borderRadius: 8,
	},
	changeAvatarButton: {
		borderRadius: 8,
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 8,
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
