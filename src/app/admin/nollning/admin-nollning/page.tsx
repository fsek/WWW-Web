"use client";

import { getNollningOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense, useState } from "react";
import type { GroupRead, NollningGroupRead } from "@/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import { useSearchParams } from "next/navigation";
import idAsNumber from "./idAsNumber";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreateGroup from "./groups/CreateGroup";
import EditGroup from "./groups/editGroup";

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

	const columnHelper = createColumnHelper<NollningGroupRead>();
	const columns = [
		columnHelper.accessor("group.name", {
			header: "Group Name",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("group.group_type", {
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

	const onRowClick = (e: Row<NollningGroupRead>) => {
		setSelectedGroup(e.original.group);
		setOpen(true);
	};

	return (
		<Suspense fallback={<div>{"Ingen nollning vald :(("}</div>}>
			<div className="px-8 space-x-4 space-y-4">
				<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
					Administrera "{data.name}"
				</h3>
				<p className="py-3">
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
					onRowClick={(row) => {
						const params = new URLSearchParams({
							id: `${nollningID}`,
							group: `${row.original.group.id}`,
						});
						router.push(
							`/admin/nollning/admin-nollning/completed-missions?${params.toString()}`,
						);
					}}
				/>
				<EditGroup
					open={open}
					onClose={onClose}
					selectedGroup={selectedGroup as GroupRead}
					nollning_id={0}
				/>
			</div>
		</Suspense>
	);
}
