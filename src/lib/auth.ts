"use client";

import {
	type BearerResponse,
	type PermissionRead,
	PermissionReadSchema,
	type PermissionsGetAllPermissionsResponse,
	PermissionsService,
} from "@/api";
import { getAllPermissionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function handleBearerResponse(data: BearerResponse) {
	localStorage.setItem(
		"authorization",
		`${data.token_type} ${data.access_token}`,
	);
}

export function getAuthorizationHeader() {
	return localStorage.getItem("authorization");
}

export function useAuthState() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

	useEffect(() => {
		setIsAuthenticated(!!getAuthorizationHeader());
	}, []);

	return isAuthenticated;
}

export type Permissions = Record<
	PermissionRead["target"],
	PermissionRead["action"]
>;

export function usePermissions() {
	const [permissions, setPermissions] = useState<Permissions>();
	const permissionsQuery = useQuery({
		...getAllPermissionsOptions(),
		enabled: !!getAuthorizationHeader(),
	});
	useEffect(() => {
		if (permissionsQuery.isSuccess) {
			const recievedPermissions = permissionsQuery.data;
			setPermissions(
				recievedPermissions.reduce((acc, permission) => {
					acc[permission.target] = permission.action;
					return acc;
				}, {} as Permissions),
			);
		}
	}, [permissionsQuery.isSuccess, permissionsQuery.data]);
	return permissions;
}
