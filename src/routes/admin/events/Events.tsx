import { useState, useEffect, useMemo } from "react";
import { type EventRead, type NewsRead, NewsService } from "../../../api";
import { Button } from "@/components/ui/button";
import EventsForm from "./EventsForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getAllEventsOptions,
	getAllNewsOptions,
} from "@/api/@tanstack/react-query.gen";
import {
	createColumnHelper,
	useReactTable,
	flexRender,
	RowModel,
	Table,
	getCoreRowModel,
	getPaginationRowModel,
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
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.starts_at, {
		id: "starts_at",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Starttid</span>,
	}),
	columnHelper.accessor((row) => row.ends_at, {
		id: "ends_at",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Sluttid</span>,
	}),
	columnHelper.accessor((row) => row.signup_start, {
		id: "signup_start",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Anmälningsöppning</span>,
	}),
	columnHelper.accessor((row) => row.signup_end, {
		id: "signup_end",
		cell: (info) => formatTime(info.getValue()),
		header: () => <span>Anmälningsavslut</span>,
	}),
];

export default function Events() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
	});

	const table = useReactTable({
		columns,
		data: (data as EventRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0, //custom initial page index
				pageSize: 10, //custom default page size
			},
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
