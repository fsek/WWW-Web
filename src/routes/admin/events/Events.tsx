// import { useState } from "react";
// import type { EventRead } from "../../../api";
// import EventsForm from "./EventsForm";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
// import {
// 	createColumnHelper,
// 	useReactTable,
// 	getCoreRowModel,
// 	getPaginationRowModel,
// 	type SortingState,
// 	getSortedRowModel,
// } from "@tanstack/react-table";
// import AdminTable from "@/widgets/AdminTable";
// import formatTime from "@/help_functions/timeFormater";
// const ACCEPTED_IMAGE_TYPES = [
// 	"image/jpeg",
// 	"image/jpg",
// 	"image/png",
// 	"image/webp",
// ];

// const columnHelper = createColumnHelper<EventRead>();

// //https://tanstack.com/table/latest/docs/guide/sorting

// const columns = [
// 	columnHelper.accessor((row) => row.title_sv, {
// 		id: "title_sv",
// 		cell: (info) => info.getValue(),
// 		header: () => <span>Svensk titel</span>,
// 		size: 60,
// 		//footer: (props) => props.column.id,
// 	}),
// 	columnHelper.accessor((row) => row.starts_at, {
// 		id: "starts_at",
// 		cell: (info) => formatTime(info.getValue()),
// 		header: () => <span>Starttid</span>,
// 		size: 60,
// 	}),
// 	columnHelper.accessor((row) => row.ends_at, {
// 		id: "ends_at",
// 		cell: (info) => formatTime(info.getValue()),
// 		header: () => <span>Sluttid</span>,
// 		size: 60,
// 	}),
// 	columnHelper.accessor((row) => row.signup_start, {
// 		id: "signup_start",
// 		cell: (info) => formatTime(info.getValue()),
// 		header: () => <span>Anmälningsöppning</span>,
// 		size: 60,
// 	}),
// 	columnHelper.accessor((row) => row.signup_end, {
// 		id: "signup_end",
// 		cell: (info) => formatTime(info.getValue()),
// 		header: () => <span>Anmälningsavslut</span>,
// 		size: 60,
// 	}),
// ];

// export default function Events() {
// 	const queryClient = useQueryClient();

// 	const { data, error, isFetching } = useQuery({
// 		...getAllEventsOptions(),
// 	});

// 	const [sorting, setSorting] = useState<SortingState>([]);

// 	const table = useReactTable({
// 		columns,
// 		data: (data as EventRead[]) ?? [],
// 		getCoreRowModel: getCoreRowModel(),
// 		getPaginationRowModel: getPaginationRowModel(),
// 		getSortedRowModel: getSortedRowModel(),
// 		onSortingChange: setSorting,
// 		initialState: {
// 			pagination: {
// 				pageIndex: 0, //custom initial page index
// 				pageSize: 10, //custom default page size
// 			},
// 			sorting: sorting,
// 		},
// 		state: {
// 			sorting,
// 		},
// 	});

// 	if (isFetching) {
// 		return <p> Hämtar</p>;
// 	}

// 	if (error) {
// 		return <p> Något gick fel :/</p>;
// 	}

// 	return (
// 		<div className="px-8 space-x-4">
// 			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
// 				Administrera event
// 			</h3>
// 			<p className="py-3">
// 				Här kan du skapa event & redigera existerande event på hemsidan.
// 			</p>
// 			<EventsForm />
// 			<AdminTable table={table} onRowClick={() => console.log("hej")} />
// 		</div>
// 	);
// }

import { useState } from "react";
import EventsForm from "./EventsForm"; // Your create form
import EventsEditForm from "./EventsEditForm"; // The editing form from above
import {
	getAllEventsOptions,
	// Possibly an "updateEventMutation" if you have it
} from "@/api/@tanstack/react-query.gen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type Row,
} from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventRead } from "../../../api";

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

	const [sorting, setSorting] = useState<SortingState>([]);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

	const table = useReactTable({
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
			sorting,
		},
		state: {
			sorting,
		},
	});

	// For example, your "update event" function might look like this:
	// const updateEvent = useMutation({
	//   ...updateEventMutation(),
	//   onSuccess: () => queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() }),
	// });

	// Handler for clicking a row
	function handleRowClick(row: Row<EventRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	// Example submit handler for the edit form
	// function handleEditSubmit(updatedValues: any) {
	//   // Call your mutation here, e.g.:
	//   // updateEvent.mutate({ ...updatedValues });
	// }

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

			{/* This is your existing create form */}
			<EventsForm />

			{/* Table for listing events */}
			<AdminTable table={table} onRowClick={handleRowClick} />

			{/* Dialog + Form for editing a selected row */}
			<EventsEditForm
				open={openEditDialog}
				onClose={() => setOpenEditDialog(false)}
				selectedEvent={
					selectedEvent
						? {
								id: selectedEvent.id,
								title_sv: selectedEvent.title_sv,
								title_en: selectedEvent.title_en,
								council_id: selectedEvent.council_id,
								starts_at: selectedEvent.starts_at,
								ends_at: selectedEvent.ends_at,
								signup_start: selectedEvent.signup_start,
								signup_end: selectedEvent.signup_end,
								description_sv: selectedEvent.description_sv ?? "",
								description_en: selectedEvent.description_en ?? "",
							}
						: undefined
				}
				// onSubmit={handleEditSubmit}  // If you have an update mutation
			/>
		</div>
	);
}
