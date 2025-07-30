"use client";

import type { AdminUserRead } from "@/api";
import { adminGetAllUsersOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { AdminChooseMultPosts } from "@/widgets/AdminChooseMultPosts";
import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import UserPostsEditForm from "./UserPostsEditForm";
import { UserPen } from "lucide-react";

const columnHelper = createColumnHelper<AdminUserRead>();

export default function UserPostsPage() {
	const { t, i18n } = useTranslation();
	const {
		data: userDetails,
		error,
		isLoading,
	} = useQuery({
		...adminGetAllUsersOptions(),
	});

	// add search state
	const [search, setSearch] = useState<string>("");

	// post filter state
	const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<AdminUserRead | null>(null);

	// compute filtered users
	const filteredUsers = useMemo(() => {
		if (!userDetails) return [];
		const lower = search.toLowerCase();
		return userDetails.filter((u) => {
			const matchesSearch =
				u.first_name.toLowerCase().includes(lower) ||
				u.last_name.toLowerCase().includes(lower) ||
				u.email.toLowerCase().includes(lower) ||
				String(u.stil_id).toLowerCase().includes(lower) ||
				String(u.id).toLowerCase().includes(lower);

			let matchesPosts = true;
			// If no posts selected, don't filter by posts
			if (selectedPosts.length !== 0) {
				matchesPosts = u.posts.some((post) => selectedPosts.includes(post.id));
			} else {
				matchesPosts = true;
			}

			return matchesSearch && matchesPosts;
		});
	}, [userDetails, search, selectedPosts]);

	const handleRowClick = (row: Row<AdminUserRead>) => {
		setSelectedUser(row.original);
		setEditFormOpen(true);
	};

	const columns = [
		columnHelper.accessor("id", {
			header: t("admin:id"),
			cell: (info) => info.getValue(),
			size: 50,
		}),
		columnHelper.accessor("first_name", {
			header: t("admin:first_name"),
			cell: (info) => info.getValue(),
			size: 150,
		}),
		columnHelper.accessor("last_name", {
			header: t("admin:last_name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("email", {
			header: t("admin:email"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("stil_id", {
			header: t("admin:stil_id"),
			cell: (info) => info.getValue(),
			size: 100,
		}),
		columnHelper.accessor("program", {
			header: t("admin:program"),
			cell: (info) => info.getValue(),
			size: 75,
		}),
		columnHelper.accessor("start_year", {
			header: t("admin:start_year"),
			cell: (info) => info.getValue(),
			size: 75,
		}),
		columnHelper.accessor("posts", {
			header: t("admin:user-posts.table_header"),
			cell: (info) => {
				const posts = info.getValue() as
					| { name_sv?: string; name_en?: string }[]
					| undefined;
				if (!posts || posts.length === 0) return t("admin:no_posts");
				const lang = i18n.language;
				return posts
					.map((post) =>
						lang === "sv"
							? post.name_sv || post.name_en || "-"
							: post.name_en || post.name_sv || "-",
					)
					.join(", ");
			},
			size: 200,
		}),
		{
			id: "actions",
			header: t("admin:user-posts.actions"),
			cell: ({ row }: { row: Row<AdminUserRead> }) => (
				<Button
					variant="default"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						setSelectedUser(row.original);
						setEditFormOpen(true);
					}}
				>
					<UserPen />
					{t("admin:user-posts.manage")}
				</Button>
			),
		},
	];

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns: columns,
		data: filteredUsers, // use filtered list
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	// only bail out on the very first load
	if (isLoading) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}
	return (
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:user-posts.list")}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:user-posts.list_description")}
				</p>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center flex-wrap">
					<div className="w-xs">
						<Input
							placeholder={
								t("admin:user-posts.search_placeholder") ||
								"Search by name, email, or STIL ID"
							}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
				</div>
				<div className="my-2 w-full max-w-md">
					<span className="block text-sm font-medium mb-1">
						{t("admin:user-posts.filter_by_position")}
					</span>
					<AdminChooseMultPosts
						value={selectedPosts}
						onChange={setSelectedPosts}
						className="w-full"
					/>
				</div>
				<Separator className="mb-8" />
			</div>

			<Separator />
			<AdminTable table={table} onRowClick={handleRowClick} />
			{selectedUser && (
				<UserPostsEditForm
					open={editFormOpen}
					onClose={() => {
						setEditFormOpen(false);
						setSelectedUser(null);
					}}
					selectedUser={selectedUser}
				/>
			)}
		</div>
	);
}
