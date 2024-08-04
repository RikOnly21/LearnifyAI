import React, { useState } from "react";
import {
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ScrollView,
} from "react-native";

import { useOAuth, useSignUp } from "@clerk/clerk-expo";

import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import LinearGradient from "react-native-linear-gradient";

export const useWarmUpBrowser = () => {
	React.useEffect(() => {
		void WebBrowser.warmUpAsync();
		return () => {
			void WebBrowser.coolDownAsync();
		};
	}, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function App() {
	useWarmUpBrowser();

	const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
	const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({ strategy: "oauth_github" });
	const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });

	const handleGoogleSignUp = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startGoogleOAuthFlow({
				redirectUrl: Linking.createURL("/home"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startGoogleOAuthFlow]);

	const handleGitHubSignUp = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startGitHubOAuthFlow({
				redirectUrl: Linking.createURL("/home"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startGitHubOAuthFlow]);

	const handleFacebookSignUp = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startFacebookOAuthFlow({
				redirectUrl: Linking.createURL("/home"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startFacebookOAuthFlow]);

	const { isLoaded, signUp, setActive } = useSignUp();
	const router = useRouter();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [emailAddress, setEmailAddress] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");

	const [pendingVerification, setPendingVerification] = React.useState(false);
	const [code, setCode] = React.useState("");

	const onSignUpPress = async () => {
		if (!isLoaded) return;

		try {
			await signUp.create({ emailAddress, password, username });

			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			setPendingVerification(true);
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
		}
	};

	const onPressVerify = async () => {
		if (!isLoaded) return;

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

			if (completeSignUp.status === "complete") {
				await setActive({ session: completeSignUp.createdSessionId });
				router.replace("/home");
			} else {
				console.error(JSON.stringify(completeSignUp, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
		}
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.logoContainer}>
				<Image source={require("@/assets/images/logo.png")} style={styles.logoImage} />
			</View>

			<Text style={styles.title}>Tạo tài khoản mới</Text>
			<Text style={styles.subtitle}>Vui lòng điền thông tin vào các ô trống để bắt đầu</Text>
			<View style={styles.socialButtonsContainer}>
				<TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
					<Image
						source={require("@/assets/images/google-logo.png")}
						style={styles.socialLogo}
					/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignUp}>
					<Image
						source={require("@/assets/images/facebook-logo.png")}
						style={styles.socialLogo}
					/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton} onPress={handleGitHubSignUp}>
					<FontAwesome name="github" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.orText}>Hoặc</Text>

			{!pendingVerification && (
				<>
					<View style={styles.inputRow}>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="Họ"
								value={firstName}
								onChangeText={setFirstName}
							/>
							<Text style={styles.optionalText}></Text>
						</View>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="Tên"
								value={lastName}
								onChangeText={setLastName}
							/>
							<Text style={styles.optionalText}></Text>
						</View>
					</View>
					<TextInput
						style={styles.input}
						placeholder="Tài khoản"
						value={username}
						onChangeText={setUsername}
					/>
					<TextInput
						style={styles.input}
						placeholder="Địa chỉ email"
						value={emailAddress}
						onChangeText={setEmailAddress}
						keyboardType="email-address"
					/>
					<TextInput
						style={styles.input}
						placeholder="Số điện thoại"
						value={phoneNumber}
						onChangeText={setPhoneNumber}
						keyboardType="phone-pad"
					/>
					<TextInput
						style={styles.input}
						placeholder="Mật khẩu"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>
					<LinearGradient colors={["#87CEFA", "#4682B4"]} style={{ borderRadius: 5 }}>
						<TouchableOpacity style={styles.continueButton} onPress={onSignUpPress}>
							<Text style={styles.continueButtonText}>Tiếp tục</Text>
						</TouchableOpacity>
					</LinearGradient>
				</>
			)}

			{pendingVerification && (
				<>
					<TextInput
						style={styles.input}
						value={code}
						placeholder="Code..."
						onChangeText={(code) => setCode(code)}
					/>
					<TouchableOpacity style={styles.continueButton} onPress={onPressVerify}>
						<Text style={styles.continueButtonText}>Tiếp tục</Text>
					</TouchableOpacity>
				</>
			)}

			<View style={styles.footer}>
				<Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
				<TouchableOpacity>
					<Link href="/auth/sign-in">
						<Text style={styles.footerLink}>Đăng nhập</Text>
					</Link>
				</TouchableOpacity>
			</View>

			<Text style={styles.securedText}>Được bảo mật bởi Clerk</Text>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 20,
	},
	socialLogo: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	logoContainer: {
		alignItems: "center",
	},
	logoImage: {
		marginBottom: 20,
		width: 100,
		height: 100,
		resizeMode: "contain",
		borderRadius: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
		marginBottom: 20,
	},
	socialButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 20,
	},
	socialButton: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		width: "30%",
		justifyContent: "center",
	},
	socialButtonText: {
		fontSize: 16,
	},
	orText: {
		textAlign: "center",
		color: "gray",
		marginBottom: 20,
	},
	inputRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	inputContainer: {
		flex: 1,
		marginRight: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
	},
	optionalText: {
		position: "absolute",
		right: 10,
		top: 15,
		color: "gray",
	},
	continueButton: {
		borderRadius: 5,
		padding: 15,
		alignItems: "center",
	},
	continueButtonText: {
		color: "#fff",
		fontSize: 16,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 20,
	},
	footerText: {
		color: "gray",
	},
	footerLink: {
		color: "#444",
		fontWeight: "bold",
	},
	securedText: {
		textAlign: "center",
		color: "gray",
		marginTop: 20,
	},
});
