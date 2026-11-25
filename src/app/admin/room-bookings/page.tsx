"use client";

import { useMemo, useState } from "react";
import RoomBookingForm from "./RoomBookingForm";
import RoomBookingEditForm from "./RoomBookingEditForm";
import {
	createRoomBookingMutation,
	removeRoomBookingMutation,
	updateRoomBookingMutation,
	confirmRoomBookingMutation,
	getAllRoomBookingsOptions,
	getAllRoomBookingsQueryKey,
	getBookingsByRoomOptions,
	getBookingsByRoomQueryKey,
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
import type { RoomEnum } from "@/api";
import { ActionEnum, TargetEnum } from "@/api";
import { usePermissions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import getErrorMessage from "@/help_functions/getErrorMessage";

// Column setup
const columnHelper = createColumnHelper<RoomBookingRead>();
const baseColumns = [
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

	const permissions = usePermissions();
	const canManageBookings = permissions.hasRequiredPermissions([
		[ActionEnum.MANAGE, TargetEnum.ROOM_BOOKINGS],
	]);
	// Confirming bookings is (for now) hardcoded to the cafe in the backend
	const canConfirm = permissions.hasRequiredPermissions([
		[ActionEnum.MANAGE, TargetEnum.CAFE],
	]);

	// Cafe people without room booking permissions mostly care about the cafe
	const [selectedRoom, setSelectedRoom] = useState<RoomEnum | "All">(
		canConfirm && !canManageBookings ? "Hilbert Cafe" : "All",
	);
	const [showOnlyUnconfirmed, setShowOnlyUnconfirmed] = useState(false);

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
			query: { room: selectedRoom as `${RoomEnum}` },
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

	const invalidateBookings = () => {
		queryClient.invalidateQueries({ queryKey: getAllRoomBookingsQueryKey() });
		queryClient.invalidateQueries({
			queryKey: getBookingsByRoomQueryKey({
				query: { room: selectedRoom as `${RoomEnum}` },
			}),
		});
	};

	const confirmBooking = useMutation({
		...confirmRoomBookingMutation(),
		onSuccess: () => {
			invalidateBookings();
			toast.success(t("admin:room_bookings.success_confirm"));
		},
		onError: (err) => {
			toast.error(
				`${t("admin:room_bookings.error_confirm")}: ${getErrorMessage(err, t)}`,
			);
		},
		throwOnError: false,
	});

	const columns = [
		...baseColumns,
		columnHelper.accessor("confirmed", {
			header: t("admin:room_bookings.confirmed"),
			cell: (info) => {
				if (info.getValue()) return t("admin:yes");
				if (!canConfirm) return t("admin:no");
				return (
					<Button
						variant="outline"
						size="sm"
						className="border-yellow-500 text-yellow-700 bg-yellow-50"
						disabled={confirmBooking.isPending}
						onClick={(e) => {
							// Don't open the edit dialog
							e.stopPropagation();
							confirmBooking.mutate({
								path: { booking_id: info.row.original.id },
							});
						}}
					>
						<Check />
						{t("admin:room_bookings.confirm")}
					</Button>
				);
			},
		}),
	];

	const tableData = useMemo(() => {
		if (!data) return [];
		if (showOnlyUnconfirmed) {
			return (data as RoomBookingRead[]).filter((b) => !b.confirmed);
		}
		return data as RoomBookingRead[];
	}, [data, showOnlyUnconfirmed]);

	const table = useCreateTable({ data: tableData, columns });

	function handleRowClick(row: Row<RoomBookingRead>) {
		// Only room booking managers are allowed to edit bookings
		if (!canManageBookings) return;
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
		confirmed: boolean;
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
			confirmed: booking.confirmed,
			// Yellow for bookings that still need to be confirmed
			backgroundColor: booking.confirmed ? undefined : "#e6e600",
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
						{ value: "Hilbert Cafe", label: "Hilbert Cafe" },
						{ value: "All", label: t("admin:room_bookings.all_rooms") },
					]}
					value={selectedRoom}
					onChange={(value) => setSelectedRoom(value as RoomEnum | "All")}
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
								room: event.room as `${RoomEnum}`,
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
								handleConfirm={
									canConfirm
										? (event) => {
												if (!event?.id) return;
												confirmBooking.mutate({
													path: { booking_id: Number(event.id) },
												});
											}
										: null
								}
								disableEdit={!canManageBookings}
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
							{canManageBookings && (
								<RoomBookingForm
									defaultRoom={selectedRoom === "All" ? "LC" : selectedRoom}
								/>
							)}
							<Button
								variant="outline"
								onClick={() => setShowOnlyUnconfirmed((v) => !v)}
							>
								{showOnlyUnconfirmed
									? t("admin:room_bookings.show_all_bookings")
									: t("admin:room_bookings.show_only_unconfirmed")}
							</Button>
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
