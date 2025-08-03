"use client";

import { getNollningOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense, useMemo, useState } from "react";
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
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Page() {
	const searchParams = useSearchParams();
	const idParam = searchParams.get("id");
	const nollningID = idAsNumber(idParam);
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<GroupRead | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const { data } = useSuspenseQuery({
		...getNollningOptions({
			path: { nollning_id: nollningID },
		}),
	});

	// Filter groups based on search term
	const filteredGroups = useMemo(() => {
		let groups = data.nollning_groups ?? [];
		// Filter by search term if provided
		if (searchTerm.trim() !== "") {
			const term = searchTerm.toLowerCase();
			groups = groups.filter((group) =>
			(group.group.name?.toLowerCase().includes(term) ||
				group.group.group_users.some((user) =>
					(`${user.user.first_name} ${user.user.last_name}`).toLowerCase().includes(term)
				))
			);
		}
		return groups;
	}, [data.nollning_groups, searchTerm]);

	const handleEditGroup = (group: GroupRead) => {
		setSelectedGroup(group);
		setOpen(true);
	};

	const columnHelper = createColumnHelper<NollningGroupRead>();
	const columns = [
		columnHelper.accessor("nollning_group_number", {
			header: "Group Number",
			cell: (info) => info.getValue() ?? "N/A",
		}),
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
		{
			id: "links",
			header: "Genvägar",
			cell: ({ row }: { row: Row<NollningGroupRead> }) => (
				<div className="flex flex-row justify-end gap-2">
					<Button
						variant={"outline"}
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/admin/nollning/admin-nollning/completed-missions?id=${nollningID}&group=${row.original.group.id}`);
						}}
					>
						Till uppdrag
					</Button>
					<Button
						variant={"outline"}
						size="sm"
						className="text-foreground"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/admin/nollning/admin-nollning/group-users?id=${nollningID}&group=${row.original.group.id}`);
						}}
					>
						Till medlemmar
					</Button>
				</div>
			),
		},
	];

	const table = useCreateTable({ data: filteredGroups, columns });

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
					<h3 className="text-3xl py-3 font-bold text-primary">
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
				<div className="flex flex-row gap-3 items-center">
					<span>
						Filter: (gruppnamn, medlemmars namn)
					</span>
					<Input
						type="text"
						placeholder="Sök uppdrag..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-64"
					/>
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
