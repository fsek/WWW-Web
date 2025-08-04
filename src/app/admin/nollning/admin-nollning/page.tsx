"use client";

import { getNollningByYearOptions, getNollningOptions } from "@/api/@tanstack/react-query.gen";
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
import { useTranslation } from "react-i18next";

export default function Page() {
	const { t } = useTranslation("admin");
	const searchParams = useSearchParams();
	const idParam = searchParams.get("id");
	let nollningID = idAsNumber(idParam);
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<GroupRead | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const { data } =
		idParam === null || idParam === "current"
			? useSuspenseQuery(getNollningByYearOptions({
				path: { year: new Date().getFullYear() },
			}))
			: useSuspenseQuery(getNollningOptions({
				path: { nollning_id: nollningID },
			}));

	// After getting the data, switch the parameter to nollningID, to make it easier to pass down
	if (idParam === null || idParam === "current") {
		nollningID = data.id;
	}

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
		columnHelper.accessor("mentor_group_number", {
			header: t("nollning.group_admin.group_number"),
			cell: (info) => info.getValue() ?? "N/A",
		}),
		columnHelper.accessor("group.name", {
			header: t("nollning.group_admin.group_name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("group.group_type", {
			header: t("nollning.group_admin.group_type"),
			cell: (info) => {
				// Map to translated group type
				const groupType = info.getValue();
				switch (groupType) {
					case "Mentor":
						return t("nollning.group_admin.fadder");
					case "Mission":
						return t("nollning.group_admin.uppdrag");
					default:
						return t("nollning.group_admin.unknown_type");
				}
			},
			size: 100,
		}),
		columnHelper.accessor("group.group_users", {
			header: t("nollning.group_admin.members"),
			cell: (info) => info.getValue().length,
			size: 100,
		}),
		{
			id: "links",
			header: t("nollning.group_admin.shortcuts"),
			cell: ({ row }: { row: Row<NollningGroupRead> }) => (
				<div className="flex max-2xl:flex-col justify-end gap-2">
					<Button
						variant={"outline"}
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/admin/nollning/admin-nollning/completed-missions?id=${nollningID}&group=${row.original.group.id}`);
						}}
					>
						{t("nollning.group_admin.to_missions")}
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
						{t("nollning.group_admin.to_members")}
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
		<Suspense fallback={<div>{t("nollning.group_admin.no_nollning_selected")}</div>}>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("nollning.group_admin.admin_title", { name: data.name })}
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => router.push("/admin/nollning")}
					>
						<ArrowLeft className="w-4 h-4" />
						{t("nollning.group_admin.back")}
					</Button>
				</div>
				<p className="">
					{t("nollning.group_admin.intro")}
				</p>
				<div className="space-x-2 lg:col-span-2 flex">
					<Button className="w-32 min-w-fit" onClick={adminAdventureMissions}>
						{t("nollning.group_admin.admin_missions")}
					</Button>
					<CreateGroup className="w-32 min-w-fit" nollningID={nollningID} />
				</div>
				<div className="flex flex-row gap-3 items-center">
					<span>
						{t("nollning.group_admin.filter_label")}
					</span>
					<Input
						type="text"
						placeholder={t("nollning.group_admin.search_placeholder")}
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
							{t("nollning.group_admin.completed_missions")}
						</Button>
						<Button
							className="flex-1"
							onClick={() => routerPush("group-users")}
						>
							{t("nollning.group_admin.members_btn")}
						</Button>
					</div>
				</EditGroup>
			</div>
		</Suspense>
	);
}