import React, { useState } from "react";
<<<<<<< HEAD
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Image } from "react-native";
import Toast from "react-native-root-toast";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

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
	const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });
	const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({ strategy: "oauth_github" });

	const handleGoogleLogin = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startGoogleOAuthFlow({
				redirectUrl: Linking.createURL("/main"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startGoogleOAuthFlow]);

	const handleFacebookLogin = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startFacebookOAuthFlow({
				redirectUrl: Linking.createURL("/main"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startFacebookOAuthFlow]);

	const handleGitHubLogin = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startGitHubOAuthFlow({
				redirectUrl: Linking.createURL("/main"),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth error", err);
		}
	}, [startGitHubOAuthFlow]);

=======
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from "react-native";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function App() {
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");

<<<<<<< HEAD
	const [isLoading, setLoading] = useState(false);

	const onSignInPress = React.useCallback(async () => {
		if (!isLoaded) return;
		setLoading(true);

		try {
			const signInAttempt = await signIn.create({ identifier: emailAddress, password });
=======
	const onSignInPress = React.useCallback(async () => {
		if (!isLoaded) return;

		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			});
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/main");
			} else {
<<<<<<< HEAD
				console.error(JSON.stringify({ signInAttempt }, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
			Toast.show(err.error.message, {
				duration: 3000,
			});
		}

		setLoading(false);
=======
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
		}
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	}, [isLoaded, emailAddress, password]);

	return (
		<View style={styles.container}>
<<<<<<< HEAD
			<Image source={require("@/assets/images/logo.png")} style={styles.logoContainer} />
			<Text style={styles.title}>Đăng nhập LearnifyAI</Text>
			<Text style={styles.subtitle}>Chào mừng bạn! Vui lòng đăng nhập để tiếp tục</Text>
			<View style={styles.socialButtonsContainer}>
				<TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
					<Image source={require("@/assets/images/google-logo.png")} style={styles.socialLogo} />
				</TouchableOpacity>

				<TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
					<Image source={require("@/assets/images/facebook-logo.png")} style={styles.socialLogo} />
				</TouchableOpacity>

				<TouchableOpacity style={styles.socialButton} onPress={handleGitHubLogin}>
=======
			<View style={styles.logoContainer}>
				<Ionicons name="person-circle-outline" size={64} color="black" />
			</View>

			<Text style={styles.title}>Sign in to LearnifyAI</Text>
			<Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>
			<View style={styles.socialButtonsContainer}>
				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="google" size={24} color="black" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="facebook" size={24} color="black" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.socialButton}>
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
					<FontAwesome name="github" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.orText}>or</Text>

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

<<<<<<< HEAD
			<TouchableOpacity style={styles.continueButton} onPress={onSignInPress} disabled={isLoading}>
				{isLoading ? <Text>Loading...</Text> : <Text style={styles.continueButtonText}>Sign In</Text>}
=======
			<TouchableOpacity style={styles.continueButton} onPress={onSignInPress}>
				<Text style={styles.continueButtonText}>Sign In</Text>
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
			</TouchableOpacity>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Don’t have an account? </Text>
				<TouchableOpacity>
					<Link href="/auth/sign-up">
						<Text style={styles.footerLink}>Sign up</Text>
					</Link>
				</TouchableOpacity>
			</View>

			<Text style={styles.securedText}>Secured by Clerk</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 20,
		justifyContent: "center",
<<<<<<< HEAD
		alignItems: "center",
	},
	logoContainer: {
		marginBottom: 20,
		width: 100,
		height: 100,
		resizeMode: "contain",
=======
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 20,
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
<<<<<<< HEAD
		color: "#4A90E2",
=======
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
<<<<<<< HEAD
		marginBottom: 30,
=======
		marginBottom: 20,
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	},
	socialButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 20,
<<<<<<< HEAD
		width: "80%",
=======
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	},
	socialButton: {
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		width: "30%",
		alignItems: "center",
<<<<<<< HEAD
		backgroundColor: "#fff",
	},
	socialLogo: {
		width: 24,
		height: 24,
=======
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
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
<<<<<<< HEAD
		width: "100%",
	},
	continueButton: {
		backgroundColor: "#4A90E2",
=======
	},
	continueButton: {
		backgroundColor: "#444",
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
		borderRadius: 5,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
<<<<<<< HEAD
		width: "100%",
=======
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
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
<<<<<<< HEAD
		color: "#4A90E2",
=======
		color: "#444",
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
		fontWeight: "bold",
	},
	securedText: {
		textAlign: "center",
		color: "gray",
		marginTop: 20,
	},
});
