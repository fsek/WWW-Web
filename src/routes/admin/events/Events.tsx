import { useState } from "react";
import EventsForm from "./EventsForm";
import EventsEditForm from "./EventsEditForm";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventRead } from "../../../api";
import createTable from "@/widgets/createTable";

// Column setup
const columnHelper = createColumnHelper<EventRead>();
const columns = [
	columnHelper.accessor("title_sv", {
		header: "Svensk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("starts_at", {
		header: "Starttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("ends_at", {
		header: "Sluttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("signup_start", {
		header: "Anmälningsöppning",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("signup_end", {
		header: "Anmälningsavslut",
		cell: (info) => formatTime(info.getValue()),
	}),
];

export default function Events() {
	const queryClient = useQueryClient();
	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

	const table = createTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<EventRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	if (isFetching) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera event
			</h3>
			<p className="py-3">
				Här kan du skapa event & redigera existerande event på hemsidan.
			</p>
			<EventsForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<EventsEditForm
				open={openEditDialog}
				onClose={() => setOpenEditDialog(false)}
				selectedEvent={selectedEvent as EventRead}
			/>
		</div>
	);
}
