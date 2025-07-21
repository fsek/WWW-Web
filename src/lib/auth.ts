"use client";

import type { BearerResponse } from "@/api";
import { create } from "zustand";

type AuthState = {
	accessToken: BearerResponse | null;
	setAccessToken: (data: BearerResponse) => void;
	authorizationHeader: () => string | null;
	isAuthenticated: () => boolean;
};

export const useAuthState = create<AuthState>((set, get) => ({
	accessToken: null,
	setAccessToken: (data: BearerResponse) => {
		set({ accessToken: data });
	},
	authorizationHeader() {
		const accessToken = get().accessToken;
		if (accessToken) {
			// We convert exp to milliseconds manually to be more explicit
			// Date.now() is in milliseconds, exp is in seconds
			const payload = JSON.parse(
				Buffer.from(
					accessToken.access_token.split(".")[1],
					"base64",
				).toString(),
			);
			const expiryMilliseconds = payload.exp * 1000 - 2 * 1000; // Two second margin

			if (expiryMilliseconds < Date.now()) {
				// The token has expired. Return null.
				return null;
			}
			return `${accessToken.token_type} ${accessToken.access_token}`;
		}
		return null; // No token available
	},
	isAuthenticated() {
		return !!get().authorizationHeader();
	},
}));
