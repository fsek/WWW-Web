"use client";
import { type CalendarEvent, initialEvents } from "@/utils/full-calendar-seed";
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

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [events, setEvents] = useState<CalendarEvent[]>(
		initialEvents.map((event) => ({
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
		setEvents((prevEvents) =>
			prevEvents.filter((event) => Number(event.id) !== Number(id)),
		);
	};

	return (
		<EventsContext.Provider
			value={{
				events,
				addEvent,
				deleteEvent,
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
