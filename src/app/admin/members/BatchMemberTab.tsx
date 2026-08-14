"use client";

import type {
	PreregMemberCreate,
	PreregMemberRead,
	PreregMemberUpdate,
} from "@/api";
import {
	createPreregMemberMutation,
	deletePreregMemberMutation,
	getAllPreregMemberInfoOptions,
	getAllPreregMemberInfoQueryKey,
	updatePreregMemberMutation,
	createMultiplePreregMembersMutation,
} from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import normalizePartialPhoneNumber from "@/help_functions/normalizePartialPhoneNumber";
import normalizePhoneNumber from "@/help_functions/normalizePhoneNumber";
import AdminTable from "@/widgets/AdminTable";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Markdown from "react-markdown";
import handleBatchAdd from "./handleBatchAdd";
import type { BatchAddResult } from "./handleBatchAdd";

const columnHelper = createColumnHelper<PreregMemberRead>();

function toNullable(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export default function BatchMemberTab() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const permissions = useAuthState().getPermissions();
	const hasManagePreregMemberPerms = permissions.hasRequiredPermissions([
		[ActionEnum.MANAGE, TargetEnum.USER],
	] as RequiredPermission[]);
	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [batchDialogOpen, setBatchDialogOpen] = useState(false);
	const [editingMember, setEditingMember] = useState<PreregMemberRead | null>(
		null,
	);
	const [formValues, setFormValues] = useState({
		email: "",
		stil_id: "",
		telephone_number: "",
	});
	const [batchInput, setBatchInput] = useState("");

	const {
		data: preregMembers,
		error,
		isLoading,
	} = useQuery({
		...getAllPreregMemberInfoOptions(),
		refetchOnWindowFocus: false,
	});

	const createMutation = useMutation({
		...createPreregMemberMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllPreregMemberInfoQueryKey(),
			});
			setDialogOpen(false);
			toast.success(t("admin:member.prereg_saved"));
		},
	});

	const createBatchMutation = useMutation({
		...createMultiplePreregMembersMutation(),
		throwOnError: false,
		onSuccess: (result) => {
			queryClient.invalidateQueries({
				queryKey: getAllPreregMemberInfoQueryKey(),
			});
			setBatchDialogOpen(false);
			setBatchInput("");
			toast.success(
				t("admin:member.multi_prereg_saved", { collideCount: result.length }),
			);
		},
		onError: (mutationError) => {
			toast.error(
				t("admin:member.prereg_save_error") +
					(mutationError?.detail ? `: ${mutationError.detail}` : ""),
			);
		},
	});

	const updateMutation = useMutation({
		...updatePreregMemberMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllPreregMemberInfoQueryKey(),
			});
			setDialogOpen(false);
			toast.success(t("admin:member.prereg_saved"));
		},
	});

	const deleteMutation = useMutation({
		...deletePreregMemberMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllPreregMemberInfoQueryKey(),
			});
			toast.success(t("admin:member.prereg_deleted"));
		},
	});

	const filteredMembers = useMemo(() => {
		if (!preregMembers) {
			return [];
		}

		const terms = search
			.split(",")
			.map((term) => term.trim().toLowerCase())
			.filter((term) => term.length > 0);

		return preregMembers.filter((member) => {
			if (terms.length === 0) {
				return true;
			}

			const email = member.email?.toLowerCase() ?? "";
			const stilId = member.stil_id?.toLowerCase() ?? "";
			const telephone = normalizePhoneNumber(
				member.telephone_number?.toLowerCase() ?? "",
			);

			return terms.some((term) => {
				if (
					!telephone ||
					telephone.length === 0 ||
					!normalizePartialPhoneNumber(term)
				) {
					return email.includes(term) || stilId.includes(term);
				}
				return (
					email.includes(term) ||
					stilId.includes(term) ||
					telephone.includes(normalizePartialPhoneNumber(term) ?? "")
				);
			});
		});
	}, [preregMembers, search]);

	const columns = [
		columnHelper.accessor((row) => row.email ?? "", {
			id: "email",
			header: t("admin:email"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor((row) => row.stil_id ?? "", {
			id: "stil_id",
			header: t("admin:stil_id"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor((row) => row.telephone_number ?? "", {
			id: "telephone_number",
			header: t("admin:telephone_number"),
			cell: (info) => {
				if (!info.getValue()) {
					return "-";
				}
				const parsedPhoneNumber = parsePhoneNumberFromString(info.getValue());
				if (!parsedPhoneNumber) {
					return info.getValue();
				}
				return parsedPhoneNumber.number;
			},
		}),
		...(hasManagePreregMemberPerms
			? [
					{
						id: "actions",
						header: t("admin:member.actions"),
						cell: ({ row }: { row: Row<PreregMemberRead> }) => (
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										setEditingMember(row.original);
										setFormValues({
											email: row.original.email ?? "",
											stil_id: row.original.stil_id ?? "",
											telephone_number: row.original.telephone_number ?? "",
										});
										setDialogOpen(true);
									}}
								>
									{t("admin:edit")}
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										deleteMutation.mutate(
											{
												path: {
													prereg_member_id: row.original.prereg_member_id,
												},
											},
											{
												onError: (mutationError) => {
													toast.error(
														t("admin:member.prereg_delete_error") +
															(mutationError?.detail
																? `: ${mutationError.detail}`
																: ""),
													);
												},
											},
										);
									}}
								>
									{t("admin:delete")}
								</Button>
							</div>
						),
					},
				]
			: []),
	];

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data: filteredMembers,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	function openCreateDialog() {
		setEditingMember(null);
		setFormValues({
			email: "",
			stil_id: "",
			telephone_number: "",
		});
		setDialogOpen(true);
	}

	function openEditDialog(member: PreregMemberRead) {
		setEditingMember(member);
		setFormValues({
			email: member.email ?? "",
			stil_id: member.stil_id ?? "",
			telephone_number: member.telephone_number ?? "",
		});
		setDialogOpen(true);
	}

	function closeDialog() {
		setDialogOpen(false);
		setEditingMember(null);
		setFormValues({
			email: "",
			stil_id: "",
			telephone_number: "",
		});
	}

	function handleSave() {
		const payload: PreregMemberCreate = {
			email: toNullable(formValues.email),
			stil_id: toNullable(formValues.stil_id),
			telephone_number: toNullable(formValues.telephone_number),
		};

		if (editingMember) {
			updateMutation.mutate(
				{
					path: {
						prereg_member_id: editingMember.prereg_member_id,
					},
					body: payload as PreregMemberUpdate,
				},
				{
					onError: (mutationError) => {
						toast.error(
							t("admin:member.prereg_save_error") +
								(mutationError?.detail ? `: ${mutationError.detail}` : ""),
						);
					},
				},
			);
			return;
		}

		createMutation.mutate(
			{ body: payload },
			{
				onError: (mutationError) => {
					toast.error(
						t("admin:member.prereg_save_error") +
							(mutationError?.detail ? `: ${mutationError.detail}` : ""),
					);
				},
			},
		);
	}

	if (isLoading) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 font-bold text-primary">
					{t("admin:member.prereg_title")}
				</h3>
				<div className="text-xs md:text-sm font-medium prose prose-sm dark:prose-invert w-full max-w-5xl">
					<Markdown>{t("admin:member.prereg_description")}</Markdown>
				</div>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center">
					<div className="w-xs">
						<Input
							placeholder={t("admin:member.prereg_search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					{hasManagePreregMemberPerms && (
						<>
							<Button variant="default" onClick={openCreateDialog}>
								{t("admin:member.add_prereg")}
							</Button>
							<Button
								variant="default"
								onClick={() => setBatchDialogOpen(true)}
							>
								{t("admin:member.add_multiple_prereg")}
							</Button>
						</>
					)}
				</div>
			</div>
			<Separator className="mb-4" />
			<AdminTable
				table={table}
				onRowClick={
					hasManagePreregMemberPerms
						? (row) => openEditDialog(row.original)
						: undefined
				}
			/>
			<Dialog
				open={dialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						closeDialog();
					}
				}}
			>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle>
							{editingMember
								? t("admin:member.edit_prereg")
								: t("admin:member.create_prereg")}
						</DialogTitle>
						<DialogDescription>
							{t("admin:member.prereg_form_description")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="prereg-email">{t("admin:email")}</Label>
							<Input
								id="prereg-email"
								type="email"
								value={formValues.email}
								onChange={(e) =>
									setFormValues((current) => ({
										...current,
										email: e.target.value,
									}))
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="prereg-stil-id">{t("admin:stil_id")}</Label>
							<Input
								id="prereg-stil-id"
								value={formValues.stil_id}
								onChange={(e) =>
									setFormValues((current) => ({
										...current,
										stil_id: e.target.value,
									}))
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="prereg-telephone">
								{t("admin:car.telephone_number")}
							</Label>
							<Input
								id="prereg-telephone"
								value={formValues.telephone_number}
								onChange={(e) =>
									setFormValues((current) => ({
										...current,
										telephone_number: e.target.value,
									}))
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{t("admin:cancel")}</Button>
						</DialogClose>
						<Button
							onClick={handleSave}
							disabled={createMutation.isPending || updateMutation.isPending}
						>
							{editingMember ? t("admin:save") : t("admin:add")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog
				open={batchDialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						setBatchDialogOpen(false);
						setBatchInput("");
					}
				}}
			>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle>{t("admin:member.add_multiple_prereg")}</DialogTitle>
						<DialogDescription>
							{t("admin:member.batch_prereg_form_description")}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="batch-prereg-input">
								{t("admin:member.batch_prereg_input_label")}
							</Label>
							<textarea
								id="batch-prereg-input"
								className="border rounded p-2 w-full h-40"
								value={batchInput}
								onChange={(e) => setBatchInput(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{t("admin:cancel")}</Button>
						</DialogClose>
						<Button
							onClick={() => {
								if (batchInput) {
									const result = handleBatchAdd(batchInput, t);
									if (result.success) {
										createBatchMutation.mutate({
											body: result.result,
										});
									} else {
										toast.error(result.message);
									}
								}
							}}
							disabled={createBatchMutation.isPending}
						>
							{t("admin:member.add_multiple_prereg")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
