import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { useAuth, useOAuth } from "@clerk/clerk-expo";

import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Link, Redirect } from "expo-router";
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

export default function App() {
	useWarmUpBrowser();

	const { isSignedIn } = useAuth();
	const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

	const handleGoogleLogin = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive, signIn } = await startOAuthFlow({
				redirectUrl: Linking.createURL("/home"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, []);

	if (isSignedIn) return <Redirect href="home" />;

	return (
		<View style={styles.container}>
			<Image source={require("@/assets/images/loginImage.png")} style={styles.headerImage} />
			<View style={styles.content}>
				<Text style={styles.title}>Chào mừng bạn đến với LearnifyAI</Text>

				<Text style={styles.subtitle}>
					<Link href="/auth/sign-in">
						<Text>Đăng nhập</Text>
					</Link>
					/
					<Link href="/auth/sign-up">
						<Text>Đăng ký</Text>
					</Link>
				</Text>

				<LinearGradient colors={["#1E90FF", "#00509E"]} style={styles.googleButton}>
					<TouchableOpacity onPress={handleGoogleLogin} style={{ flexDirection: "row" }}>
						<FontAwesome
							name="google"
							size={24}
							color="white"
							style={styles.googleIcon}
						/>
						<Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
					</TouchableOpacity>
				</LinearGradient>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#4793AF",
		justifyContent: "center",
		alignItems: "center",
	},
	headerImage: {
		width: "100%",
		height: 200,
		resizeMode: "cover",
	},
	content: {
		flex: 1,
		width: "100%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 50,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
		marginBottom: 20,
	},
	googleButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
	},
	googleIcon: {
		marginRight: 10,
	},
	googleButtonText: {
		color: "white",
		fontSize: 16,
	},
});
