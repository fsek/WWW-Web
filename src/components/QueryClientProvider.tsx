"use client";

import {
	QueryClient,
	QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { AuthService, client } from "@/api";

client.setConfig({ baseUrl: "http://localhost:8000" });

const queryClient = new QueryClient();

const token = await AuthService.authJwtLogin({
	body: { username: "boss@fsektionen.se", password: "dabdab" },
});

const myHeaders = new Headers();

myHeaders.append(
	"Authorization",
	`${token.data?.token_type} ${token.data?.access_token}`,
);

client.setConfig({ headers: myHeaders });

export default function QueryClientProvider({ children }: PropsWithChildren) {
	return (
		<ReactQueryClientProvider client={queryClient}>
			{children}
		</ReactQueryClientProvider>
	);
}
