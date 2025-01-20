// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { CarRead } from "../../../api";
import CarForm from "./CarForm.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBookingOptions } from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from "@/components/ui/full-shadcn-calendar.tsx";
import { EventsProvider } from "@/context/full-calendar-event-context.tsx";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { start } from "repl";
import type { CalendarEvent } from "@/utils/full-calendar-seed";

const columnHelper = createColumnHelper<CarRead>();

const columns = [
	columnHelper.accessor((row) => row.description, {
		id: "description",
		cell: (info) => info.getValue(),
		header: () => <span>beskrivnig</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.start_time, {
		id: "start_time",
		cell: (info) => info.getValue(),
		header: () => <span>start_time</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.end_time, {
		id: "end_time",
		cell: (info) => info.getValue(),
		header: () => <span>end_time</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
];

export default function Events() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllBookingOptions(),
	});

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data: (data as CarRead[]) ?? [],
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

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent[] =
		(data as CarRead[])?.map((car) => ({
			id: car.booking_id.toString(),
			title: car.description,
			start: car.start_time,
			end: car.end_time,
			description: "En liten bilbokning",
		})) ?? [];

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera bilbokningar
			</h3>
			<p className="py-3">
				Här kan du skapa bilbokningar & redigera existerande bilbokningar på
				hemsidan.
			</p>
			<CarForm />
			<Separator />
			<EventsProvider initialCalendarEvents={events}>
				<div className="py-4">
					<Tabs
						defaultValue="calendar"
						className="flex flex-col w-f{/* <AvailabilityChecker /> */}ull items-center"
					>
						<TabsList className="flex justify-center mb-2">
							<TabsTrigger value="calendar">Kalender</TabsTrigger>
							<TabsTrigger value="list">Lista</TabsTrigger>
						</TabsList>
						<TabsContent value="calendar" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									Kalender
								</h2>
								<p className="text-xs md:text-sm font-medium">
									Denna kalender visar alla bilbokningar som finns i systemet.
								</p>
							</div>

							<Separator />
							<Calendar />
						</TabsContent>
						<TabsContent value="list" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									Lista
								</h2>
								<p className="text-xs md:text-sm font-medium">
									Detta är en lista över alla bilbokningar som finns i systemet.
								</p>
							</div>
							<Separator />
							<AdminTable table={table} />
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
		</div>
	);
}
