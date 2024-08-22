import { Redirect, Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@clerk/clerk-expo";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { isSignedIn, isLoaded } = useAuth();

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/" />;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "home" : "home-outline"} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="chatbox"
				options={{
					title: "Chatbox",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "chatbox" : "chatbox-outline"} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="voice"
				options={{
					title: "Voice",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "mic" : "mic-outline"} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="listen"
				options={{
					title: "Listen",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "headset" : "headset-outline"} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="fix"
				options={{
					title: "Fix",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "build" : "build-outline"} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="setting"
				options={{
					title: "Setting",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "person-circle" : "person-circle-outline"}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
