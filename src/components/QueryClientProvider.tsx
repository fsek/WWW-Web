"use client";

import {
	QueryClient,
	QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { client } from "@/api";
import { useAuthState } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

client.setConfig({ baseUrl: API_BASE_URL });

const queryClient = new QueryClient();

client.interceptors.request.use(async (request, _options) => {
	if (typeof window !== "undefined") {
		const auth = useAuthState.getState();
		const authorizationHeader = auth.authorizationHeader();
		if (request.url.startsWith(`${API_BASE_URL}/auth`)) {
			_options.credentials = "include"; // Ensure cookies are sent with auth requests.
			// Doesn't seem to do anything :(
		}
		if (authorizationHeader) {
			request.headers.set("Authorization", authorizationHeader);
		} else if (!request.url.startsWith(`${API_BASE_URL}/auth`)) {
			const refreshTokenRequest = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: "POST",
				credentials: "include",
			});
			if (refreshTokenRequest.ok) {
				const data = await refreshTokenRequest.json();
				auth.setAccessToken(data);
				request.headers.set("Authorization", auth.authorizationHeader() || "");
			}
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
