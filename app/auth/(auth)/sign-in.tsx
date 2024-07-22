import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from "react-native";

import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function App() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const router = useRouter();

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");

	const onSignInPress = React.useCallback(async () => {
		if (!isLoaded) return;

		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/main");
			} else {
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err: any) {
			console.error(JSON.stringify(err, null, 2));
		}
	}, [isLoaded, emailAddress, password]);

	return (
		<View style={styles.container}>
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

			<TouchableOpacity style={styles.continueButton} onPress={onSignInPress}>
				<Text style={styles.continueButtonText}>Sign In</Text>
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
		borderWidth: 1,
		borderColor: "gray",
		borderRadius: 5,
		padding: 10,
		width: "30%",
		alignItems: "center",
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
	},
	continueButton: {
		backgroundColor: "#444",
		borderRadius: 5,
		padding: 15,
		alignItems: "center",
		marginTop: 10,
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
