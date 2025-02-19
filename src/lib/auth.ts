"use client";

import { BearerResponse } from "@/api";
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
