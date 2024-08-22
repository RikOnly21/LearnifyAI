import { api } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

import { useQuery } from "@tanstack/react-query";

import { useGlobalSearchParams, useRouter } from "expo-router";

import React, { useMemo } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type User = {
	subject: string;
	difficulty: string;
	startAt: Date;
	endAt: Date;
	duration: number;
	points: number;
};

type Response = {
	data: {
		duration: number;
		points: number;
		User: { name: string | null; imageUrl: string; userId?: string };
	}[];
	user: User | null;
};

const App = () => {
	const { user } = useUser();
	const router = useRouter();
	const { subject } = useGlobalSearchParams();

	const query = useQuery({
		queryKey: ["leaderboard", subject, "easy"],
		queryFn: async () => {
			const res = await api.get<Response>(`/api/user/leaderboard/${subject}/easy`, {
				headers: { "clerk-user-id": user!.id },
			});

			return res.data;
		},
	});

	if (query.isError) {
		return (
			<View className="flex h-full items-center justify-center bg-white">
				<Text className="text-xl">{query.error.message}</Text>
			</View>
		);
	}

	return (
		<SafeAreaView className="h-full flex-1 gap-2 bg-white">
			<View className="flex w-full flex-row items-center justify-between p-4">
				{router.canGoBack() && (
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={24} color="black" />
					</TouchableOpacity>
				)}

				<Text className="text-xl font-bold">Bảng xếp hạng - Easy</Text>
				<View />
			</View>

			{query.isLoading && (
				<View className="flex flex-1 items-center justify-center">
					<Text className="">Đang tải...</Text>
				</View>
			)}

			{query.isSuccess && (
				<View className="flex-1 gap-6">
					<TopThree data={query.data.data} />

					<View className="flex flex-row px-4">
						{query.data.data.slice(3).map((item, index) => (
							<View className="w-full flex-row items-center justify-between rounded-lg bg-gray-400 px-4 py-4">
								<View className="flex-row items-center gap-3">
									<Text className="text-4xl underline">{index + 4}</Text>

									<Image
										source={{ uri: item.User.imageUrl }}
										className="size-12 rounded-full"
									/>
									<Text className="text-lg text-white">{item.User.name}</Text>
								</View>

								<Text className="text-white">
									{item.points} - {item.duration / 1000}s
								</Text>
							</View>
						))}
					</View>

					{query.data.user && (
						<View className="mt-auto px-4 pb-4">
							<View
								className="w-full flex-row items-center justify-between rounded-lg px-4 py-4"
								style={{
									backgroundColor: getPodiumData(
										query.data.data.findIndex(
											(item) => item.User.userId === user!.id,
										) + 1,
									).bgColor,
								}}
							>
								<View className="flex-row items-center gap-3">
									<Text className="text-4xl underline">
										{query.data.data.findIndex(
											(item) => item.User.userId === user!.id,
										) + 1}
									</Text>

									<Image
										source={{ uri: user!.imageUrl }}
										className="size-12 rounded-full"
									/>
									<Text className="text-lg text-white">{user!.username}</Text>
								</View>

								<Text className="text-white">
									{query.data.user.points} - {query.data.user.duration / 1000}s
								</Text>
							</View>
						</View>
					)}
				</View>
			)}
		</SafeAreaView>
	);
};

const TopThree = ({ data }: { data: Response["data"] }) => {
	return (
		<View className="flex-row justify-evenly gap-4 px-6">
			<View className="flex-1 justify-end">
				{data.length >= 3 && <Rank data={data} rank={3} />}
			</View>

			<View className="flex-1 justify-end">
				{data.length >= 1 && <Rank data={data} rank={1} />}
			</View>

			<View className="flex-1 justify-end">
				{data.length >= 2 && <Rank data={data} rank={2} />}
			</View>
		</View>
	);
};

const Rank = ({ rank, data }: { rank: number; data: Response["data"] }) => {
	const { bgColor, padding } = useMemo(() => getPodiumData(rank), []);

	return (
		<View
			className={"items-center justify-end rounded-lg px-4 py-2"}
			style={{ backgroundColor: bgColor, paddingTop: padding }}
		>
			<Image source={{ uri: data[rank - 1].User.imageUrl }} style={styles.largeAvatar} />

			<Text className="text-lg font-bold capitalize">{data[rank - 1].User.name}</Text>
			<Text className="text-white">
				{data[rank - 1].points} - {data[rank - 1].duration / 1000}s
			</Text>
		</View>
	);
};

const getPodiumData = (rank: number) => {
	switch (rank) {
		case 1:
			return { bgColor: "#FFD700", padding: 100 };
		case 2:
			return { bgColor: "#C0C0C0", padding: 50 };
		case 3:
			return { bgColor: "#CD7F32", padding: 10 };
		default:
			return { bgColor: "#9ca3af", padding: 0 };
	}
};

const styles = StyleSheet.create({
	topThreeRankStyle: {
		fontSize: 24,
		color: "white",
		fontWeight: "bold",
		marginBottom: 8,
	},
	regularUserContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		padding: 10,
		marginVertical: 2,
	},

	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	largeAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
	},
	infoContainer: {
		flex: 1,
	},
	username: {
		fontSize: 16,
		fontWeight: "bold",
	},
	score: {
		fontSize: 14,
		color: "#888",
	},
	time: {
		fontSize: 12,
		color: "#666",
	},
});

export default App;
