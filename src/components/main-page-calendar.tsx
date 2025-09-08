"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import Calendar from "@/components/full-calendar";
import { EventsProvider } from "@/utils/full-calendar-event-context";
import type {
	CalendarEvent,
	CustomEventData,
} from "@/utils/full-calendar-seed";
import type { EventCreate, EventRead } from "@/api";
import { useRouter } from "next/navigation";
import { LoadingErrorCard } from "./LoadingErrorCard";
import stripHtmlLinebreaks from "@/help_functions/stripHtmlLinebreaks";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface MainPageCalendarProps {
	mini?: boolean;
	zoomWorkHours?: boolean;
	isMobile?: boolean;
}

export default function MainPageCalendar({
	mini = false,
	zoomWorkHours = false,
	isMobile = false,
}: MainPageCalendarProps) {
	const router = useRouter();
	const { t } = useTranslation();

	// Fetch booking data
	const { data, error, isFetching } = useQuery({
		...getAllEventsOptions(),
		refetchOnWindowFocus: false,
	});

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
		alcohol_event_type: string;
		dress_code: string;
		price: number;
		signup_count: number;
		dot: string;
		lottery: boolean;
	}

	// Map fetched bookings to calendar events
	const events: CalendarEvent<CustomEventData_>[] =
		(data as EventRead[])?.map((event) => ({
			id: event.id.toString(),
			council_id: event.council_id,
			council_name_sv: event.council.name_sv,
			council_name_en: event.council.name_en,
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
			alcohol_event_type: event.alcohol_event_type,
			dress_code: event.dress_code,
			price: event.price,
			signup_count: event.signup_count,
			dot: event.dot,
			lottery: event.lottery,
		})) ?? [];

	// Adjust padding for mobile view
	const containerPadding = isMobile ? "px-2" : "px-8";

	return (
		<div
			className={`${containerPadding} ${mini || zoomWorkHours ? "h-full flex flex-col" : ""}`}
		>
			<Link
				href="/verify"
				className="text-center underline text-muted-foreground"
			>
				{t("calendar:verify_user")}
			</Link>
			<EventsProvider
				initialCalendarEvents={events}
				eventColor="#f6ad55"
				handleAdd={(event) => {
					console.error("Non-editable calendar, add not supported.", event);
					return;
				}}
				handleDelete={(id) => {
					console.error("Non-editable calendar, delete not supported.", id);
					return;
				}}
				handleEdit={(event) => {
					console.error("Non-editable calendar, edit not supported.", event);
					return;
				}}
			>
				<div
					className={`py-4 ${mini || zoomWorkHours ? "flex-1 flex flex-col h-full" : ""}`}
				>
					<Calendar
						showDescription={true}
						editDescription={false}
						handleOpenDetails={(event) => {
							if (event) {
								router.push(`/calendar/event-details?id=${event.id}`);
							}
						}}
						disableEdit={true}
						enableAllDay={true}
						enableTrueEventProperties={true}
						mini={mini}
						zoomWorkHours={zoomWorkHours}
						isMobile={isMobile}
					/>
				</div>
			</EventsProvider>
		</div>
	);
}
