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
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { useTranslation } from "react-i18next";
import type { EventRead } from "@/api";

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

	// Map fetched bookings to calendar events
	const events: CalendarEvent[] =
		(data as EventRead[])?.map((event) => ({
			id: event.id.toString(),
			title: event.title_sv,
			start: event.starts_at,
			end: event.ends_at,
			allDay: event.all_day,
			description: event.description_sv,
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
							body: {
								council_id: 1,
								starts_at: event.start,
								ends_at: event.end,
								signup_start: event.start,
								signup_end: event.end,
								title_sv: event.title,
								title_en: event.title,
								description_sv: "test",
								description_en: "test",
								location: "test",
								max_event_users: 1,
								priorities: [],
								all_day: event.allDay,
								signup_not_opened_yet: true,
								recurring: false,
								drink: false,
								food: false,
								cash: false,
								closed: false,
								can_signup: false,
								drink_package: false,
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
								title_sv: event.title,
								title_en: event.title,
								description_sv: "test",
								description_en: "test",
								location: "test",
								max_event_users: 1,
								all_day: event.allDay,
								signup_not_opened_yet: true,
								recurring: false,
								drink: false,
								food: false,
								cash: false,
								closed: false,
								can_signup: false,
								drink_package: false,
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
						enableAllDay={false}
					/>
				</div>
			</EventsProvider>
		</div>
	);
}
