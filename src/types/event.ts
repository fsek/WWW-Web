// src/types/event.ts (or wherever you prefer)
export interface CalendarEvent {
	id: string; // Unique identifier
	title: string;
	description: string;
	start: Date;
	end: Date;
	allDay?: boolean; // Optional
}
