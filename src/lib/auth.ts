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
			const exp = new Date().setUTCSeconds(
				JSON.parse(
					Buffer.from(
						accessToken.access_token.split(".")[1],
						"base64",
					).toString(),
				).exp,
			);
			if (exp < Date.now()) {
				return null; // Token has expired
			}
			return `${accessToken.token_type} ${accessToken.access_token}`;
		}
		return null; // No token available
	},
	isAuthenticated() {
		return !!get().accessToken;
	},
}));
