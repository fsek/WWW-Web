"use client";

import {
	getAllPermissionsOptions,
	getAllPostsOptions,
} from "@/api/@tanstack/react-query.gen";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	createColumnHelper,
} from "@tanstack/react-table";
import { useState } from "react";

import type { PermissionRead, PostRead } from "../../../api";
import AdminPage from "@/widgets/AdminPage";
import { Input } from "@/components/ui/input";
import PermissionForm from "./PermissionForm";
import PermissionEditForm from "./PermissionEditForm";
import { useTranslation } from "react-i18next";

export type PermissionWithPosts = PermissionRead & { posts: PostRead[] };

// Column setup
const columnHelper = createColumnHelper<PermissionWithPosts>();

export default function Permissions() {
	const { t, i18n } = useTranslation("admin");

	const postName = (post: PostRead) =>
		i18n.language === "en" ? post.name_en : post.name_sv;

	// biome-ignore lint/suspicious: <explanation>
	const columns: ColumnDef<PermissionWithPosts, any>[] = [
		columnHelper.accessor("target", {
			header: t("permissions.target"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("action", {
			header: t("permissions.action"),
			cell: (info) => info.getValue(),
		}),
		// Reverse lookup: which posts have this permission. The value is the
		// joined post names so the posts filter can match on a post name.
		columnHelper.accessor((row) => row.posts.map(postName).join(", "), {
			id: "posts",
			header: t("permissions.posts", "Posts"),
			cell: (info) => (
				<span title={info.getValue()}>
					{info.row.original.posts.length > 0
						? `(${info.row.original.posts.length}) ${info.getValue()}`
						: "-"}
				</span>
			),
		}),
	];

	// One filter per column; all active filters apply at the same time.
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const filterValue = (id: string) =>
		(columnFilters.find((f) => f.id === id)?.value as string) ?? "";

	function setFilter(id: string, value: string) {
		setColumnFilters((old) => {
			const otherFilters = old.filter((f) => f.id !== id);
			if (!value) return otherFilters;
			return [...otherFilters, { id, value }];
		});
	}

	const permissionsQuery = useQuery({
		...getAllPermissionsOptions(),
	});
	const postsQuery = useQuery({
		...getAllPostsOptions(),
	});

	const posts = postsQuery.data ?? [];
	const data: PermissionWithPosts[] | undefined = permissionsQuery.data?.map(
		(permission) => ({
			...permission,
			posts: posts.filter((post) =>
				post.permissions.some(
					(p) =>
						p.action === permission.action && p.target === permission.target,
				),
			),
		}),
	);

	return (
		<AdminPage
			title={t("permissions.title", "Permissions")}
			description={t("permissions.description")}
			queryResult={
				{
					...permissionsQuery,
					data,
					isPending: permissionsQuery.isPending || postsQuery.isPending,
					error: permissionsQuery.error ?? postsQuery.error,
				} as UseQueryResult<PermissionWithPosts[]>
			}
			columns={columns}
			editComponent={PermissionEditForm}
			hideGlobalSearch
			columnFilters={columnFilters}
			onColumnFiltersChange={setColumnFilters}
			headerButtons={
				<>
					<div className="flex flex-wrap gap-2 mr-auto">
						<Input
							className="w-56"
							placeholder={t("permissions.search_target", "Search target...")}
							value={filterValue("target")}
							onChange={(e) => setFilter("target", e.target.value)}
						/>
						<Input
							className="w-56"
							placeholder={t("permissions.search_action", "Search action...")}
							value={filterValue("action")}
							onChange={(e) => setFilter("action", e.target.value)}
						/>
						<Input
							className="w-56"
							placeholder={t("permissions.search_posts", "Search post...")}
							value={filterValue("posts")}
							onChange={(e) => setFilter("posts", e.target.value)}
						/>
					</div>
					<PermissionForm />
				</>
			}
		/>
	);
}
