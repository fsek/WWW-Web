"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createEventMutation,
	getAllEventsOptions,
	getAllEventsQueryKey,
	eventRemoveMutation,
	eventUpdateMutation,
} from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import type { CalendarEvent, CustomEventData } from "@/utils/full-calendar-seed";
import { useTranslation } from "react-i18next";
import type { EventCreate, EventRead} from "@/api";

export default function MainPageCalendar() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	// Fetch booking data
	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
	});

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

	return (
		<div className="px-8">
			<Separator />

			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) =>
					addBooking.mutate(
						{
							body: { // Having to define this sux, having to type "as string" also does. Basically TODO: fix pls
								council_id: 1,
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
							onError: (err) => console.error(t("admin:car.error_add"), err),
						},
					)
				}
				handleDelete={(id) =>
					deleteBooking.mutate(
						{ path: { event_id: Number(id) } },
						{
							onError: (err) =>
								console.error(`${t("admin:car.error_delete")} ${id}`, err),
						},
					)
				}
				handleEdit={(event) => {
					if (!event.id) {
						console.error(t("admin:car.error_missing_id"), event);
						return;
					}
					editBooking.mutate(
						{
							path: { event_id: Number(event.id) },
							body: {
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
							},
						},
						{
							onError: (err) =>
								console.error(`${t("admin:car.error_edit")} ${event.id}`, err),
						},
					);
				}}
			>
				<div className="py-4">
					<Calendar
						showDescription={true}
						editDescription={true}
						handleOpenDetails={() => {}}
						disableEdit={false}
						enableAllDay={true}
						enableTrueEventProperties={true}
					/>
				</div>
			</EventsProvider>
		</div>
	);
}
