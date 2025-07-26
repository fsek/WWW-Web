"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
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
import type { GroupAddUser, GroupUserRead, UserRead } from "@/api";
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
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const page = () => {
	const searchParams = useSearchParams();
	const searchID = searchParams.get("id");
	const searchGroup = searchParams.get("group");
	const nollningID = idAsNumber(searchID);
	const groupID = idAsNumber(searchGroup);

	const [selectedUser, setSelectedUser] = useState<GroupUserRead | null>(null);
	const [openRemoveUser, setOpenRemoveUser] = useState(false);

	const group = useSuspenseQuery({
		...getSingleGroupOptions({
			path: { id: groupID },
		}),
	});

	const columnHelper = createColumnHelper<GroupUserRead>();
	const columns = [
		columnHelper.accessor("user.first_name", {
			header: "Förnamn",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("user.last_name", {
			header: "Efternamn",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("user.program", {
			header: "Program",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("group_user_type", {
			header: "roll",
			cell: (info) => info.getValue(),
		}),
	];

	const table = useCreateTable({
		data: group.data?.group_users ?? [],
		columns,
	});

	const queryClient = useQueryClient();

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
		},
		onError: () => {
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
		},
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

	const router = useRouter();

	return (
		<Suspense
			fallback={
				<div>
					<h3>
						{"ingen grupp vald :(( [eller så existerar inte den valda gruppen]"}
					</h3>
				</div>
			}
		>
			<div className="px-12 py-4  space-y-4 ">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 underline underline-offset-4">
						Medlemmar i "{group.data.name}"
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() =>
							router.push(`/admin/nollning/admin-nollning/?id=${nollningID}`)
						}
					>
						<ArrowLeft className="w-4 h-4" />
						Tillbaka
					</Button>
				</div>
				<div className="space-y-4 flex flex-row space-x-8">
					<div className="space-x-4 flex-4">
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
								<DialogHeader>
									Ta bort {selectedUser?.user.first_name}{" "}
									{selectedUser?.user.last_name} från {group.data.name}
								</DialogHeader>
								<DialogFooter>
									<div className="px-8 space-x-4 space-y-4">
										<Button variant="destructive" onClick={handleRemoveUser}>
											Ta bort
										</Button>
										<DialogClose>Avbryt</DialogClose>
									</div>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					<div className="border border-gray-200 rounded-lg bg-gray-100">
						<div className="space-x-4 space-y-4 flex-2 p-4">
							<h3 className="text-3xl py-3 underline underline-offset-4">
								Lägg till medlemmar
							</h3>

							<SearchBar
								excludedFromSearch={group.data.group_users}
								onRowClick={handleAddUser}
							/>
						</div>
					</div>
				</div>
			</div>
		</Suspense>
	);
};

export default page;
