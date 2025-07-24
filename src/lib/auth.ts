"use client";

import type { BearerResponse, PermissionRead } from "@/api";
import { create } from "zustand";

type Action = PermissionRead["action"];
type Target = PermissionRead["target"];
type RequiredPermission = [Action, Target];
class PermissionMap extends Map<Target, Set<Action>> {
	hasRequiredPermissions(required: RequiredPermission[]): boolean {
		for (const [action, target] of required) {
			const actions = this.get(target);
			if (!actions || !actions.has(action)) {
				return false;
			}
		}
		return true;
	}
}

type AuthState = {
	accessToken: BearerResponse | null;
	setAccessToken: (data: BearerResponse) => void;
	authorizationHeader: () => string | null;
	isAuthenticated: () => boolean;
	getPermissions: () => PermissionMap;
};

export const useAuthState = create<AuthState>((set, get) => {
	let permissionMap = new PermissionMap();

	function buildPermissionMap(token: BearerResponse | null): PermissionMap {
		const map = new PermissionMap();
		if (token) {
			try {
				const payload = JSON.parse(
					Buffer.from(token.access_token.split(".")[1], "base64").toString(),
				) as { permissions: string[] };

				for (const entry of payload.permissions) {
					const parts = entry.split(":");
					if (parts.length !== 2) continue;

					const [action, target] = parts as [Action, Target];

					if (!map.has(target)) {
						map.set(target, new Set<Action>());
					}
					// biome-ignore lint/style/noNonNullAssertion: We just created it if it didnt exist.
					map.get(target)!.add(action);
				}
			} catch {
				return map;
			}
		}
		return map;
	}

	function updatePermissions(token: BearerResponse | null) {
		permissionMap = buildPermissionMap(token);
	}

	return {
		accessToken: null,
		setAccessToken(data) {
			set((state) => {
				if (state.accessToken?.access_token === data.access_token) {
					return { accessToken: data };
				}
				updatePermissions(data);
				return { accessToken: data };
			});
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
		getPermissions() {
			return permissionMap;
		},
	};
});
