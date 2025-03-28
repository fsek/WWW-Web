"use client";

import { useState } from "react";
import DocumentsForm from "./DocumentsForm";
import DocumentsEditForm from "./DocumentsEditForm";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";

// Column setup
const columnHelper = createColumnHelper<DocumentsRead>();
const columns = [
	columnHelper.accessor("title", {
		header: "Namn",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("created_at", {
		header: "Skapad",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("public", {
		header: "Offentlig",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("created_by", {
		header: "Skapad av",
		cell: (info) => formatTime(info.getValue()),
	}),
];

export default function Events() {
	const { data, error, isPending } = useQuery({
		...getAllEventsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<EventRead>) {
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
				Administrera dokument
			</h3>
			<p className="py-3">
				Här kan du ladda upp dokument & redigera existerande dokument på
				hemsidan.
			</p>
			<DocumentsForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<DocumentsEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				// selectedDocument={selectedDocument as EventRead}
			/>
		</div>
	);
}
