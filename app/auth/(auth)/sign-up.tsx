import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Button, Image } from "react-native";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
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
	const { startOAuthFlow: startGitHubOAuthFlow } = useOAuth({ strategy: "oauth_github" });
	const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });

	const handleGoogleSignUp = React.useCallback(async () => {
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

	const handleGitHubSignUp = React.useCallback(async () => {
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

	const handleFacebookSignUp = React.useCallback(async () => {
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
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};

	const onPressVerify = async () => {
		if (!isLoaded) return;

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

			if (completeSignUp.status === "complete") {
				await setActive({ session: completeSignUp.createdSessionId });
				router.replace("/main");
			} else {
				console.error(JSON.stringify(completeSignUp, null, 2));
			}
		} catch (err: any) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<Ionicons name="person-circle-outline" size={64} color="black" />
			</View>

			<Text style={styles.title}>Create your account</Text>
			<Text style={styles.subtitle}>Welcome! Please fill in the details to get started.</Text>
			<View style={styles.socialButtonsContainer}>
				<TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
					<Image source={require("@/assets/images/google-logo.png")} style={styles.socialLogo} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignUp}>
					<Image source={require("@/assets/images/facebook-logo.png")} style={styles.socialLogo} />
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton} onPress={handleGitHubSignUp}>
					<FontAwesome name="github" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.orText}>or</Text>

			{!pendingVerification && (
				<>
					<View style={styles.inputRow}>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="First name"
								value={firstName}
								onChangeText={setFirstName}
							/>
							<Text style={styles.optionalText}>Optional</Text>
						</View>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="Last name"
								value={lastName}
								onChangeText={setLastName}
							/>
							<Text style={styles.optionalText}>Optional</Text>
						</View>
					</View>
					<TextInput
						style={styles.input}
						placeholder="Username"
						value={username}
						onChangeText={setUsername}
					/>
					<TextInput
						style={styles.input}
						placeholder="Email address"
						value={emailAddress}
						onChangeText={setEmailAddress}
						keyboardType="email-address"
					/>
					<TextInput
						style={styles.input}
						placeholder="Phone number"
						value={phoneNumber}
						onChangeText={setPhoneNumber}
						keyboardType="phone-pad"
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>
					<TouchableOpacity style={styles.continueButton} onPress={onSignUpPress}>
						<Text style={styles.continueButtonText}>Continue</Text>
					</TouchableOpacity>
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
						<Text style={styles.continueButtonText}>Continue</Text>
					</TouchableOpacity>
				</>
			)}

			<View style={styles.footer}>
				<Text style={styles.footerText}>Already have an account? </Text>
				<TouchableOpacity>
					<Link href="/auth/sign-in">
						<Text style={styles.footerLink}>Sign In</Text>
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
	},
	socialLogo: {
		width: 24,
		height: 24,
		marginRight: 10,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 20,
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
		backgroundColor: "#444",
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
