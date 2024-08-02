import { Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@clerk/clerk-expo";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { isSignedIn } = useAuth();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="main"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "home" : "home-outline"} color={color} />
					),
				}}
			/>

			{isSignedIn && (
				<Tabs.Screen
					name="chatbox"
					options={{
						title: "Chatbox",
						tabBarIcon: ({ color, focused }) => (
							<TabBarIcon name={focused ? "chatbox" : "chatbox-outline"} color={color} />
						),
					}}
				/>
			)}
			{isSignedIn && (
				<Tabs.Screen
					name="voice"
					options={{
						title: "Voice",
						tabBarIcon: ({ color, focused }) => (
							<TabBarIcon name={focused ? "mic" : "mic-outline"} color={color} />
						),
					}}
				/>
			)}

			{isSignedIn && (
				<Tabs.Screen
					name="setting"
					options={{
						title: "Setting",
						tabBarIcon: ({ color, focused }) => (
							<TabBarIcon name={focused ? "settings" : "settings-outline"} color={color} />
						),
					}}
				/>
			)}
		</Tabs>
	);
}
