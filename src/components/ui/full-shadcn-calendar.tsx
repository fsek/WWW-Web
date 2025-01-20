"use client";

// From: https://github.com/robskinney/shadcn-ui-fullcalendar-example

// Note: As of now, you can not edit, add or delete background events on the calendar permanently.

import { useEvents } from "@/context/full-calendar-event-context";
import "@/styles/calendar.css";
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

import { useRef, useState } from "react";
import CalendarNav from "./full-shadcn-calendar-nav";
import {
	type CalendarEvent,
	earliestTime,
	latestTime,
} from "@/utils/full-calendar-seed";
import { getDateFromMinutes } from "@/lib/utils";
import { Card } from "./card";
import { EventEditForm } from "./full-calendar-edit-form";
import { EventView } from "./full-calendar-event-view";

type EventItemProps = {
	info: EventContentArg;
};

type DayHeaderProps = {
	info: DayHeaderContentArg;
};

type DayRenderProps = {
	info: DayCellContentArg;
};

export default function Calendar() {
	const { events, setEventAddOpen, setEventEditOpen, setEventViewOpen } =
		useEvents();

	const calendarRef = useRef<FullCalendar | null>(null);
	const [viewedDate, setViewedDate] = useState(new Date());
	const [selectedStart, setSelectedStart] = useState(new Date());
	const [selectedEnd, setSelectedEnd] = useState(new Date());
	const [selectedOldEvent, setSelectedOldEvent] = useState<
		CalendarEvent | undefined
	>();
	const [selectedEvent, setSelectedEvent] = useState<
		CalendarEvent | undefined
	>();
	const [isDrag, setIsDrag] = useState(false);

	const handleEventClick = (info: EventClickArg) => {
		const event: CalendarEvent = {
			id: info.event.id,
			title: info.event.title,
			description: info.event.extendedProps.description,
			backgroundColor: info.event.backgroundColor,
			start: info.event.start!,
			end: info.event.end!,
		};

		setIsDrag(false);
		setSelectedOldEvent(event);
		setSelectedEvent(event);
		setEventViewOpen(true);
	};

	const handleEventChange = (info: EventChangeArg) => {
		const event: CalendarEvent = {
			id: info.event.id,
			title: info.event.title,
			description: info.event.extendedProps.description,
			backgroundColor: info.event.backgroundColor,
			start: info.event.start!,
			end: info.event.end!,
		};

		const oldEvent: CalendarEvent = {
			id: info.oldEvent.id,
			title: info.oldEvent.title,
			description: info.oldEvent.extendedProps.description,
			backgroundColor: info.oldEvent.backgroundColor,
			start: info.oldEvent.start!,
			end: info.oldEvent.end!,
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
				{info.view.type === "dayGridMonth" ? (
					<div
						style={{ backgroundColor: info.backgroundColor }}
						className={`flex flex-col rounded-md w-full px-2 py-1 line-clamp-1 text-[0.5rem] sm:text-[0.6rem] md:text-xs`}
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
							{info.date.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
				) : info.view.type === "timeGridWeek" ? (
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

	return (
		<div className="space-y-5">
			<CalendarNav
				calendarRef={calendarRef}
				start={selectedStart}
				end={selectedEnd}
				viewedDate={viewedDate}
			/>

			<Card className="p-3">
				<FullCalendar
					ref={calendarRef}
					timeZone="local"
					plugins={[
						dayGridPlugin,
						timeGridPlugin,
						multiMonthPlugin,
						interactionPlugin,
						listPlugin,
					]}
					initialView="timeGridWeek"
					headerToolbar={false}
					slotMinTime={calendarEarliestTime}
					slotMaxTime={calendarLatestTime}
					allDaySlot={false}
					firstDay={1}
					height={"32vh"}
					displayEventEnd={true}
					windowResizeDelay={0}
					events={events}
					slotLabelFormat={{
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
					}}
					eventTimeFormat={{
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
					}}
					eventBorderColor={"black"}
					contentHeight={"auto"}
					expandRows={true}
					dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
					eventContent={(eventInfo) => <EventItem info={eventInfo} />}
					dayHeaderContent={(headerInfo) => <DayHeader info={headerInfo} />}
					eventClick={(eventInfo) => handleEventClick(eventInfo)}
					eventChange={(eventInfo) => handleEventChange(eventInfo)}
					select={handleDateSelect}
					datesSet={(dates) => setViewedDate(dates.start)}
					dateClick={() => setEventAddOpen(true)}
					nowIndicator
					editable
					selectable
				/>
			</Card>
			<EventEditForm
				oldEvent={selectedOldEvent}
				event={selectedEvent}
				isDrag={isDrag}
				displayButton={false}
			/>
			<EventView event={selectedEvent} />
		</div>
	);
}
