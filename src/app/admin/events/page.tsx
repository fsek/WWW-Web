"use client";

import { useMemo, useState } from "react";
import EventsForm from "./EventsForm";
import EventsEditForm from "./EventsEditForm";
import {
	createEventMutation,
	eventRemoveMutation,
	eventUpdateMutation,
	getAllEventsOptions,
	getAllEventsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { toast } from "sonner";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventCreate, EventRead } from "@/api";
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
import { useRouter } from "next/navigation";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import stripHtmlLinebreaks from "@/help_functions/stripHtmlLinebreaks";

// Column setup
const columnHelper = createColumnHelper<EventRead>();

export default function Events() {
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const columns = useMemo(
		() => [
			columnHelper.accessor("title_sv", {
				header: t("admin:title_sv"),
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor("starts_at", {
				header: t("admin:starts_at"),
				cell: (info) => formatTime(info.getValue()),
			}),
			columnHelper.accessor("ends_at", {
				header: t("admin:ends_at"),
				cell: (info) => formatTime(info.getValue()),
			}),
			columnHelper.accessor("signup_start", {
				header: t("admin:signup_start"),
				cell: (info) => formatTime(info.getValue()),
			}),
			columnHelper.accessor("signup_end", {
				header: t("admin:signup_end"),
				cell: (info) => formatTime(info.getValue()),
			}),
		],
		[t],
	);

	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
		refetchOnWindowFocus: false,
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);
	const [searchTitle, setSearchTitle] = useState<string>("");

	// Filter data based on searchTitle (only for list tab) and memoize to keep table stable
	const filteredData = useMemo(() => {
		if (!data) return [];
		const lower = (searchTitle ?? "").toLowerCase();
		return data.filter(
			(event) =>
				event.title_sv.toLowerCase().includes(lower) ||
				event.title_en?.toLowerCase().includes(lower),
		);
	}, [data, searchTitle]);

	const table = useCreateTable({
		data: filteredData,
		columns,
	});

	function handleRowClick(row: Row<EventRead>) {
		// Ensure descriptions are provided as plain text to the edit form
		const processed = {
			...row.original,
			description_sv: stripHtmlLinebreaks(row.original.description_sv ?? ""),
			description_en: stripHtmlLinebreaks(row.original.description_en ?? ""),
		};
		setSelectedEvent(processed);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedEvent(null);
	}

	// Mutations for adding, deleting, and editing bookings
	const addBooking = useMutation({
		...createEventMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			toast.success(t("admin:events.success_add"));
		},
		throwOnError: false,
		onError: () => {
			toast.error(t("admin:events.error_add"));
		},
	});

	const deleteBooking = useMutation({
		...eventRemoveMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			toast.success(t("admin:events.success_delete"));
		},
		throwOnError: false,
		onError: () => {
			toast.error(t("admin:events.error_delete"));
		},
	});

	const editBooking = useMutation({
		...eventUpdateMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
			toast.success(t("admin:events.success_edit"));
		},
		throwOnError: false,
		onError: () => {
			toast.error(t("admin:events.error_edit"));
		},
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

	interface CustomEventData_ extends CustomEventData {
		// We define these manually to avoid having start_time and start as different fields
		council_id: number;
		council_name_sv: string;
		council_name_en: string;
		title_en: string;
		signup_start: Date;
		signup_end: Date;
		all_day: boolean;
		description_en: string;
		location: string;
		max_event_users: number;
		priorities: EventCreate["priorities"];
		recurring: boolean;
		food: boolean;
		closed: boolean;
		can_signup: boolean;
		drink_package: boolean;
		is_nollning_event: boolean;
		alcohol_event_type: EventCreate["alcohol_event_type"];
		dress_code: string;
		price: number;
		dot: EventCreate["dot"];
		lottery: boolean;
		signup_count: number;
	}

	// Map fetched bookings to calendar events
	const events: CalendarEvent<CustomEventData_>[] =
		(data as EventRead[])?.map((event) => ({
			id: event.id.toString(),
			council_id: event.council_id, // Might need to change this later
			council_name_sv: event.council?.name_sv || "None",
			council_name_en: event.council?.name_en || "None",
			title_sv: event.title_sv,
			title_en: event.title_en,
			start: event.starts_at,
			end: event.ends_at,
			signup_start: event.signup_start,
			signup_end: event.signup_end,
			all_day: event.all_day,
			description_sv: stripHtmlLinebreaks(event.description_sv),
			description_en: stripHtmlLinebreaks(event.description_en),
			location: event.location,
			max_event_users: event.max_event_users,
			priorities: event.priorities.map(
				(p) => p.priority,
			) as EventCreate["priorities"],
			recurring: event.recurring,
			food: event.food,
			closed: event.closed,
			can_signup: event.can_signup,
			drink_package: event.drink_package,
			is_nollning_event: event.is_nollning_event,
			alcohol_event_type:
				event.alcohol_event_type as EventCreate["alcohol_event_type"],
			dress_code: event.dress_code,
			price: event.price,
			dot: event.dot as EventCreate["dot"],
			lottery: event.lottery,
			signup_count: event.signup_count,
		})) ?? [];

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 font-bold text-primary">
				{t("admin:events.page_title")}
			</h3>
			<p className="py-3">{t("admin:events.page_description")}</p>
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) =>
					addBooking.mutate(
						{
							body: {
								// Having to define this sux, having to type "as string" also does. Basically TODO: fix pls
								council_id: event.council_id as number,
								starts_at: event.start,
								ends_at: event.end,
								signup_start: event.signup_start as Date,
								signup_end: event.signup_end as Date,
								title_sv: event.title_sv,
								title_en: event.title_en as string,
								description_sv: event.description_sv,
								description_en: event.description_en as string,
								location: event.location as string,
								max_event_users: event.max_event_users as number,
								priorities: event.priorities as EventCreate["priorities"], // This might just work
								all_day: event.all_day as boolean,
								recurring: event.recurring as boolean,
								food: event.food as boolean,
								closed: event.closed as boolean,
								can_signup: event.can_signup as boolean,
								drink_package: event.drink_package as boolean,
								is_nollning_event: event.is_nollning_event as boolean,
								alcohol_event_type: event.alcohol_event_type as
									| "Alcohol"
									| "Alcohol-Served"
									| "None",
								dress_code: event.dress_code as string,
								price: event.price as number,
								dot: event.dot as "None" | "Single" | "Double",
								lottery: event.lottery as boolean,
							},
						},
						{
							onError: () => toast.error(t("admin:events.error_add")),
						},
					)
				}
				handleDelete={(id) =>
					deleteBooking.mutate(
						{ path: { event_id: Number(id) } },
						{
							onError: () => toast.error(t("admin:events.error_delete")),
						},
					)
				}
				handleEdit={(event) => {
					if (!event.id) {
						toast.error(t("admin:events.error_missing_id"));
						return;
					}
					editBooking.mutate(
						{
							path: { event_id: Number(event.id) },
							body: {
								council_id: event.council_id as number,
								starts_at: event.start,
								ends_at: event.end,
								signup_start: event.signup_start as Date,
								signup_end: event.signup_end as Date,
								title_sv: event.title_sv,
								title_en: event.title_en as string,
								description_sv: event.description_sv,
								description_en: event.description_en as string,
								location: event.location as string,
								max_event_users: event.max_event_users as number,
								all_day: event.all_day as boolean,
								recurring: event.recurring as boolean,
								food: event.food as boolean,
								closed: event.closed as boolean,
								can_signup: event.can_signup as boolean,
								drink_package: event.drink_package as boolean,
								is_nollning_event: event.is_nollning_event as boolean,
								priorities: event.priorities as EventCreate["priorities"], // This might just work
								alcohol_event_type: event.alcohol_event_type as
									| "Alcohol"
									| "Alcohol-Served"
									| "None",
								dress_code: event.dress_code as string,
								price: event.price as number,
								dot: event.dot as "None" | "Single" | "Double",
							},
						},
						{
							onError: () => toast.error(t("admin:events.error_edit")),
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
							<TabsTrigger value="calendar">
								{t("admin:events.calendar")}
							</TabsTrigger>
							<TabsTrigger value="list">{t("admin:events.list")}</TabsTrigger>
						</TabsList>
						<TabsContent value="calendar" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:events.calendar")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:events.calendar_description")}
								</p>
							</div>

							<Separator />
							<Calendar
								showDescription={true}
								editDescription={true} // Note that setting this to false wont work with events. (not implemented in the list view)
								handleOpenDetails={(event) => {
									if (event) {
										router.push(`/calendar/event-details?id=${event.id}`);
									}
								}}
								disableEdit={false} // Also disables delete, add and dragging
								enableAllDay={true}
								enableTrueEventProperties={true}
								// Provide and persist the calendar view across tab switches
								defaultView={calendarView}
								onViewChange={setCalendarView}
								// Provide and persist the viewed date across tab switches
								defaultDate={calendarDate}
								onDateChange={setCalendarDate}
								showManageSignupsButton={true}
							/>
						</TabsContent>
						<TabsContent value="list" className="w-full px-5 space-y-5">
							<div className="space-y-0">
								<h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
									{t("admin:events.list")}
								</h2>
								<p className="text-xs md:text-sm font-medium">
									{t("admin:events.list_description")}
								</p>
							</div>
							{/* Search input for filtering by title/location */}
							<div className="py-3">
								<input
									type="search"
									placeholder={t("admin:events.search_title")}
									value={searchTitle}
									onChange={(e) => setSearchTitle(e.target.value)}
									className="w-96 border rounded px-3 py-2"
								/>
							</div>
							<EventsForm />
							<Separator />
							<AdminTable table={table} onRowClick={handleRowClick} />
							<EventsEditForm
								open={openEditDialog}
								onClose={() => handleClose()}
								selectedEvent={selectedEvent as EventRead}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</EventsProvider>
		</div>
	);
}
