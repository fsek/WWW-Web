"use client";
import { type CalendarEvent, type CustomEventData, initialEvents } from "@/utils/full-calendar-seed";       
import type React from "react";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
	initialCalendarEvents?: CalendarEvent<CustomEventData>[];
	eventColor?: string;
	handleDelete?: (id: string) => void;
	handleEdit?: (event: CalendarEvent<CustomEventData>) => void;
	handleAdd?: (event: CalendarEvent<CustomEventData>) => void;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({
	children,
	initialCalendarEvents,
	eventColor,
	handleDelete,
	handleEdit,
	handleAdd,
}) => {
  const { i18n } = useTranslation(); 
	const prevLangRef = useRef(i18n.language); 

	const [events, setEvents] = useState<CalendarEvent<CustomEventData>[]>(
		(initialCalendarEvents ?? initialEvents).map((event) => ({
			// uses initialEvents from full-calendar-seed.ts if none specified
			...event,
			title: event.title_sv,
			id: String(event.id),
			backgroundColor: eventColor ?? "#76c7ef",
			allDay: event.allDay ?? false,
		})),
	);

	// Update events when language changes
  useEffect(() => {
    const currentLang = i18n.language;

		// Only update if language has changed from previous value (dont just update when events change)
    if (prevLangRef.current !== currentLang) {
      prevLangRef.current = currentLang; 
    
			const transformedEvents = events.map(event => ({
				...event,
				title: currentLang === 'sv' ? event.title_sv : event.title_en
			}));
			
			setEvents(transformedEvents);
		}
  }, [i18n.language, events]);

	const [eventViewOpen, setEventViewOpen] = useState(false);
	const [eventAddOpen, setEventAddOpen] = useState(false);
	const [eventEditOpen, setEventEditOpen] = useState(false);
	const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
	const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] =
		useState(false);

	const addEvent = (event: CalendarEvent<CustomEventData>) => {
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

	const editEvent = (event: CalendarEvent<CustomEventData>) => {
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
