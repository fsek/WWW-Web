"use client";
import { type CalendarEvent, initialEvents } from "@/utils/full-calendar-seed";       
import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

// interface Event { // I think this is fine to remove
// 	id: string;
// 	title_sv: string;
// 	description_sv: string;
// 	start: Date;
// 	end: Date;
// 	allDay: boolean;
// 	backgroundColor?: string;
// }

interface EventsContextType {
	events: CalendarEvent[];
	addEvent: (event: CalendarEvent) => void;
	deleteEvent: (id: string) => void;
	editEvent: (event: CalendarEvent) => void;
	eventViewOpen: boolean;
	setEventViewOpen: (value: boolean) => void;
	eventAddOpen: boolean;
	setEventAddOpen: (value: boolean) => void;
	eventEditOpen: boolean;
	setEventEditOpen: (value: boolean) => void;
	eventDeleteOpen: boolean;
	setEventDeleteOpen: (value: boolean) => void;
	availabilityCheckerEventAddOpen: boolean;
	setAvailabilityCheckerEventAddOpen: (value: boolean) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
	const context = useContext(EventsContext);
	if (!context) {
		throw new Error("useEvents must be used within an EventsProvider");
	}
	return context;
};

interface EventsProviderProps {
	children: ReactNode;
	initialCalendarEvents?: CalendarEvent[];
	eventColor?: string;
	handleDelete?: (id: string) => void;
	handleEdit?: (event: CalendarEvent) => void;
	handleAdd?: (event: CalendarEvent) => void;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({
	children,
	initialCalendarEvents,
	eventColor,
	handleDelete,
	handleEdit,
	handleAdd,
}) => {
	const [events, setEvents] = useState<CalendarEvent[]>(
		(initialCalendarEvents ?? initialEvents).map((event) => ({
			// uses initialEvents from full-calendar-seed.ts if none specified
			...event,
			title: event.title_sv,
			id: String(event.id),
			backgroundColor: eventColor ?? "#76c7ef",
			allDay: event.allDay ?? false,
		})),
	);
	const [eventViewOpen, setEventViewOpen] = useState(false);
	const [eventAddOpen, setEventAddOpen] = useState(false);
	const [eventEditOpen, setEventEditOpen] = useState(false);
	const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
	const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] =
		useState(false);

	const addEvent = (event: CalendarEvent) => {
		try {
			if (handleAdd) {
				// if handleAdd is defined, call it
				handleAdd(event);
			}
			setEvents((prevEvents) => [...prevEvents, event]);
		} catch (error) {
			console.error("Error adding event:", error);
		}
	};

	const deleteEvent = (id: string) => {
		try {
			if (handleDelete) {
				handleDelete(id);
			}
			setEvents((prevEvents) =>
				prevEvents.filter((event) => Number(event.id) !== Number(id)),
			);
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	const editEvent = (event: CalendarEvent) => {
		try {
			// Backend magic here
			if (handleEdit) {
				handleEdit(event);
			}
			// Frontend magic here
			setEvents((prevEvents) =>
				prevEvents.map((prevEvent) =>
					Number(prevEvent.id) === Number(event.id)
						? {
								...prevEvent,
								title_sv: event.title_sv,
								description_sv: event.description_sv,
								start: event.start,
								end: event.end,
								allDay: event.allDay,
							}
						: prevEvent,
				),
			);
		} catch (error) {
			console.error("Error editing event:", error);
		}
	};

	return (
		<EventsContext.Provider
			value={{
				events,
				addEvent,
				deleteEvent,
				editEvent,
				eventViewOpen,
				setEventViewOpen,
				eventAddOpen,
				setEventAddOpen,
				eventEditOpen,
				setEventEditOpen,
				eventDeleteOpen,
				setEventDeleteOpen,
				availabilityCheckerEventAddOpen,
				setAvailabilityCheckerEventAddOpen,
			}}
		>
			{children}
		</EventsContext.Provider>
	);
};
