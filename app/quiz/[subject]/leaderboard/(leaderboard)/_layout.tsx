import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@clerk/clerk-expo";

import { useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

export default function Layout() {
	const colorScheme = useColorScheme();
	const { isSignedIn } = useAuth();

	if (!isSignedIn) return <Redirect href="main" />;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="easy"
				options={{
					title: "Easy",
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="podium-bronze" size={24} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="hard"
				options={{
					title: "Hard",
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="podium-gold" size={24} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="medium"
				options={{
					title: "Medium",
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="podium-silver" size={24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
