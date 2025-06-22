"use client";

import { useState } from "react";
import EventsForm from "./EventsForm";
import EventsEditForm from "./EventsEditForm";
import { createEventMutation, eventRemoveMutation, eventUpdateMutation, getAllEventsOptions, getAllEventsQueryKey } from "@/api/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventCreate, EventRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import type { CalendarEvent, CustomEventData } from "@/utils/full-calendar-seed";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/full-calendar";
import { useRouter } from "next/navigation";

// Column setup
const columnHelper = createColumnHelper<EventRead>();
const columns = [ // This might not be the best way to do this, see the car booking page for alternative
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
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<EventRead>) {
		setSelectedEvent(row.original);
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
		},
		throwOnError: false,
	});

	const deleteBooking = useMutation({
		...eventRemoveMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
		},
		throwOnError: false,
	});

	const editBooking = useMutation({
		...eventUpdateMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllEventsQueryKey() });
		},
		throwOnError: false,
	});
	

	if (isFetching) {
		return <p>{t("admin:loading")}</p>;
	}

	if (error) {
		return <p>{t("admin:error")}</p>;
	}

	interface CustomEventData_ extends CustomEventData { 
		// We define these manually to avoid having start_time and start as different fields
		council_id: number;
		council_name: string; 
		title_en: string;
		signup_start: Date;
		signup_end: Date;
		all_day: boolean;
		description_en: string;
		location: string;
		max_event_users: number;
		priorities: EventCreate["priorities"];
		signup_not_opened_yet: boolean;
		recurring: boolean;
		drink: boolean;
		food: boolean;
		cash: boolean;
		closed: boolean;
		can_signup: boolean;
		drink_package: boolean;
		is_nollning_event: boolean;
	};

	// Map fetched bookings to calendar events
	const events: CalendarEvent<CustomEventData_>[] =
		(data as EventRead[])?.map((event) => ({
			id: event.id.toString(),
			council_id: event.council_id, // Might need to change this later
			council_name: event.council?.name || "None",
			title_sv: event.title_sv,
			title_en: event.title_en,
			start: event.starts_at,
			end: event.ends_at,
			signup_start: event.signup_start,
			signup_end: event.signup_end,
			all_day: event.all_day,
			description_sv: event.description_sv,
			description_en: event.description_en,
			location: event.location,
			max_event_users: event.max_event_users,
			priorities: event.priorities.map(p => p.priority) as EventCreate["priorities"],
			signup_not_opened_yet: event.signup_not_opened_yet,
			recurring: event.recurring,
			drink: event.drink,
			food: event.food,
			cash: event.cash,
			closed: event.closed,
			can_signup: event.can_signup,
			drink_package: event.drink_package,
			is_nollning_event: event.is_nollning_event,
		})) ?? [];

	console.log("Events loaded:", events);

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera event
			</h3>
			<p className="py-3">
				Här kan du skapa event & redigera existerande event på hemsidan.
			</p>
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) =>
					addBooking.mutate(
						{
							body: { // Having to define this sux, having to type "as string" also does. Basically TODO: fix pls
								council_id: event.council_id as number,
								starts_at: event.start,
								ends_at: event.end,
								signup_start: event.start,
								signup_end: event.end,
								title_sv: event.title_sv,
								title_en: event.title_en as string,
								description_sv: event.description_sv,
								description_en: event.description_en as string,
								location: event.location as string,
								max_event_users: event.max_event_users as number,
								priorities: event.priorities as EventCreate['priorities'], // This might just work
								all_day: event.all_day as boolean,
								signup_not_opened_yet: event.signup_not_opened_yet as boolean,
								recurring: event.recurring as boolean,
								drink: event.drink as boolean,
								food: event.food as boolean,
								cash: event.cash as boolean,
								closed: event.closed as boolean,
								can_signup: event.can_signup as boolean,
								drink_package: event.drink_package as boolean,
								is_nollning_event: event.is_nollning_event as boolean,
							},
						},
						{
							onError: (err) => console.error(t("admin:events.error_add"), err),
						},
					)
				}
				handleDelete={(id) =>
					deleteBooking.mutate(
						{ path: { event_id: Number(id) } },
						{
							onError: (err) =>
								console.error(`${t("admin:events.error_delete")} ${id}`, err),
						},
					)
				}
				handleEdit={(event) => {
					if (!event.id) {
						console.error(t("admin:events.error_missing_id"), event);
						return;
					}
					editBooking.mutate(
						{
							path: { event_id: Number(event.id) },
							body: {
								council_id: event.council_id as number,
								starts_at: event.start,
								ends_at: event.end,
								signup_start: event.start,
								signup_end: event.end,
								title_sv: event.title_sv,
								title_en: event.title_en as string,
								description_sv: event.description_sv,
								description_en: event.description_en as string,
								location: event.location as string,
								max_event_users: event.max_event_users as number,
								all_day: event.all_day as boolean,
								signup_not_opened_yet: event.signup_not_opened_yet as boolean,
								recurring: event.recurring as boolean,
								drink: event.drink as boolean,
								food: event.food as boolean,
								cash: event.cash as boolean,
								closed: event.closed as boolean,
								can_signup: event.can_signup as boolean,
								drink_package: event.drink_package as boolean,
								is_nollning_event: event.is_nollning_event as boolean,
								priorities: event.priorities as EventCreate['priorities'], // This might just work
							},
						},
						{
							onError: (err) =>
								console.error(`${t("admin:events.error_edit")} ${event.id}`, err),
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
							<TabsTrigger value="calendar">{t("admin:events.calendar")}</TabsTrigger>
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
										router.push("/calendar/event-details?id=" + event.id)
									}
								}}
								disableEdit={false} // Also disables delete, add and dragging
								enableAllDay={true}
								enableTrueEventProperties={true}
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
