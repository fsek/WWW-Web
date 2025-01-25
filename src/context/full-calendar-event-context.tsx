"use client";
import { type CalendarEvent, initialEvents } from "@/utils/full-calendar-seed";
import { Hand } from "lucide-react";
import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

interface Event {
	id: string;
	title: string;
	description: string;
	start: Date;
	end: Date;
	color: string;
}

interface EventsContextType {
	events: CalendarEvent[];
	addEvent: (event: Event) => void;
	deleteEvent: (id: string) => void;
	editEvent: (event: Event) => void;
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

export const EventsProvider: React.FC<{
	children: ReactNode;
	initialCalendarEvents?: CalendarEvent[];
	handleDelete?: (id: string) => void;
	handleEdit?: (event: Event) => void;
}> = ({ children, initialCalendarEvents, handleDelete, handleEdit }) => {
	const [events, setEvents] = useState<CalendarEvent[]>(
		(initialCalendarEvents ?? initialEvents).map((event) => ({
			// uses initialEvents from full-calendar-seed.ts if none specified
			...event,
			id: String(event.id),
			color: event.backgroundColor,
		})),
	);
	const [eventViewOpen, setEventViewOpen] = useState(false);
	const [eventAddOpen, setEventAddOpen] = useState(false);
	const [eventEditOpen, setEventEditOpen] = useState(false);
	const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
	const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] =
		useState(false);

	const addEvent = (event: CalendarEvent) => {
		setEvents((prevEvents) => [...prevEvents, event]);
	};

	const deleteEvent = (id: string) => {
		try {
			if (handleDelete) {
				handleDelete({ id });
			}
			setEvents((prevEvents) =>
				prevEvents.filter((event) => Number(event.id) !== Number(id)),
			);
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	const editEvent = (event: Event) => {
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
								title: event.title,
								description: event.description,
								start: event.start,
								end: event.end,
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
