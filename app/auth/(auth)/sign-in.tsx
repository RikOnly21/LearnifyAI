import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";

import { useOAuth, useSignIn } from "@clerk/clerk-expo";

import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

export const useWarmUpBrowser = () => {
	React.useEffect(() => {
		void WebBrowser.warmUpAsync();
		return () => {
			void WebBrowser.coolDownAsync();
		};
	}, []);
};

WebBrowser.maybeCompleteAuthSession();

const handleOAuthLogin = async (startOAuthFlow: ReturnType<typeof useOAuth>["startOAuthFlow"]) => {
	try {
		const { createdSessionId, setActive } = await startOAuthFlow({
			redirectUrl: Linking.createURL("/home"),
		});

		if (createdSessionId) setActive!({ session: createdSessionId });
	} catch (err) {
		console.error("OAuth error", err);
	}
};

export default function App() {
	useWarmUpBrowser();

	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");

	const [isLoading, setLoading] = useState(false);

	const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
	const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });
	const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({ strategy: "oauth_github" });

	const onSignInPress = async () => {
		if (!isLoaded) return;
		setLoading(true);

		try {
			const signInAttempt = await signIn.create({ identifier: emailAddress, password });

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				return router.replace("/home");
			}

			console.error(JSON.stringify({ signInAttempt }, null, 2));
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));

			if (typeof err === "object" && "errors" in err && Array.isArray(err.errors)) {
				Toast.show(err.errors[0].message, {
					duration: 3000,
					position: Toast.positions.CENTER,
				});
			}
		}

		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<Image source={require("@/assets/images/logo.png")} style={styles.logoContainer} />
			<Text style={styles.title}>Đăng nhập LearnifyAI</Text>
			<Text style={styles.subtitle}>Chào mừng bạn! Vui lòng đăng nhập để tiếp tục</Text>
			<View style={styles.socialButtonsContainer}>
				<TouchableOpacity
					style={styles.socialButton}
					onPress={() => handleOAuthLogin(startGoogleOAuthFlow)}
				>
					<Image
						source={require("@/assets/images/google-logo.png")}
						style={styles.socialLogo}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.socialButton}
					onPress={() => handleOAuthLogin(startFacebookOAuthFlow)}
				>
					<Image
						source={require("@/assets/images/facebook-logo.png")}
						style={styles.socialLogo}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.socialButton}
					onPress={() => handleOAuthLogin(startGitHubOAuthFlow)}
				>
					<FontAwesome name="github" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.orText}>hoặc</Text>

			<TextInput
				style={styles.input}
				placeholder="Email address"
				value={emailAddress}
				onChangeText={setEmailAddress}
				keyboardType="email-address"
			/>

			<TextInput
				style={styles.input}
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<LinearGradient colors={["#1E90FF", "#00509E"]} style={styles.continueButton}>
				<TouchableOpacity onPress={() => onSignInPress()} disabled={isLoading}>
					{isLoading ? (
						<Text style={styles.continueButtonText}>Đang tải...</Text>
					) : (
						<Text style={styles.continueButtonText}>Đăng nhập</Text>
					)}
				</TouchableOpacity>
			</LinearGradient>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Bạn không có tài khoản? </Text>
				<TouchableOpacity>
					<Link href="/auth/sign-up">
						<Text style={styles.footerLink}>Đăng ký</Text>
					</Link>
				</TouchableOpacity>
			</View>

			<Text style={styles.securedText}>Được bảo mật bởi Clerk</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	logoContainer: {
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
		color: "#4A90E2",
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
		marginBottom: 30,
	},
	socialButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 20,
		width: "80%",
	},
	socialButton: {
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		width: "30%",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	socialLogo: {
		width: 24,
		height: 24,
	},
	orText: {
		textAlign: "center",
		color: "gray",
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
		width: "100%",
	},
	continueButton: {
		backgroundColor: "#4A90E2",
		borderRadius: 5,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
		width: "100%",
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
		color: "#4A90E2",
		fontWeight: "bold",
	},
	securedText: {
		textAlign: "center",
		color: "gray",
		marginTop: 20,
	},
});
