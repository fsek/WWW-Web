import { useState } from "react";
import type { EventRead } from "../../../api";
import EventsForm from "./EventsForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import {
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	type SortingState,
	getSortedRowModel,
} from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

const columnHelper = createColumnHelper<EventRead>();

const columns = [
	columnHelper.accessor((row) => row.title_sv, {
		id: "title_sv",
		cell: (info) => info.getValue(),
		header: () => <span>Svensk titel</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.starts_at, {
		id: "starts_at",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Starttid</span>,
		size: 60,
	}),
	columnHelper.accessor((row) => row.ends_at, {
		id: "ends_at",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Sluttid</span>,
		size: 60,
	}),
	columnHelper.accessor((row) => row.signup_start, {
		id: "signup_start",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Anmälningsöppning</span>,
		size: 60,
	}),
	columnHelper.accessor((row) => row.signup_end, {
		id: "signup_end",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Anmälningsavslut</span>,
		size: 60,
	}),
];

export default function Events() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
	});

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data: (data as EventRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		initialState: {
			pagination: {
				pageIndex: 0, //custom initial page index
				pageSize: 10, //custom default page size
			},
			sorting: sorting,
		},
		state: {
			sorting,
		},
	});

	if (isFetching) {
		return <p> Hämtar</p>;
	}

	if (error) {
		return <p> Något gick fel :/</p>;
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
			<AdminTable table={table} />
		</div>
	);
}
