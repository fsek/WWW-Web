"use client";

import {
	QueryClient,
	QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { client } from "@/api";
import { getAuthorizationHeader } from "@/lib/auth";

client.setConfig({ baseUrl: "http://localhost:8000" });

const queryClient = new QueryClient();

client.interceptors.request.use((request, _options) => {
	if (typeof window !== "undefined") {
		const authorization = getAuthorizationHeader();

		if (authorization) {
			request.headers.set("Authorization", authorization);
		}
	}
	return request;
});

export default function QueryClientProvider({ children }: PropsWithChildren) {
	return (
		<ReactQueryClientProvider client={queryClient}>
			{children}
		</ReactQueryClientProvider>
	);
}
