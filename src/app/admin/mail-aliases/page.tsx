"use client";

import type { AliasRead } from "@/api";
import {
	aliasListAliasesOptions,
	aliasAddMemberMutation,
	aliasRemoveMemberMutation,
	aliasCreateAliasMutation,
	aliasDeleteAliasMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import SourceForm from "./SourceForm";

const columnHelper = createColumnHelper<AliasRead>();

// Use fake data instead of API
const useFakeData = true;

const fakeAliasData: AliasRead[] = [
	{
		alias: "board@fsektionen.se",
		members: [
			"president@fsektionen.se",
			"vice-president@fsektionen.se",
			"treasurer@fsektionen.se",
		],
	},
	{
		alias: "teknikfokus@fsektionen.se",
		members: [
			"editor@fsektionen.se",
			"journalist1@fsektionen.se",
			"journalist2@fsektionen.se",
		],
	},
	{
		alias: "sexmasteriet@fsektionen.se",
		members: ["sexmaster@fsektionen.se", "vice-sexmaster@fsektionen.se"],
	},
	{
		alias: "cafe@fsektionen.se",
		members: [
			"cafemaster@fsektionen.se",
			"barista1@fsektionen.se",
			"barista2@fsektionen.se",
			"barista3@fsektionen.se",
		],
	},
	{
		alias: "event@fsektionen.se",
		members: [
			"eventmaster@fsektionen.se",
			"event-coordinator@fsektionen.se",
			"president@fsektionen.se",
		],
	},
	{
		alias: "info@fsektionen.se",
		members: [
			"infomaster@fsektionen.se",
			"webmaster@fsektionen.se",
			"social-media@fsektionen.se",
		],
	},
	{
		alias: "study@fsektionen.se",
		members: ["studieradgivare@fsektionen.se", "studierektor@fsektionen.se"],
	},
];

export default function MailAliasPage() {
	const { t } = useTranslation();
	const {
		data: aliasListFromAPI,
		error,
		isLoading,
		refetch: refetchAliasList,
	} = useQuery({
		...aliasListAliasesOptions(),
		enabled: !useFakeData,
	});

	const aliasPairList = useFakeData ? fakeAliasData : aliasListFromAPI;

	// add search state
	const [search, setSearch] = useState<string>("");

	const [editTarget, setEditTarget] = useState<{
		source: string;
		target: string;
	} | null>(null);
	// temp value for editing
	const [editValue, setEditValue] = useState<string>("");
	const [addToSource, setAddToSource] = useState<string>("");

	// compute filtered alias pairs
	const filteredAliasPairList = useMemo(() => {
		if (!aliasPairList) return [];
		const lower = search.toLowerCase();
		return aliasPairList.filter((pair) => {
			const matchesSearch =
				pair.alias.toLowerCase().includes(lower) ||
				pair.members.some((m) => m.toLowerCase().includes(lower));
			return matchesSearch;
		});
	}, [aliasPairList, search]);

	const addTargetMutation = useMutation({
		...aliasAddMemberMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.add_target_success"));
			// Invalidate the alias list query to refresh data
			refetchAliasList();
		},
		onError: (error) => {
			toast.error(t("admin:mail_aliases.add_target_error"));
		},
	});

	const removeTargetMutation = useMutation({
		...aliasRemoveMemberMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.remove_target_success"));
			// Invalidate the alias list query to refresh data
			refetchAliasList();
		},
		onError: (error) => {
			toast.error(t("admin:mail_aliases.remove_target_error"));
		},
	});

	const createAliasMutation = useMutation({
		...aliasCreateAliasMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.create_source_success"));
			// Invalidate the alias list query to refresh data
			refetchAliasList();
		},
		onError: (error) => {
			toast.error(t("admin:mail_aliases.create_source_error"));
		},
	});

	const deleteAliasMutation = useMutation({
		...aliasDeleteAliasMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.delete_source_success"));
			// Invalidate the alias list query to refresh data
			refetchAliasList();
		},
		onError: (error) => {
			toast.error(t("admin:mail_aliases.delete_source_error"));
		},
	});

	const columns = [
		columnHelper.accessor("alias", {
			header: t("admin:mail_aliases.source"),
			cell: (info) => {
				const [confirmOpen, setConfirmOpen] = useState(false);
				const removeSource = (source: string) => {
					deleteAliasMutation.mutate({
						path: { alias_email: source },
					});
				};
				return (
					<div className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg">
						<span className="font-semibold text-lg flex-1">
							{info.getValue()}
						</span>
						<ConfirmDeleteDialog
							open={confirmOpen}
							onOpenChange={(open) => {
								setConfirmOpen(open);
								if (!open) {
									deleteAliasMutation.reset();
								}
							}}
							onConfirm={() => {
								removeSource(info.row.original.alias);
								setConfirmOpen(false);
							}}
							triggerText={t("admin:mail_aliases.delete_source")}
							title={t("admin:mail_aliases.delete_source_confirm_title")}
							description={t(
								"admin:mail_aliases.delete_source_confirm_description",
								{ alias: info.getValue() },
							)}
							confirmText={t("admin:mail_aliases.delete_source_confirm")}
							cancelText={t("admin:cancel")}
						/>
					</div>
				);
			},
			size: 150,
		}),
		columnHelper.accessor("members", {
			header: t("admin:mail_aliases.target"),
			enableSorting: false,
			cell: (info) => {
				const targets = info.getValue();
				const aliasPair = info.row.original;

				const removeTarget = (targetToRemove: string) => {
					removeTargetMutation.mutate({
						path: { alias_email: aliasPair.alias },
						query: { member_email: targetToRemove },
					});
				};

				const handlePlusClick = () => {
					setEditTarget({ source: aliasPair.alias, target: "" });
					setEditValue("");
					setAddToSource(aliasPair.alias);
				};

				const addTarget = () => {
					if (editValue.trim() === "") {
						toast.error(t("admin:mail_aliases.empty_target_error"));
						return;
					}
					addTargetMutation.mutate({
						path: { alias_email: aliasPair.alias },
						query: { member_email: editValue.trim() },
					});
				};

				const handleEditTarget = (target: string) => {
					setEditTarget({ source: aliasPair.alias, target });
					setEditValue(target);
				};

				const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
					setEditValue(e.target.value);
				};

				const handleEditBlur = () => {
					// Onblur is called when the input loses focus
					if (editValue.trim() === "") {
						setEditTarget(null);
						setAddToSource("");
						return;
					}
					if (editTarget) {
						if (editTarget.target === "") {
							// Adding new target
							addTargetMutation.mutate({
								path: { alias_email: editTarget.source },
								query: { member_email: editValue.trim() },
							});
						} else {
							// Editing existing target
							removeTargetMutation.mutate({
								path: { alias_email: editTarget.source },
								query: { member_email: editTarget.target },
							});
							addTargetMutation.mutate({
								path: { alias_email: editTarget.source },
								query: { member_email: editValue.trim() },
							});
						}
					}
					setEditTarget(null);
					setAddToSource("");
				};

				const handleEditKeyDown = (
					e: React.KeyboardEvent<HTMLInputElement>,
				) => {
					if (e.key === "Enter") {
						// onBlur is not called on Enter, so we handle it here
						if (editValue.trim() === "") {
							setEditTarget(null);
							setAddToSource("");
							return;
						}
						if (editTarget) {
							if (editTarget.target === "") {
								addTargetMutation.mutate({
									path: { alias_email: editTarget.source },
									query: { member_email: editValue.trim() },
								});
							} else {
								// Editing existing member
								// Remove the old member from the alias
								removeTargetMutation.mutate({
									path: { alias_email: editTarget.source },
									query: { member_email: editTarget.target },
								});
								// Add the new member to the alias
								addTargetMutation.mutate({
									path: { alias_email: editTarget.source },
									query: { member_email: editValue.trim() },
								});
							}
						}
						setEditTarget(null);
						setAddToSource("");
					}
				};

				return (
					<div className="space-y-1">
						{targets.sort().map((target) => {
							const isEditing =
								editTarget &&
								editTarget.source === aliasPair.alias &&
								editTarget.target === target;
							return (
								<div
									key={target}
									className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg"
								>
									{isEditing ? (
										<Input
											value={editValue}
											onChange={handleEditChange}
											onBlur={handleEditBlur}
											onKeyDown={handleEditKeyDown}
											className="flex-1"
											autoFocus
										/>
									) : (
										<Button
											variant="outline"
											className="flex-1 justify-start"
											onClick={() => handleEditTarget(target)}
										>
											{target}
										</Button>
									)}
									<Button
										variant="destructive"
										size="sm"
										className="h-8 w-8 p-0 text-destructive-foreground hover:text-foreground"
										onClick={(e) => {
											e.stopPropagation();
											removeTarget(target);
										}}
									>
										<Minus className="h-6 w-6" />
									</Button>
								</div>
							);
						})}
						{editTarget && addToSource === aliasPair.alias && (
							<div className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg">
								<Input
									value={editValue}
									onChange={handleEditChange}
									onBlur={handleEditBlur}
									onKeyDown={handleEditKeyDown}
									className="flex-1"
									autoFocus
								/>
							</div>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-10 w-10 p-0 text-muted-foreground hover:text-primary bg-muted rounded-full border border-muted-foreground/20 shadow transition-colors duration-150 focus:ring-2 focus:ring-primary focus:outline-none mt-1"
							onClick={(e) => {
								e.stopPropagation();
								handlePlusClick();
							}}
						>
							<Plus className="h-3 w-3" />
						</Button>
					</div>
				);
			},
			size: 250,
		}),
	];

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns: columns,
		data: filteredAliasPairList, // use filtered list
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	// only bail out on the very first load
	if (!useFakeData && isLoading) {
		return <LoadingErrorCard />;
	}

	if (!useFakeData && error) {
		return <LoadingErrorCard error={error} />;
	}
	return (
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:mail_aliases.list")}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:mail_aliases.list_description")}
				</p>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center flex-wrap">
					<div className="w-xs">
						<Input
							placeholder={
								t("admin:mail_aliases.search_placeholder") ||
								"Search by name, email, or STIL ID"
							}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
				</div>
				<Separator className="mb-8" />
			</div>
			<SourceForm />

			<Separator />
			<AdminTable table={table} />
		</div>
	);
}
