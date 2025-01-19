// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { CarRead } from "../../../api";
import CarForm from "./CarForm.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBookingOptions } from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
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

	// // Transform the fetched data into CalendarEvent type
	// const events: CalendarEvent[] =
	// 	(data as CarRead[])?.map((car) => ({
	// 		id: car.start_time.toString(),
	// 		start: new Date(car.start_time),
	// 		end: new Date(car.end_time),
	// 		title: car.description,
	// 		color: "green", // Change this soon
	// 	})) ?? [];

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
			<AdminTable table={table} />
			{/* <Calendar events={events}>
				<div className="h-dvh py-6 flex flex-col">
					<div className="flex px-6 items-center gap-2 mb-6">
						<CalendarViewTrigger
							className="aria-[current=true]:bg-accent"
							view="day"
						>
							Day
						</CalendarViewTrigger>
						<CalendarViewTrigger
							view="week"
							className="aria-[current=true]:bg-accent"
						>
							Week
						</CalendarViewTrigger>
						<CalendarViewTrigger
							view="month"
							className="aria-[current=true]:bg-accent"
						>
							Month
						</CalendarViewTrigger>
						<CalendarViewTrigger
							view="year"
							className="aria-[current=true]:bg-accent"
						>
							Year
						</CalendarViewTrigger>

						<span className="flex-1" />

						<CalendarCurrentDate />

						<CalendarPrevTrigger>
							<ChevronLeft size={20} />
							<span className="sr-only">Previous</span>
						</CalendarPrevTrigger>

						<CalendarTodayTrigger>Today</CalendarTodayTrigger>

						<CalendarNextTrigger>
							<ChevronRight size={20} />
							<span className="sr-only">Next</span>
						</CalendarNextTrigger>
					</div>

					<div className="flex-1 overflow-auto px-6 relative">
						<CalendarDayView />
						<CalendarWeekView />
						<CalendarMonthView />
						<CalendarYearView />
					</div>
				</div>
			</Calendar> */}
			<div className="py-4">
				<Tabs
					defaultValue="calendar"
					className="flex flex-col w-full items-center"
				>
					<TabsList className="flex justify-center mb-2">
						<TabsTrigger value="calendar">Calendar</TabsTrigger>
						<TabsTrigger value="schedulingAssistant">
							Scheduling Assistant
						</TabsTrigger>
					</TabsList>
					<TabsContent value="calendar" className="w-full px-5 space-y-5">
						<div className="space-y-0">
							<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
								Calendar
							</h2>
							<p className="text-xs md:text-sm font-medium">
								A flexible calendar component with drag and drop capabilities
								built using FullCalendar and shacn/ui.
							</p>
						</div>

						<Separator />
						<Calendar />
					</TabsContent>
					<TabsContent
						value="schedulingAssistant"
						className="w-full px-5 space-y-5"
					>
						<div className="space-y-0">
							<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
								Scheduling Assistant
							</h2>
							<p className="text-xs md:text-sm font-medium">
								A scheduling assistant built to analyze a user&apos;s schedule
								and automatically show open spots.
							</p>
						</div>
						<Separator />
						{/* <AvailabilityChecker /> */}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
