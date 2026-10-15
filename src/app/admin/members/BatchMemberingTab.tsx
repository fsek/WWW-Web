"use client";

import type { AdminUserRead, UpdateUserMember, PreregMemberRead } from "@/api";
import {
	adminGetAllUsersOptions,
	adminGetAllUsersQueryKey,
	getAllPreregMemberInfoOptions,
	updateMultipleUsersStatusMutation,
	updateUserStatusMutation,
	deleteMultiplePreregMembersMutation,
} from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionEnum, TargetEnum } from "@/api";
import { useAuthState, type RequiredPermission } from "@/lib/auth";
import AdminTable from "@/widgets/AdminTable";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import normalizePartialPhoneNumber from "@/help_functions/normalizePartialPhoneNumber";
import normalizePhoneNumber from "@/help_functions/normalizePhoneNumber";
import Markdown from "react-markdown";

const columnHelper = createColumnHelper<AdminUserRead>();

function normalize(value?: string | null) {
	return value?.trim().toLowerCase() ?? "";
}

export default function BatchMemberingTab() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const permissions = useAuthState().getPermissions();
	const hasManageUserPerms = permissions.hasRequiredPermissions([
		[ActionEnum.MANAGE, TargetEnum.USER],
	] as RequiredPermission[]);
	const [search, setSearch] = useState<string>("");
	const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(true);

	const {
		data: userDetails,
		error: userError,
		isLoading: usersLoading,
	} = useQuery({
		...adminGetAllUsersOptions(),
		refetchOnWindowFocus: false,
	});

	const {
		data: preregMembers,
		error: preregError,
		isLoading: preregLoading,
	} = useQuery({
		...getAllPreregMemberInfoOptions(),
		refetchOnWindowFocus: false,
	});

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

	const handleDeletePreregMembers = useMutation({
		...deleteMultiplePreregMembersMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllPreregMemberInfoOptions().queryKey,
			});
			toast.success(t("admin:member.prereg_deleted_success"));
		},
		onError: () => {
			toast.error(t("admin:member.prereg_deleted_error"));
		},
	});

	const filteredUsers = useMemo(() => {
		if (!userDetails) return [];

		const searchTerms = search
			.split(",")
			.map((term) => term.trim().toLowerCase())
			.filter((term) => term.length > 2);

		return userDetails.filter((u) => {
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

			const matchesVerification = !showVerifiedOnly || u.is_verified;
			const normalizedUserPhone = normalizePhoneNumber(u.telephone_number);
			const notMember = !u.is_member;
			let matchesAnyPrereg = false;
			for (const member of (preregMembers as PreregMemberRead[] | undefined) ??
				[]) {
				const matchesPrereg =
					(normalize(member.email) === "" ||
						normalize(member.email) === null ||
						normalize(member.email) === undefined ||
						normalize(member.email) === normalize(u.email)) &&
					(normalize(member.stil_id) === "" ||
						normalize(member.stil_id) === null ||
						normalize(member.stil_id) === undefined ||
						normalize(member.stil_id) === normalize(u.stil_id)) &&
					(normalizePhoneNumber(member.telephone_number ?? null) === "" ||
						normalizePhoneNumber(member.telephone_number ?? null) === null ||
						normalizePhoneNumber(member.telephone_number ?? null) ===
							undefined ||
						normalizePhoneNumber(member.telephone_number ?? null) ===
							normalizedUserPhone);
				if (matchesPrereg) {
					matchesAnyPrereg = true;
					break;
				}
			}

			return (
				matchesSearch && matchesVerification && matchesAnyPrereg && notMember
			);
		});
	}, [userDetails, search, showVerifiedOnly, preregMembers]);

	const columns = [
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
			cell: (info) => info.getValue() || "-",
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
											onError: (mutationError) => {
												toast.error(
													t("admin:member.error_member_status") +
														(mutationError?.detail
															? `: ${mutationError.detail}`
															: ""),
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
		columns,
		data: filteredUsers,
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

	const handlePrunePreregMembers = () => {
		// Ran after handleBulkMember, to remove any preregistered members that are now members
		// We assume no errors occurred when running handleBulkMember
		if (!preregMembers) return;
		const madeMembers = filteredUsers.filter((u) => !u.is_member);
		const preregMembersList = (preregMembers as PreregMemberRead[]) ?? [];
		const preregIdsToDelete = new Set<number>();
		for (const u of madeMembers) {
			const normalizedUserPhone = normalizePhoneNumber(u.telephone_number);
			const normalizedUserEmail = normalize(u.email);
			const normalizedUserStilId = normalize(u.stil_id);
			for (const member of preregMembersList) {
				const normalizedMemberPhone = normalizePhoneNumber(
					member.telephone_number ?? null,
				);
				const normalizedMemberEmail = normalize(member.email);
				const normalizedMemberStilId = normalize(member.stil_id);
				const phoneMatches =
					!normalizedMemberPhone ||
					normalizedMemberPhone.length === 0 ||
					normalizedMemberPhone === normalizedUserPhone;
				const emailMatches =
					!normalizedMemberEmail ||
					normalizedMemberEmail.length === 0 ||
					normalizedMemberEmail === normalizedUserEmail;
				const stilIdMatches =
					!normalizedMemberStilId ||
					normalizedMemberStilId.length === 0 ||
					normalizedMemberStilId === normalizedUserStilId;
				if (
					phoneMatches &&
					emailMatches &&
					stilIdMatches &&
					!u.is_member &&
					member.prereg_member_id
				) {
					preregIdsToDelete.add(member.prereg_member_id);
				}
			}
		}
		if (preregIdsToDelete.size === 0) return;
		handleDeletePreregMembers.mutate({
			body: Array.from(preregIdsToDelete),
		});
	};

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
				handlePrunePreregMembers();
			})
			.catch((mutationError) => {
				toast.error(
					`${t("admin:member.bulk_member_error")}. ${
						mutationError?.detail ? mutationError.detail : ""
					}`,
				);
			})
			.finally(() => {
				setDialogOpen(false);
				setBulkLoading(false);
			});
	};

	if (usersLoading || preregLoading) {
		return <LoadingErrorCard />;
	}

	if (userError) {
		return <LoadingErrorCard error={userError} />;
	}

	if (preregError) {
		return <LoadingErrorCard error={preregError} />;
	}

	return (
		<div className="">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 font-bold text-primary">
					{t("admin:member.batch_membering_title")}
				</h3>
				<div className="text-xs md:text-sm font-medium prose prose-sm dark:prose-invert w-full max-w-5xl">
					<Markdown>{t("admin:member.batch_membering_description")}</Markdown>
				</div>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center">
					<div className="w-xs">
						<Input
							placeholder={t("admin:member.search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
				</div>
				<div className="flex items-center space-x-2 mb-4">
					<Checkbox
						id="verified-only-batch"
						checked={showVerifiedOnly}
						onCheckedChange={() => setShowVerifiedOnly(!showVerifiedOnly)}
						disabled={true}
					/>
					<Label htmlFor="verified-only-batch" className="text-sm">
						{t("admin:member.show_verified_only")}
					</Label>
				</div>
				<Separator className="mb-8" />
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
						<Button
							variant="outline"
							disabled={bulkLoading}
							onClick={() => setDialogOpen(false)}
						>
							{t("admin:cancel")}
						</Button>
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
			<AdminTable table={table} />
		</div>
	);
}
