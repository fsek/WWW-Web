"use client";

import { useState } from "react";
import { getAllPermissionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PermissionRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";

// Column setup
const columnHelper = createColumnHelper<PermissionRead>();
const columns = [
	columnHelper.accessor("target", {
		header: "Target",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("action", {
		header: "Action",
		cell: (info) => info.getValue(),
	}),
];

export default function Permissions() {
	const { data, error, isPending } = useQuery({
		...getAllPermissionsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<PermissionRead | null>(
		null,
	);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<PermissionRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedEvent(null);
	}

	if (isPending) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera permissions
			</h3>
			<p className="py-3">
				Här kan du skapa permissions & redigera existerande permissions på
				hemsidan.
			</p>
			{/* <PostForm /> */}

			<AdminTable table={table} onRowClick={handleRowClick} />

			{/* <PostEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedPost={selectedEvent as PermissionRead}
			/> */}
		</div>
	);
}
