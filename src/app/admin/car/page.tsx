"use client";

// Now using: https://github.com/robskinney/shadcn-ui-fullcalendar-example

import { useState } from "react";
import type { CarRead } from "../../../api/index";
import CarForm from "./CarForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingOptions,
} from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import {
	createColumnHelper,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	type SortingState,
	getSortedRowModel,
	type Row,
} from "@tanstack/react-table";
import {
	removeBookingMutation,
	getAllBookingQueryKey,
	updateBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import AdminTable from "@/widgets/AdminTable";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { useTranslation } from "react-i18next";
import CarEditForm from "./CarEditForm";

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
		cell: (info) => {
			const date = new Date(info.getValue());
			return date.toLocaleString();
		},
		header: () => <span>start_time</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.end_time, {
		id: "end_time",
		cell: (info) => {
			const date = new Date(info.getValue());
			return date.toLocaleString();
		},
		header: () => <span>end_time</span>,
		size: 60,
		//footer: (props) => props.column.id,
	}),
];

export default function Car() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [, setOpen] = useState(false);
	const [, setSubmitEnabled] = useState(true);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedBooking, setselectedBooking] = useState<CarRead | null>(null);

	const { data, error, isFetching } = useQuery({
		...getAllBookingOptions(),
	});

	const handleEventAdd = useMutation({
		...createBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventDelete = useMutation({
		...removeBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	const handleEventEdit = useMutation({
		...updateBookingMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function handleRowClick(row: Row<CarRead>) {
		setselectedBooking(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setselectedBooking(null);
	}

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
		return <p> {t("admin:loading")}</p>;
	}

	if (error) {
		return <p> {t("admin:error")}</p>;
	}

	// Transform the fetched data into CalendarEvent type
	const events: CalendarEvent[] =
		(data as CarRead[])?.map((car) => {
			return {
				id: car.booking_id.toString(),
				title: car.description,
				start: car.start_time,
				end: car.end_time,
				description: `user_id av bokare: ${car.user_id.toString()}`,
			};
		}) ?? [];

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				{t("admin:car.title")}
			</h3>
			<p className="py-3">
				{t("admin:car.description")}
			</p>
			<CarForm />
			<Separator />
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55" // TODO: use tailwind
				handleAdd={(event) => {
					handleEventAdd.mutate(
						{
							body: {
								description: event.title,
								start_time: event.start,
								end_time: event.end,
							},
						},
						{
							onError: (error) => {
								console.error(t("admin:car.error_add"), error);
							},
						},
					);
				}}
				handleDelete={(id) => {
					handleEventDelete.mutate(
						{ path: { booking_id: Number(id) } },
						{
							onError: (error) => {
								console.error(`${t("admin:car.error_add")} ${id}`, error);
								// TODO: Show error message to user
							},
						},
					);
				}}
				handleEdit={(event) => {
					if (!event.id) {
						console.error(t("admin:car.error_missing_id"), event);
						return;
					}

					handleEventEdit.mutate(
						{
							path: { booking_id: Number(event.id) },
							body: {
								description: event.title,
								start_time: event.start,
								end_time: event.end,
							},
						},
						{
							onError: (error) => {
								console.error(
									`${t("admin:car.error_edit")} ${event.id}`,
									error,
								);
								// TODO: Show error message to user
							},
						},
					);
				}}
			>
				<div className="py-4">
					<Tabs
						defaultValue="calendar"
						className="flex flex-col w-full items-center"
					>
						<TabsList className="flex justify-center mb-2">
							<TabsTrigger value="calendar">{t("admin:car.calendar")}</TabsTrigger>
							<TabsTrigger value="list">{t("admin:car.list")}</TabsTrigger>
						</TabsList>
						<TabsContent value="calendar" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:car.calendar")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:car.calendar_description")}
								</p>
							</div>

							<Separator />
							<Calendar
								showDescription={true}
								editDescription={false}
								handleOpenDetails={() => {}}
								disableEdit={false} // Also disables delete, add and drag-and-drop
							/>
						</TabsContent>
						<TabsContent value="list" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:car.list")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:car.list_description")}
								</p>
							</div>
							<Separator />
							<AdminTable table={table} onRowClick={handleRowClick} />
							<CarEditForm
								open={openEditDialog}
								onClose={() => handleClose()}
								selectedBooking={selectedBooking as CarRead}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
		</div>
	);
}
