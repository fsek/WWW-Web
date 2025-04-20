"use client";

import {
	type BearerResponse,
	type PermissionRead,
	PermissionReadSchema,
	type PermissionsGetAllPermissionsError,
	type PermissionsGetAllPermissionsResponse,
	PermissionsService,
} from "@/api";
import { getAllPermissionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
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

export function usePermissions() {
	const query = useSuspenseQuery({
		...getAllPermissionsOptions(),
	});
	return query.data ?? [];
}
