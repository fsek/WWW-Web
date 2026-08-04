"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import idAsNumber from "../idAsNumber";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	addUserToGroupMutation,
	getSingleGroupOptions,
	getSingleGroupQueryKey,
	removeUserFromGroupMutation,
} from "@/api/@tanstack/react-query.gen";
import { createColumnHelper } from "@tanstack/react-table";
import type {
	AdminUserRead,
	GroupAddUser,
	GroupUserRead,
	UserRead,
} from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SearchBar from "./searchBar";
import BatchAddBox from "./batchAdd";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function GroupUsersPage() {
	const { t } = useTranslation("admin");
	const searchParams = useSearchParams();
	const searchID = searchParams.get("id");
	const searchGroup = searchParams.get("group");
	const nollningID = idAsNumber(searchID);
	const groupID = idAsNumber(searchGroup);

	if (nollningID < 0 || groupID < 0) {
		return (
			<div className="px-12 py-4">
				<h3>{t("nollning.group_members.no_group_selected")}</h3>
			</div>
		);
	}

	return <GroupUsersContent groupID={groupID} nollningID={nollningID} />;
}

function GroupUsersContent({
	groupID,
	nollningID,
}: {
	groupID: number;
	nollningID: number;
}) {
	const { t } = useTranslation("admin");

	const [selectedUser, setSelectedUser] = useState<GroupUserRead | null>(null);
	const [openRemoveUser, setOpenRemoveUser] = useState(false);

	const group = useSuspenseQuery({
		...getSingleGroupOptions({
			path: { id: groupID },
		}),
	});
	const queryClient = useQueryClient();

	const columnHelper = createColumnHelper<GroupUserRead>();
	const columns = [
		columnHelper.accessor("user.first_name", {
			header: t("nollning.group_members.header_first_name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("user.last_name", {
			header: t("nollning.group_members.header_last_name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("user.program", {
			header: t("nollning.group_members.header_program"),
			cell: (info) => {
				if (info.getValue() === "Oklart") {
					return t("nollning.group_members.unclear");
				}
				return info.getValue();
			},
		}),
		columnHelper.accessor("group_user_type", {
			header: t("nollning.group_members.header_role"),
			cell: (info) => {
				// get translated value for group_user_type
				const groupUserType = info.getValue();
				if (groupUserType === "Mentor") {
					return t("nollning.group_members.fadder");
				}
				if (groupUserType === "Mentee") {
					return t("nollning.group_members.nolla");
				}
				if (groupUserType === "Default") {
					return t("nollning.group_members.standard");
				}
				return groupUserType;
			},
		}),
	];

	const table = useCreateTable({
		data: group.data?.group_users ?? [],
		columns,
	});

	function onClose() {
		setOpenRemoveUser(false);
		setSelectedUser(null);
	}

	const removeUser = useMutation({
		...removeUserFromGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getSingleGroupQueryKey({
					path: { id: groupID },
				}),
			});
			toast.success(t("nollning.group_members.toast_remove_success"));
		},
		onError: () => {
			toast.error(t("nollning.group_members.toast_remove_error"));
			onClose();
		},
	});

	const handleRemoveUser = () => {
		removeUser.mutate({
			path: { id: groupID },
			body: { user_id: selectedUser?.user.id ?? -1 },
		});
		onClose();
	};

	const addUser = useMutation({
		...addUserToGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getSingleGroupQueryKey({
					path: { id: groupID },
				}),
			});
			toast.success(t("nollning.group_members.toast_add_success"));
		},
		onError: () => {
			toast.error(t("nollning.group_members.toast_add_error"));
		},
	});

	const addUserBatch = useMutation({
		...addUserToGroupMutation(),
		throwOnError: false,
	});

	const handleAddUser = (
		user: UserRead,
		groupUserType: GroupAddUser["group_user_type"],
	) => {
		addUser.mutate({
			path: { id: groupID },
			body: { user_id: user.id, group_user_type: groupUserType },
		});
	};

	const handleBatchAdd = async ({
		users,
		groupUserType,
		unmatchedValues,
	}: {
		users: AdminUserRead[];
		groupUserType: GroupAddUser["group_user_type"];
		unmatchedValues: string[];
	}) => {
		let addedCount = 0;
		let failedCount = 0;

		for (const user of users) {
			try {
				await addUserBatch.mutateAsync({
					path: { id: groupID },
					body: { user_id: user.id, group_user_type: groupUserType },
				});
				addedCount += 1;
			} catch {
				failedCount += 1;
			}
		}

		queryClient.invalidateQueries({
			queryKey: getSingleGroupQueryKey({
				path: { id: groupID },
			}),
		});

		if (addedCount > 0 && failedCount === 0 && unmatchedValues.length === 0) {
			toast.success(
				t("nollning.group_members.batch_add_members.toast_success", {
					count: addedCount,
				}),
			);
			return;
		}

		if (addedCount > 0 && failedCount === 0) {
			toast.success(
				t("nollning.group_members.batch_add_members.toast_partial_success", {
					count: addedCount,
					unmatched: unmatchedValues.length,
				}),
			);
			return;
		}

		if (addedCount > 0 && failedCount > 0) {
			toast.error(
				t("nollning.group_members.batch_add_members.toast_error", {
					added: addedCount,
					failed: failedCount,
				}),
			);
			return;
		}

		toast.error(
			t("nollning.group_members.batch_add_members.toast_error", {
				added: 0,
				failed: failedCount,
			}),
		);
	};

	const router = useRouter();

	return (
		<Suspense
			fallback={
				<div>
					<h3>{t("nollning.group_members.no_group_selected")}</h3>
				</div>
			}
		>
			<div className="px-12 py-4 space-y-4 ">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("nollning.group_members.header_group_members", {
							group: group.data.name,
						})}
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() =>
							router.push(`/admin/nollning/admin-nollning/?id=${nollningID}`)
						}
					>
						<ArrowLeft className="w-4 h-4" />
						{t("nollning.group_members.back")}
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("nollning.group_members.info_text", {
						group: group.data.name,
					})}
				</p>
				<div className="space-y-4 space-x-8">
					<div className="space-x-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mb-4 max-w-6xl">
							<div className="border border-card-foreground/20 rounded-lg bg-card">
								<div className="space-y-4 p-4">
									<h3 className="text-xl">
										{t("nollning.group_members.add_members")}
									</h3>
									<SearchBar
										excludedFromSearch={group.data.group_users}
										onRowClick={handleAddUser}
									/>
								</div>
							</div>
							<div className="border border-card-foreground/20 rounded-lg bg-card">
								<div className="space-y-4 p-4">
									<h3 className="text-xl">
										{t("nollning.group_members.batch_add_members.title")}
									</h3>
									<BatchAddBox
										excludedFromSearch={group.data.group_users}
										onSubmit={handleBatchAdd}
									/>
								</div>
							</div>
						</div>
						<AdminTable
							table={table}
							onRowClick={(row) => {
								setSelectedUser(row.original);
								setOpenRemoveUser(true);
							}}
						/>
						<Dialog
							open={openRemoveUser}
							onOpenChange={(isOpen) => {
								if (!isOpen) {
									onClose();
								}
							}}
						>
							<DialogContent>
								<VisuallyHidden>
									<DialogTitle>
										{t("nollning.group_members.remove_dialog_title")}
									</DialogTitle>
								</VisuallyHidden>
								<DialogHeader>
									{t("nollning.group_members.remove_dialog_header", {
										first_name: selectedUser?.user.first_name,
										last_name: selectedUser?.user.last_name,
										group: group.data.name,
									})}
								</DialogHeader>
								<DialogFooter>
									<div className="px-8 space-x-4 space-y-4">
										<Button variant="destructive" onClick={handleRemoveUser}>
											{t("nollning.group_members.remove")}
										</Button>
										<DialogClose>
											{t("nollning.group_members.cancel")}
										</DialogClose>
									</div>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>
		</Suspense>
	);
}
