"use client";

import {
	_PostPermissionReadSchema,
	type _UserPostRead,
	type BearerResponse,
	type PermissionRead,
} from "@/api";
import {
	getAllPostsOptions,
	getMeOptions,
} from "@/api/@tanstack/react-query.gen";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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
	const meQuery = useSuspenseQuery({
		...getMeOptions(),
	});
	const postsQuery = useSuspenseQuery({
		...getAllPostsOptions(),
	});
	/*const permissions = useSuspenseQueries({queries: meQuery.data ? meQuery.data.posts.map((post) => {
		return {
			...getAllPostsOptions()
		}
	})})*/
	const posts = useMemo(() => {
		return new Map(
			postsQuery.data.map((post) => [post.id, post.permissions] as const),
		);
	}, [postsQuery.data]);

	const permissions: Map<PermissionRead["target"], PermissionRead["action"]> =
		useMemo(() => {
			return new Map(
				meQuery.data?.posts
					.flatMap(
						(post) =>
							posts.get(post.id)?.map((permission) => {
								const target = <PermissionRead["target"]>permission.target;
								const action = <PermissionRead["action"]>permission.action;
								return [target, action] as const;
							}) ?? [],
					)
					.filter(
						(
							entry,
						): entry is [PermissionRead["target"], PermissionRead["action"]] =>
							entry !== undefined,
					),
			);
		}, [meQuery.data, posts]);
	return permissions ?? [];
}
