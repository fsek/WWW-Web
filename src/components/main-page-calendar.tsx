"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBookingMutation,
	getAllBookingOptions,
	getAllBookingQueryKey,
	removeBookingMutation,
	updateBookingMutation,
} from "@/api/@tanstack/react-query.gen";
import { Separator } from "@/components/ui/separator";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import type { CalendarEvent } from "@/utils/full-calendar-seed";
import { useTranslation } from "react-i18next";
import type { CarRead } from "@/api";

export default function MainPageCalendar() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	// Fetch booking data
	const { data, error, isFetching } = useQuery({
		...getAllBookingOptions(),
	});

	// Mutations for adding, deleting, and editing bookings
	const addBooking = useMutation({
		...createBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
		},
		throwOnError: false,
	});

	const deleteBooking = useMutation({
		...removeBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
		},
		throwOnError: false,
	});

	const editBooking = useMutation({
		...updateBookingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllBookingQueryKey() });
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
		(data as CarRead[])?.map((car) => ({
			id: car.booking_id.toString(),
			title: car.description,
			start: car.start_time,
			end: car.end_time,
			allDay: false,
			description: `user_id av bokare: ${car.user_id}`,
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
								description: event.title,
								start_time: event.start,
								end_time: event.end,
							},
						},
						{
							onError: (err) => console.error(t("admin:car.error_add"), err),
						},
					)
				}
				handleDelete={(id) =>
					deleteBooking.mutate(
						{ path: { booking_id: Number(id) } },
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
							path: { booking_id: Number(event.id) },
							body: {
								description: event.title,
								start_time: event.start,
								end_time: event.end,
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
						editDescription={false}
						handleOpenDetails={() => {}}
						disableEdit={false}
						enableAllDay={false}
					/>
				</div>
			</EventsProvider>
		</div>
	);
}
