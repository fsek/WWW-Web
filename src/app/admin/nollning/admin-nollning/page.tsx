"use client";

import { getNollningOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense, useState } from "react";
import type { GroupRead, NollningGroupRead } from "@/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import { useSearchParams } from "next/navigation";
import idAsNumber from "./idAsNumber";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreateGroup from "./groups/CreateGroup";
import EditGroup from "./groups/editGroup";
import { ArrowLeft } from "lucide-react";

export default function Page() {
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	const nollningID = idAsNumber(search);
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<GroupRead | null>(null);

	const { data } = useSuspenseQuery({
		...getNollningOptions({
			path: { nollning_id: nollningID },
		}),
	});

	const handleEditGroup = (group: GroupRead) => {
		setSelectedGroup(group);
		setOpen(true);
	};

	const columnHelper = createColumnHelper<NollningGroupRead>();
	const columns = [
		columnHelper.accessor("group.name", {
			header: "Group Name",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("group.group_type", {
			header: "Group Type",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("group.group_users", {
			header: "Members",
			cell: (info) => info.getValue().length,
		}),
	];

	const table = useCreateTable({ data: data.nollning_groups ?? [], columns });

	function adminAdventureMissions() {
		router.push(
			`/admin/nollning/admin-nollning/adventure-missions?id=${nollningID}`,
		);
	}

	function onClose() {
		setOpen(false);
		setSelectedGroup(null);
	}

	const routerPush = (subPage: string) => {
		const params = new URLSearchParams({
			id: `${nollningID}`,
			group: `${selectedGroup?.id ?? 0}`,
		});
		router.push(
			`/admin/nollning/admin-nollning/${subPage}?${params.toString()}`,
		);
	};

	return (
		<Suspense fallback={<div>{"Ingen nollning vald :(("}</div>}>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 underline underline-offset-4">
						Administrera "{data.name}"
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => router.push("/admin/nollning")}
					>
						<ArrowLeft className="w-4 h-4" />
						Tillbaka
					</Button>
				</div>
				<p className="">
					Här kan du skapa och redigera faddergrupper och äventyrsuppdrag
				</p>
				<div className="space-x-2 lg:col-span-2 flex">
					<Button className="w-32 min-w-fit" onClick={adminAdventureMissions}>
						Administrera äventyrsuppdrag
					</Button>
					<CreateGroup className="w-32 min-w-fit" nollningID={nollningID} />
				</div>
				<AdminTable
					table={table}
					onRowClick={(row) => handleEditGroup(row.original.group)}
				/>
				<EditGroup
					open={open}
					onClose={onClose}
					selectedGroup={selectedGroup as GroupRead}
					nollning_id={nollningID}
				>
					<div className="flex felx-row space-x-2 w-full">
						<Button
							className="flex-1"
							onClick={() => routerPush("completed-missions")}
						>
							Avklarade Uppdrag
						</Button>
						<Button
							className="flex-1"
							onClick={() => routerPush("group-users")}
						>
							Medlemmar
						</Button>
					</div>
				</EditGroup>
			</div>
		</Suspense>
	);
}
