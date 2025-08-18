"use client";

import { useEvents } from "@/utils/full-calendar-event-context";
// import "@/styles/calendar.css";
import type {
	DateSelectArg,
	DayCellContentArg,
	DayHeaderContentArg,
	EventChangeArg,
	EventClickArg,
	EventContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRef, useState, useEffect } from "react";
import CalendarNav from "./full-calendar-nav";
import {
	type CalendarEvent,
	earliestTime,
	latestTime,
} from "@/utils/full-calendar-seed";
import { getDateFromMinutes } from "@/lib/utils";
import { Card } from "./ui/card";
import { EventEditForm } from "./full-calendar-edit-form";
import { EventView } from "./full-calendar-event-view";
import { useTranslation } from "react-i18next";

// From: https://github.com/robskinney/shadcn-ui-fullcalendar-example

type EventItemProps = {
	info: EventContentArg;
};

type DayHeaderProps = {
	info: DayHeaderContentArg;
};

type DayRenderProps = {
	info: DayCellContentArg;
};

interface CalendarProps {
	showDescription: boolean;
	editDescription?: boolean;
	handleOpenDetails?: ((event?: CalendarEvent) => void) | null;
	disableEdit?: boolean;
	enableAllDay?: boolean;
	enableTrueEventProperties?: boolean;
	mini?: boolean;
	zoomWorkHours?: boolean;
	enableCarProperties?: boolean;
	disableConfirmField?: boolean;
	disableEditOfOthers?: boolean; // Disable editing of other users' bookings
	isMobile?: boolean;
	enableRoomBookingProperties?: boolean;
	defaultRoom?: "LC" | "Alumni" | "SK";
	onDateRangeChange?: (start: Date, end: Date) => void;
	enableCafeShiftProperties?: boolean;
	// Control the initial view and observe view changes
	defaultView?: string;
	onViewChange?: (viewType: string) => void;
	// Control the initial date and observe date changes
	defaultDate?: Date;
	onDateChange?: (date: Date) => void;
}

