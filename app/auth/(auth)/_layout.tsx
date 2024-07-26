import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
<<<<<<< HEAD
		>
			<Tabs.Screen
				name="sign-in"
				options={{
					title: "Sign In",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "home" : "home-outline"} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="sign-up"
				options={{
					title: "Sign Up",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "chatbox" : "chatbox-outline"} color={color} />
					),
				}}
			/>
		</Tabs>
=======
		></Tabs>
>>>>>>> 9a256150bd22767a73cd304fcb166f27e014ec60
	);
}
