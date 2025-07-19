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
// The interceptor attaches the current valid token to outgoing requests
// and refreshes the token if necessary, therefore saving the outgoing message from 401 Unauthorized.
client.interceptors.request.use(async (request, _options) => {
	if (typeof window !== "undefined") {
		const auth = useAuthState.getState();
		const authorizationHeader = auth.authorizationHeader();
		if (authorizationHeader) {
			request.headers.set("Authorization", authorizationHeader);
		} else if (!request.url.startsWith(`${API_BASE_URL}/auth`)) {
			// If no valid token is present, attempt to refresh the token
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