export default function Calendar({
	showDescription,
	editDescription,
	handleOpenDetails,
	disableEdit,
	enableAllDay = true,
	enableTrueEventProperties = false,
	mini = false,
	zoomWorkHours = false,
	enableCarProperties = false,
	disableConfirmField = false,
	disableEditOfOthers = false,
	isMobile = false,
	enableRoomBookingProperties = false,
	defaultRoom = "LC",
	onDateRangeChange,
	enableCafeShiftProperties,
	defaultView,
	onViewChange,
	defaultDate,
	onDateChange,
}: CalendarProps) {
	const { i18n, t } = useTranslation();
	const {
		events,
		setEventAddOpen,
		setEventEditOpen,
		eventViewOpen,
		setEventViewOpen,
	} = useEvents();

	const calendarRef = useRef<FullCalendar | null>(null);
	const [viewedDate, setViewedDate] = useState(defaultDate ?? new Date());
	const [selectedStart, setSelectedStart] = useState(new Date());
	const [selectedEnd, setSelectedEnd] = useState(new Date());
	const [selectedOldEvent, setSelectedOldEvent] = useState<
		CalendarEvent | undefined
	>();
	const [selectedEvent, setSelectedEvent] = useState<
		CalendarEvent | undefined
	>();
	const [isDrag, setIsDrag] = useState(false);

	const [visibleStart, setVisibleStart] = useState<Date>(new Date());
	const [visibleEnd, setVisibleEnd] = useState<Date>(new Date());

	const isEditable = !disableEdit;

	// Determine initial view based on mobile and mini settings
	const getInitialView = () => {
		// Prefer parent-provided defaultView if present
		if (defaultView) return defaultView;
		if (isMobile) {
			return mini ? "dayGridDay" : "timeGridFourDay";
		}
		return mini ? "dayGridWeek" : "timeGridWeek";
	};

	// Track current view to send to nav
	const [currentView, setCurrentView] = useState<string>(getInitialView());

	const handleEventClick = (info: EventClickArg) => {
		if (!info.event.start || !info.event.end) {
			// These checks should never fail, but just in case
			throw new Error("Event must have a start and end time.");
		}
		const event: CalendarEvent = {
			id: info.event.id,
			title_sv: info.event.title,
			description_sv: info.event.extendedProps.description_sv,
			backgroundColor: info.event.backgroundColor,
			start: info.event.start,
			end: info.event.end,
			all_day: info.event.allDay,
			...(enableTrueEventProperties
				? {
						council_id: info.event.extendedProps.council_id,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
						title_en: info.event.extendedProps.title_en,
						description_en: info.event.extendedProps.description_en,
						location: info.event.extendedProps.location,
						max_event_users: info.event.extendedProps.max_event_users,
						priorities: info.event.extendedProps.priorities,
						signup_start: new Date(info.event.extendedProps.signup_start),
						signup_end: new Date(info.event.extendedProps.signup_end),
						recurring: info.event.extendedProps.recurring,
						food: info.event.extendedProps.food,
						closed: info.event.extendedProps.closed,
						can_signup: info.event.extendedProps.can_signup,
						drink_package: info.event.extendedProps.drink_package,
						is_nollning_event: info.event.extendedProps.is_nollning_event,
						alcohol_event_type: info.event.extendedProps.alcohol_event_type,
						dress_code: info.event.extendedProps.dress_code,
						price: info.event.extendedProps.price,
						dot: info.event.extendedProps.dot,
					}
				: {}),
			...(enableCarProperties
				? {
						personal: info.event.extendedProps.personal,
						council_id: info.event.extendedProps.council_id,
						confirmed: info.event.extendedProps.confirmed,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
						user_id: info.event.extendedProps.user_id,
					}
				: {}),
			...(enableRoomBookingProperties
				? {
						room: info.event.extendedProps.room,
						council_id: info.event.extendedProps.council_id,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
					}
				: {}),
			...(enableCafeShiftProperties
				? {
						user_id: info.event.extendedProps.user_id,
						user_name: info.event.extendedProps.user_name,
					}
				: {}),
		};

		setIsDrag(false);
		setSelectedOldEvent(event);
		setSelectedEvent(event);
		setEventViewOpen(true);
	};

	const handleEventChange = (info: EventChangeArg) => {
		if (!info.event.start || !info.event.end) {
			throw new Error("Event must have a start and end time.");
		}
		const event: CalendarEvent = {
			id: info.event.id,
			title_sv: info.event.title,
			description_sv: info.event.extendedProps.description_sv,
			backgroundColor: info.event.backgroundColor,
			start: info.event.start,
			end: info.event.end,
			all_day: info.event.allDay,
			...(enableTrueEventProperties
				? {
						council_id: info.event.extendedProps.council_id,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
						title_en: info.event.extendedProps.title_en,
						description_en: info.event.extendedProps.description_en,
						location: info.event.extendedProps.location,
						max_event_users: info.event.extendedProps.max_event_users,
						priorities: info.event.extendedProps.priorities,
						signup_start: new Date(info.event.extendedProps.signup_start),
						signup_end: new Date(info.event.extendedProps.signup_end),
						recurring: info.event.extendedProps.recurring,
						food: info.event.extendedProps.food,
						closed: info.event.extendedProps.closed,
						can_signup: info.event.extendedProps.can_signup,
						drink_package: info.event.extendedProps.drink_package,
						is_nollning_event: info.event.extendedProps.is_nollning_event,
						alcohol_event_type: info.event.extendedProps.alcohol_event_type,
						dress_code: info.event.extendedProps.dress_code,
						price: info.event.extendedProps.price,
						dot: info.event.extendedProps.dot,
					}
				: {}),
			...(enableCarProperties
				? {
						personal: info.event.extendedProps.personal,
						council_id: info.event.extendedProps.council_id,
						confirmed: info.event.extendedProps.confirmed,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
						user_id: info.event.extendedProps.user_id,
					}
				: {}),
			...(enableRoomBookingProperties
				? {
						room: info.event.extendedProps.room,
						council_id: info.event.extendedProps.council_id,
						council_name_sv: info.event.extendedProps.council_name_sv,
						council_name_en: info.event.extendedProps.council_name_en,
					}
				: {}),
			...(enableCafeShiftProperties
				? {
						user_id: info.event.extendedProps.user_id,
						user_name: info.event.extendedProps.user_name,
					}
				: {}),
		};

		if (!info.oldEvent.start || !info.oldEvent.end) {
			throw new Error("Old event must have a start and end time.");
		}

		const oldEvent: CalendarEvent = {
			id: info.oldEvent.id,
			title_sv: info.oldEvent.title,
			description_sv: info.oldEvent.extendedProps.description_sv,
			backgroundColor: info.oldEvent.backgroundColor,
			start: info.oldEvent.start,
			end: info.oldEvent.end,
			all_day: info.oldEvent.allDay,
			...(enableTrueEventProperties
				? {
						council_id: info.oldEvent.extendedProps.council_id,
						council_name_sv: info.oldEvent.extendedProps.council_name_sv,
						council_name_en: info.oldEvent.extendedProps.council_name_en,
						title_en: info.oldEvent.extendedProps.title_en,
						description_en: info.oldEvent.extendedProps.description_en,
						location: info.oldEvent.extendedProps.location,
						max_event_users: info.oldEvent.extendedProps.max_event_users,
						priorities: info.oldEvent.extendedProps.priorities,
						signup_start: new Date(info.oldEvent.extendedProps.signup_start),
						signup_end: new Date(info.oldEvent.extendedProps.signup_end),
						recurring: info.oldEvent.extendedProps.recurring,
						food: info.oldEvent.extendedProps.food,
						closed: info.oldEvent.extendedProps.closed,
						can_signup: info.oldEvent.extendedProps.can_signup,
						drink_package: info.oldEvent.extendedProps.drink_package,
						is_nollning_event: info.oldEvent.extendedProps.is_nollning_event,
						alcohol_event_type: info.oldEvent.extendedProps.alcohol_event_type,
						dress_code: info.oldEvent.extendedProps.dress_code,
						price: info.oldEvent.extendedProps.price,
						dot: info.oldEvent.extendedProps.dot,
					}
				: {}),
			...(enableCarProperties
				? {
						personal: info.oldEvent.extendedProps.personal,
						council_id: info.oldEvent.extendedProps.council_id,
						confirmed: info.oldEvent.extendedProps.confirmed,
						council_name_sv: info.oldEvent.extendedProps.council_name_sv,
						council_name_en: info.oldEvent.extendedProps.council_name_en,
						user_id: info.oldEvent.extendedProps.user_id,
					}
				: {}),
			...(enableRoomBookingProperties
				? {
						room: info.oldEvent.extendedProps.room,
						council_id: info.oldEvent.extendedProps.council_id,
						council_name_sv: info.oldEvent.extendedProps.council_name_sv,
						council_name_en: info.oldEvent.extendedProps.council_name_en,
					}
				: {}),
			...(enableCafeShiftProperties
				? {
						user_id: info.oldEvent.extendedProps.user_id,
						user_name: info.oldEvent.extendedProps.user_name,
					}
				: {}),
		};

		setIsDrag(true);
		setSelectedOldEvent(oldEvent);
		setSelectedEvent(event);
		setEventEditOpen(true);
	};

	const EventItem = ({ info }: EventItemProps) => {
		const { event } = info;
		const [left, right] = info.timeText.split(" - ");

		return (
			<div className="overflow-hidden w-full">
				{info.view.type === "dayGridMonth" ||
				info.view.type === "dayGridWeek" ||
				info.view.type === "dayGridDay" ? (
					<div
						style={{ backgroundColor: info.backgroundColor }}
						className={
							"flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs"
						}
					>
						<p className="font-semibold text-gray-950 line-clamp-1 w-11/12">
							{event.title}
						</p>

						<p className="text-gray-800">{left}</p>
						<p className="text-gray-800">{right}</p>
					</div>
				) : (
					<div className="flex flex-col space-y-0 text-[0.5rem] sm:text-[0.6rem] md:text-xs">
						<p className="font-semibold w-full text-gray-950 line-clamp-1">
							{event.title}
						</p>
						<p className="text-gray-800 line-clamp-1">{`${left} - ${right}`}</p>
					</div>
				)}
			</div>
		);
	};

	const DayHeader = ({ info }: DayHeaderProps) => {
		const [weekday] = info.text.split(" ");

		return (
			<div className="flex items-center h-full overflow-hidden">
				{info.view.type === "timeGridDay" ? (
					<div className="flex flex-col rounded-sm">
						<p>
							{info.date.toLocaleDateString(i18n.language, {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
				) : info.view.type === "timeGridWeek" ||
					info.view.type === "dayGridWeek" ? (
					<div className="flex flex-col space-y-0.5 rounded-sm items-center w-full text-xs sm:text-sm md:text-md">
						<p className="flex font-semibold">{weekday}</p>
						{info.isToday ? (
							<div className="flex bg-black dark:bg-white h-6 w-6 rounded-full items-center justify-center text-xs sm:text-sm md:text-md">
								<p className="font-light dark:text-black text-white">
									{info.date.getDate()}
								</p>
							</div>
						) : (
							<div className="h-6 w-6 rounded-full items-center justify-center">
								<p className="font-light">{info.date.getDate()}</p>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col rounded-sm">
						<p>{weekday}</p>
					</div>
				)}
			</div>
		);
	};

	const DayRender = ({ info }: DayRenderProps) => {
		if (mini) {
			return null;
		}

		return (
			<div className="flex">
				{info.view.type === "dayGridMonth" && info.isToday ? (
					<div className="flex h-7 w-7 rounded-full bg-black dark:bg-white items-center justify-center text-sm text-white dark:text-black">
						{info.dayNumberText}
					</div>
				) : (
					<div className="flex h-7 w-7 rounded-full items-center justify-center text-sm">
						{info.dayNumberText}
					</div>
				)}
			</div>
		);
	};

	const handleDateSelect = (info: DateSelectArg) => {
		setSelectedStart(info.start);
		setSelectedEnd(info.end);
	};

	const earliestHour = getDateFromMinutes(earliestTime)
		.getHours()
		.toString()
		.padStart(2, "0");
	const earliestMin = getDateFromMinutes(earliestTime)
		.getMinutes()
		.toString()
		.padStart(2, "0");
	const latestHour = getDateFromMinutes(latestTime)
		.getHours()
		.toString()
		.padStart(2, "0");
	const latestMin = getDateFromMinutes(latestTime)
		.getMinutes()
		.toString()
		.padStart(2, "0");

	const calendarEarliestTime = `${earliestHour}:${earliestMin}`;
	const calendarLatestTime = `${latestHour}:${latestMin}`;

	// Normalize date based on view (month => first day of month)
	const normalizeDateForView = (date: Date | undefined, viewType: string) => {
		if (!date) return undefined;
		return viewType === "dayGridMonth"
			? new Date(date.getFullYear(), date.getMonth(), 1)
			: date;
	};

	// When parent provides a defaultDate or it changes, move calendar to it (normalized)
	useEffect(() => {
		if (!defaultDate) return;
		const target = normalizeDateForView(defaultDate, currentView);
		if (!target) return;
		if (viewedDate.getTime() === target.getTime()) return;
		setViewedDate(target);
		const api = calendarRef.current?.getApi();
		api?.gotoDate(target);
	}, [defaultDate, currentView, viewedDate]);

	return (
		<div className="space-y-5 flex-1 flex flex-col">
			<CalendarNav // Nav contains the add button which is why there's so many props
				calendarRef={calendarRef}
				start={selectedStart}
				end={selectedEnd}
				viewedDate={viewedDate}
				editDescription={editDescription ?? false}
				disableEdit={disableEdit}
				enableAllDay={enableAllDay}
				enableTrueEventProperties={enableTrueEventProperties}
				mini={mini}
				enableCarProperties={enableCarProperties}
				isMobile={isMobile}
				enableRoomBookingProperties={enableRoomBookingProperties}
				defaultRoom={defaultRoom}
				enableCafeShiftProperties={enableCafeShiftProperties}
				// Keep nav in sync with calendar view
				currentView={currentView}
				onChangeView={(view) => {
					setCurrentView(view);
					onViewChange?.(view);
				}}
			/>

			<Card className={`${isMobile ? "p-1" : "p-3"} flex-1`}>
				<FullCalendar
					ref={calendarRef}
					timeZone="local"
					locale={i18n.language}
					plugins={[
						dayGridPlugin,
						timeGridPlugin,
						multiMonthPlugin,
						interactionPlugin,
						listPlugin,
					]}
					initialView={getInitialView()}
					initialDate={normalizeDateForView(defaultDate, currentView)}
					views={{
						timeGridFourDay: {
							type: "timeGrid",
							duration: { days: 4 },
							buttonText: "4 Days",
						},
						dayGridDay: {
							type: "dayGrid",
							duration: { days: 3 },
							buttonText: "Day",
						},
					}}
					headerToolbar={false}
					slotMinTime={calendarEarliestTime}
					slotMaxTime={calendarLatestTime}
					allDaySlot={enableAllDay}
					allDayMaintainDuration={true}
					forceEventDuration={true}
					scrollTime={zoomWorkHours ? "08:00" : undefined}
					firstDay={1}
					height={mini || zoomWorkHours ? "100%" : isMobile ? "40vh" : "32vh"}
					contentHeight={mini || zoomWorkHours ? "100%" : "auto"}
					dayHeaderFormat={{
						weekday: isMobile ? "short" : "long",
					}}
					allDayContent={t("calendar:all_day")}
					displayEventEnd={true}
					windowResizeDelay={0}
					events={events}
					slotLabelFormat={{
						hour: "numeric",
						minute: "2-digit",
						hour12: false,
					}}
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						hour12: false,
					}}
					eventBorderColor={"black"}
					expandRows={true}
					dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
					eventContent={(eventInfo) => <EventItem info={eventInfo} />}
					dayHeaderContent={(headerInfo) => <DayHeader info={headerInfo} />}
					eventClick={(eventInfo) => handleEventClick(eventInfo)}
					eventChange={(eventInfo) => handleEventChange(eventInfo)}
					select={handleDateSelect}
					datesSet={(dates) => {
						// Keep internal/parent date in sync with the view’s canonical range start
						const newViewType = dates.view.type;
						const newViewDate = dates.view.currentStart ?? dates.start;

						setViewedDate(newViewDate);
						setVisibleStart(dates.start);
						setVisibleEnd(dates.end);

						if (onDateRangeChange) {
							onDateRangeChange(dates.start, dates.end);
						}

						// Update current view and notify parent
						setCurrentView(newViewType);
						onViewChange?.(newViewType);

						// Notify parent with a stable date for the view
						onDateChange?.(newViewDate);
					}}
					dateClick={isEditable ? () => setEventAddOpen(true) : undefined}
					nowIndicator
					editable={isEditable && !disableEditOfOthers}
					selectable
				/>
			</Card>

			{/* Render the EventAddForm and EventEditForm so it can appear when eventAddOpen is toggled (when clicking empty slots or dragging events) */}
			{/* {!disableEdit && (
				<EventAddForm
					start={selectedStart}
					end={selectedEnd}
					editDescription={editDescription ?? false}
					showButton={false}
					enableAllDay={enableAllDay}
				/>
			)} This is rendered in calendar nav already*/}

			{isEditable && !eventViewOpen && !disableEditOfOthers && (
				<EventEditForm
					oldEvent={selectedOldEvent}
					event={selectedEvent}
					isDrag={isDrag}
					editDescription={editDescription ?? false}
					showButton={false}
					enableAllDay={enableAllDay}
					enableTrueEventProperties={enableTrueEventProperties}
					enableCarProperties={enableCarProperties}
					disableConfirmField={disableConfirmField}
					enableRoomBookingProperties={enableRoomBookingProperties}
					enableCafeShiftProperties={enableCafeShiftProperties}
				/>
			)}

			<EventView
				event={selectedEvent}
				showDescription={showDescription}
				editDescription={editDescription ?? false}
				handleOpenDetails={handleOpenDetails}
				disableEdit={disableEdit ?? false}
				enableAllDay={enableAllDay}
				enableTrueEventProperties={enableTrueEventProperties}
				enableCarProperties={enableCarProperties}
				disableConfirmField={disableConfirmField}
				disableEditOfOthers={disableEditOfOthers}
				enableRoomBookingProperties={enableRoomBookingProperties}
				enableCafeShiftProperties={enableCafeShiftProperties}
			/>
		</div>
	);
}
