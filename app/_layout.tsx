import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

<<<<<<< HEAD
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-expo";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";

import "expo-dev-client";
import "react-native-reanimated";

=======
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useEffect } from "react";
import "react-native-reanimated";
import "expo-dev-client";

>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
import { useColorScheme } from "@/hooks/useColorScheme";

export interface TokenCache {
	getToken: (key: string) => Promise<string | undefined | null>;
	saveToken: (key: string, token: string) => Promise<void>;
	clearToken?: (key: string) => void;
}

const tokenCache = {
	async getToken(key: string) {
		try {
			const item = await SecureStore.getItemAsync(key);
			if (item) {
				console.log(`${key} was used 🔐 \n`);
			} else {
				console.log("No values stored under key: " + key);
			}
			return item;
		} catch (error) {
			console.error("SecureStore get item error: ", error);
			await SecureStore.deleteItemAsync(key);
			return null;
		}
	},

	async saveToken(key: string, value: string) {
		try {
			return SecureStore.setItemAsync(key, value);
		} catch (err) {
			return;
		}
	},
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
if (!publishableKey) {
	throw new Error("Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
}

<<<<<<< HEAD
const queryClient = new QueryClient();

=======
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) SplashScreen.hideAsync();
	}, [loaded]);

	if (!loaded) return null;

	return (
<<<<<<< HEAD
		<RootSiblingParent>
			<QueryClientProvider client={queryClient}>
				<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
					<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
						<ClerkLoaded>
							<Stack
								initialRouteName="index"
								screenOptions={{ statusBarHidden: false, headerShown: false }}
							>
								<Stack.Screen name="index" />
								<Stack.Screen name="(tabs)" />
								<Stack.Screen name="+not-found" />
							</Stack>
						</ClerkLoaded>

						<ClerkLoading>
							<View>
								<Image source={require("@/assets/images/splash.png")} />
							</View>
						</ClerkLoading>
					</ThemeProvider>
				</ClerkProvider>
			</QueryClientProvider>
		</RootSiblingParent>
=======
		<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<ClerkLoaded>
					<Stack initialRouteName="index" screenOptions={{ statusBarHidden: false, headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="(tabs)" />
						<Stack.Screen name="+not-found" />
					</Stack>
				</ClerkLoaded>
			</ThemeProvider>
		</ClerkProvider>
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	);
}
