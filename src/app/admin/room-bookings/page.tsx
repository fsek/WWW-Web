"use client";

import { useState } from "react";
import RoomBookingForm from "./RoomBookingForm";
import RoomBookingEditForm from "./RoomBookingEditForm";
import {
	createRoomBookingMutation,
	removeRoomBookingMutation,
	updateRoomBookingMutation,
	getAllRoomBookingsOptions,
	getAllRoomBookingsQueryKey,
	getBookingsByRoomOptions,
	getRoomBookingsBetweenTimesMutation,
} from "@/api/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { RoomBookingCreate, RoomBookingRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/full-calendar";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import type { room } from "@/api";
import { toast } from "sonner";

// Column setup
const columnHelper = createColumnHelper<RoomBookingRead>();
const columns = [
	// This might not be the best way to do this, see the car booking page for alternative
	columnHelper.accessor("room", {
		header: "Rum",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("start_time", {
		header: "Starttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("end_time", {
		header: "Sluttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("description", {
		header: "Beskrivning",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("user", {
		header: "Användare",
		cell: (info) =>
			`${info.getValue().first_name} ${info.getValue().last_name}`,
	}),
];

export default function RoomBookings() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const [selectedRoom, setSelectedRoom] = useState<room | "All">("All");

	// Tab state from query string, default to "calendar"
	const initialTab = searchParams.get("tab") || "calendar";
	const [tab, setTab] = useState(initialTab);

	const [visibleDateRange, setVisibleDateRange] = useState<{
		start: Date;
		end: Date;
	}>(() => {
		const start = new Date();
		start.setSeconds(0, 0);
		const end = new Date();
		end.setSeconds(0, 0);

		return { start, end };
	});

	// Getting all bookings at once is not efficient, but even testing with around 20 000 bookings (3 a day for 18 years) and
	// throttling the download speed to wifi levels, it still loads in a reasonable time (about 3 seconds, 1 second if a room is selected).
	// Keep in mind that this is running on my laptop (slower than server), but on the other hand I was also the only user (faster).
	// If we want to only get bookings between two times in the future visibleDateRange is useful
	const allRoomBookingsQuery = useQuery({
		...getAllRoomBookingsOptions(),
		refetchOnWindowFocus: false,
		enabled: selectedRoom === "All",
	});
	const roomBookingsByRoomQuery = useQuery({
		...getBookingsByRoomOptions({
			query: { room: selectedRoom as `${room}` },
		}),
		refetchOnWindowFocus: false,
		enabled: selectedRoom !== "All",
	});

	const data =
		selectedRoom === "All"
			? allRoomBookingsQuery.data
			: roomBookingsByRoomQuery.data;
	const error =
		selectedRoom === "All"
			? allRoomBookingsQuery.error
			: roomBookingsByRoomQuery.error;
	const isFetching =
		selectedRoom === "All"
			? allRoomBookingsQuery.isFetching
			: roomBookingsByRoomQuery.isFetching;

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedRoomBooking, setSelectedRoomBooking] =
		useState<RoomBookingRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<RoomBookingRead>) {
		setSelectedRoomBooking(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedRoomBooking(null);
	}

	// Mutations for adding, deleting, and editing bookings
	const addBooking = useMutation({
		...createRoomBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		},
		throwOnError: false,
	});

	const deleteBooking = useMutation({
		...removeRoomBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		},
		throwOnError: false,
	});

	const editBooking = useMutation({
		...updateRoomBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		},
		throwOnError: false,
	});

	// Keep the current calendar view while this page is mounted
	const [calendarView, setCalendarView] = useState<string | undefined>(
		undefined,
	);
	// Keep the currently viewed date while this page is mounted
	const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

	if (isFetching) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	interface CustomRoomBookingData extends CustomEventData {
		// We define these manually to avoid having start_time and start as different fields
		room: string;
		council_id: number;
		council_name_sv: string;
		council_name_en: string;
	}

	// Map fetched bookings to calendar events
	const events: CalendarEvent<CustomRoomBookingData>[] =
		(data as RoomBookingRead[])?.map((booking) => ({
			id: booking.id.toString(),
			room: booking.room,
			council_id: booking.council.id,
			council_name_sv: booking.council.name_sv || "None",
			council_name_en: booking.council.name_en || "None",
			user_id: booking.user.id,
			title_sv: `${booking.council.name_sv} - ${booking.room}`,
			title_en: `${booking.council.name_en} - ${booking.room}`,
			start: booking.start_time,
			end: booking.end_time,
			description_sv: booking.description,
			description_en: booking.description,
		})) ?? [];

	// Handler for when calendar date range changes
	const handleDateRangeChange = (start: Date, end: Date) => {
		setVisibleDateRange({ start, end });
	};

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 font-bold text-primary">
				{t("admin:room_bookings.page_title")}
			</h3>
			<p className="py-3">{t("admin:room_bookings.page_description")}</p>
			<div className="py-2 w-64">
				<SelectFromOptions
					placeholder={t("admin:room_bookings.select_room") || "Välj rum"}
					options={[
						{ value: "LC", label: "LC" },
						{ value: "Alumni", label: "Alumni" },
						{ value: "SK", label: "SK" },
						{ value: "Hilbert Cafe", label: "Hilbert Cafe"},
						{ value: "All", label: t("admin:room_bookings.all_rooms") },
					]}
					value={selectedRoom}
					onChange={(value) => setSelectedRoom(value as room | "All")}
				/>
			</div>
			{/* Debug info to show current visible range */}
			{/* <div className="py-2 text-sm text-muted-foreground">
				Visible range: {visibleDateRange.start.toLocaleDateString()} - {visibleDateRange.end.toLocaleDateString()}
			</div> */}
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) =>
					addBooking.mutate(
						{
							body: {
								// Having to define this sux, having to type "as number" also does. Basically TODO: fix this
								room: event.room as "LC" | "Alumni" | "SK",
								start_time: event.start,
								end_time: event.end,
								description: event.description_sv,
								council_id: event.council_id as number,
								recur_interval_days: event.recur_interval_days as
									| number
									| undefined,
								recur_until: event.recur_until as Date | undefined,
							},
						},
						{
							onError: () => toast.error(t("admin:room_bookings.error_add")),
							onSuccess: () => {
								toast.success(t("admin:room_bookings.success_add"));
							},
						},
					)
				}
				handleDelete={(id) =>
					deleteBooking.mutate(
						{ path: { booking_id: Number(id) } },
						{
							onError: () =>
								toast.error(`${t("admin:room_bookings.error_delete")} ${id}`),
							onSuccess: () => {
								toast.success(t("admin:room_bookings.success_delete"));
							},
						},
					)
				}
				handleEdit={(event) => {
					if (!event.id) {
						toast.error(t("admin:room_bookings.error_missing_id"));
						return;
					}
					editBooking.mutate(
						{
							path: { booking_id: Number(event.id) },
							body: {
								start_time: event.start,
								end_time: event.end,
								description: event.description_sv,
							},
						},
						{
							onError: () =>
								toast.error(
									`${t("admin:room_bookings.error_edit")} ${event.id}`,
								),
							onSuccess: () => {
								toast.success(t("admin:room_bookings.success_edit"));
							},
						},
					);
				}}
			>
				<div className="py-4">
					<Tabs
						value={tab}
						onValueChange={(value) => {
							setTab(value);
							const params = new URLSearchParams(
								Array.from(searchParams.entries()),
							);
							params.set("tab", value);
							router.replace(`${pathname}?${params.toString()}`);
						}}
						className="flex flex-col w-full items-center"
					>
						<TabsList className="flex justify-center mb-2">
							<TabsTrigger value="calendar">
								{t("admin:room_bookings.calendar")}
							</TabsTrigger>
							<TabsTrigger value="list">
								{t("admin:room_bookings.list")}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="calendar" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:room_bookings.calendar")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:room_bookings.calendar_description")}
								</p>
							</div>

							<Separator />
							<Calendar
								showDescription={true}
								editDescription={true}
								handleOpenDetails={(event) => {
									if (event) {
										router.push(`/room-bookings/details?id=${event.id}`);
									}
								}}
								disableEdit={false}
								enableAllDay={false}
								enableRoomBookingProperties={true}
								defaultRoom={selectedRoom === "All" ? undefined : selectedRoom}
								onDateRangeChange={handleDateRangeChange}
								// Provide and persist the calendar view across tab switches
								defaultView={calendarView}
								onViewChange={setCalendarView}
								// Provide and persist the viewed date across tab switches
								defaultDate={calendarDate}
								onDateChange={setCalendarDate}
							/>
						</TabsContent>
						<TabsContent value="list" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:room_bookings.list")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:room_bookings.list_description")}
								</p>
							</div>
							<RoomBookingForm
								defaultRoom={selectedRoom === "All" ? "LC" : selectedRoom}
							/>
							<Separator />
							<AdminTable table={table} onRowClick={handleRowClick} />
							<RoomBookingEditForm
								open={openEditDialog}
								onClose={() => handleClose()}
								selectedRoomBooking={selectedRoomBooking as RoomBookingRead}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
		</div>
	);
}
