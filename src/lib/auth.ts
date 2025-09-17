"use client";

import type { BearerResponse } from "@/api";
import type { action, target } from "@/api";
import { create } from "zustand";

export type RequiredPermission = [action, target];
class PermissionMap extends Map<target, Set<action>> {
	/**
	 * Checks a users permission against a list of required permissions.
	 *
	 * @param requiredPermissions - list of [{@link action | action}, {@link target | target}] from `@/api`
	 *
	 * @example
	 * Checking that a user has `view` permission for `CAR` and `manage` permission for `USER`
	 * ```ts
	 * import type { action, target } from "@/api";
	 * import { useAuthState } from "@/lib/auth";
	 * const auth = useAuthState();
	 * const permissions = auth.getPermissions();
	 * const isAllowed = permissions.hasRequiredPermissions([[action.view, target.CAR], [action.manage, target.USER]]);
	 * ```
	 */
	hasRequiredPermissions(requiredPermissions: RequiredPermission[]): boolean {
		for (const [action, target] of requiredPermissions) {
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
		if (!token) return map;
		try {
			const payload = JSON.parse(
				Buffer.from(token.access_token.split(".")[1], "base64").toString(),
			) as { permissions: string[] };

			for (const entry of payload.permissions) {
				const parts = entry.split(":");
				if (parts.length !== 2) continue;

				const [actionStr, targetStr] = parts;

				const actionEnum = actionStr as action;
				const targetEnum = targetStr as target;

				if (!actionEnum || !targetEnum) continue;

				if (!map.has(targetEnum)) {
					map.set(targetEnum, new Set<action>());
				}
				// biome-ignore lint/style/noNonNullAssertion: Just checked that it exists
				map.get(targetEnum)!.add(actionEnum);
			}
		} catch {
			// If decoding or parsing fails, just return an empty map
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
