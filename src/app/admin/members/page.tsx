"use client";

import type { AdminUserRead, UpdateUserMember } from "@/api";
import {
	adminGetAllUsersOptions,
	adminGetAllUsersQueryKey,
	updateUserStatusMutation,
	updateMultipleUsersStatusMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useAuthState, type RequiredPermission } from "@/lib/auth";
import { action, target } from "@/api";

const columnHelper = createColumnHelper<AdminUserRead>();

export default function MembersPage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const {
		data: userDetails,
		error,
		isLoading,
	} = useQuery({
		...adminGetAllUsersOptions(),
	});
	const permissions = useAuthState().getPermissions();
	const hasManageUserPerms = permissions.hasRequiredPermissions([
		[action.MANAGE, target.USER],
	] as RequiredPermission[]);

	// add search state
	const [search, setSearch] = useState<string>("");

	// checkbox state for filtering verified members only
	const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(false);

	// date range filter state
	const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
	const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

	// compute filtered users
	const filteredUsers = useMemo(() => {
		if (!userDetails) return [];

		// Split search terms by comma and trim whitespace
		const searchTerms = search
			.split(",")
			.map((term) => term.trim().toLowerCase())
			.filter((term) => term.length > 2);

		return userDetails.filter((u) => {
			// Search filter - user must match AT LEAST ONE search term
			const matchesSearch =
				searchTerms.length === 0 ||
				searchTerms.some((term) => {
					return (
						u.first_name.toLowerCase().includes(term) ||
						u.last_name.toLowerCase().includes(term) ||
						`${u.first_name} ${u.last_name}`.toLowerCase().includes(term) ||
						u.email.toLowerCase().includes(term) ||
						String(u.stil_id).toLowerCase().includes(term)
					);
				});

			// Verification filter
			const matchesVerification = !showVerifiedOnly || u.is_verified;

			// Date range filter
			const created = new Date(u.account_created);
			const afterFrom = !dateFrom || created >= dateFrom;
			const beforeTo = !dateTo || created <= dateTo;

			return matchesSearch && matchesVerification && afterFrom && beforeTo;
		});
	}, [userDetails, search, showVerifiedOnly, dateFrom, dateTo]);

	const handleMemberUser = useMutation({
		...updateUserStatusMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
		},
	});

	const handleBulkMemberUsers = useMutation({
		...updateMultipleUsersStatusMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
		},
	});

	const columns = [
		// Do we actually need an id field?
		// columnHelper.accessor("id", {
		// 	header: t("admin:id"),
		// 	cell: (info) => info.getValue(),
		// 	size: 50,
		// }),
		columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
			header: t("admin:name"),
			cell: (info) => info.getValue(),
			size: 150,
		}),
		columnHelper.accessor("email", {
			header: t("admin:email"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("is_verified", {
			header: t("admin:is_verified"),
			cell: (info) => (info.getValue() ? t("admin:yes") : t("admin:no")),
			size: 75,
		}),
		columnHelper.accessor("account_created", {
			header: t("admin:account_created"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					hour: "2-digit",
					minute: "2-digit",
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
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
		columnHelper.accessor("is_member", {
			header: t("admin:is_member"),
			cell: (info) => (info.getValue() ? t("admin:yes") : t("admin:no")),
			size: 75,
		}),
		...(hasManageUserPerms
			? [
					{
						id: "actions",
						header: t("admin:member.actions"),
						cell: ({ row }: { row: Row<AdminUserRead> }) => (
							<Button
								variant={row.original.is_member ? "destructive" : "default"}
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									const updateUser: UpdateUserMember = {
										is_member: !row.original.is_member,
									};
									handleMemberUser.mutate(
										{
											body: updateUser,
											path: { user_id: row.original.id },
										},
										{
											onError: (error) => {
												toast.error(
													t("admin:block.error_unblock") +
														(error?.detail ? `: ${error.detail}` : ""),
												);
											},
										},
									);
								}}
							>
								{row.original.is_member
									? t("admin:member.remove_member")
									: t("admin:member.make_member")}
							</Button>
						),
					},
				]
			: []),
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

	const [dialogOpen, setDialogOpen] = useState(false);
	const [bulkLoading, setBulkLoading] = useState(false);

	const handleBulkMember = () => {
		setBulkLoading(true);
		const toMember = filteredUsers.filter((u) => !u.is_member);
		if (toMember.length === 0) {
			setDialogOpen(false);
			setBulkLoading(false);
			return;
		}

		handleBulkMemberUsers
			.mutateAsync({
				body: toMember.map((u) => ({
					user_id: u.id,
					is_member: true,
				})),
			})
			.then(() => {
				toast.success(t("admin:member.bulk_member_success"));
			})
			.catch((error) => {
				toast.error(
					`${t("admin:member.bulk_member_error")}. ${
						error?.detail ? error.detail : ""
					}`,
				);
				console.error("Bulk member errors:", error);
			})
			.finally(() => {
				setDialogOpen(false);
				setBulkLoading(false);
			});
	};

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
				<h3 className="text-3xl py-3 font-bold text-primary">
					{t("admin:member.list")}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:member.list_description")}
				</p>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center">
					<div className="w-xs">
						<Input
							placeholder={t("admin:member.search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					{/* Date range selector */}
					<div className="flex gap-2 items-center">
						<AdminChooseDates value={dateFrom} onChange={setDateFrom} />
						<span className="text-xs">
							{t("admin:member.date_range_to") || "to"}
						</span>
						<AdminChooseDates value={dateTo} onChange={setDateTo} />
					</div>
				</div>
				{/* Verification filter checkbox */}
				<div className="flex items-center space-x-2 mb-4">
					<Checkbox
						id="verified-only"
						checked={showVerifiedOnly}
						onCheckedChange={() => setShowVerifiedOnly(!showVerifiedOnly)}
					/>
					<Label htmlFor="verified-only" className="text-sm">
						{t("admin:member.show_verified_only")}
					</Label>
				</div>
				<Separator className="mb-8" />
				{/* Bulk member button */}
				{hasManageUserPerms && (
					<Button
						className="my-2"
						variant="default"
						disabled={
							filteredUsers.filter((u) => !u.is_member).length === 0 ||
							bulkLoading
						}
						onClick={() => setDialogOpen(true)}
					>
						{bulkLoading
							? `${t("admin:member.processing")}...`
							: t("admin:member.bulk_member")}
					</Button>
				)}
			</div>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t("admin:member.bulk_member_confirm_title")}
						</DialogTitle>
						<DialogDescription>
							{`${t("admin:member.bulk_member_confirm_desc")}: ${filteredUsers.filter((u) => !u.is_member).length}.`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" disabled={bulkLoading}>
								{t("admin:cancel")}
							</Button>
						</DialogClose>
						{hasManageUserPerms && (
							<Button
								variant="default"
								onClick={handleBulkMember}
								disabled={bulkLoading}
							>
								{bulkLoading
									? t("admin:member.bulk_member_loading")
									: t("admin:member.bulk_member_confirm")}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Separator />
			{/* <AdminTable table={table} onRowClick={handleRowClick} /> */}
			<AdminTable table={table} onRowClick={() => {}} />
		</div>
	);
}
