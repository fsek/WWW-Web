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
		council_id: number;
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
			council_id: event.council_id,
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
				handleAdd={(event) => {
					console.error("Non-editable calendar, add not supported.", event);
					return;
				}
				}
				handleDelete={(id) => {
					console.error("Non-editable calendar, delete not supported.", id);
					return;
				}}
				handleEdit={(event) => {
					console.error("Non-editable calendar, edit not supported.", event);
					return;
				}}
			>
				<div className="py-4">
					<Calendar
						showDescription={true}
						editDescription={false}
						handleOpenDetails={() => {}}
						disableEdit={true}
						enableAllDay={true}
						enableTrueEventProperties={true}
					/>
				</div>
			</EventsProvider>
		</div>
	);
}
