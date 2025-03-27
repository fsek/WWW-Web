// src/components/CalendarComponent.tsx
"use client"; // Required for hooks and event handlers

import React, { useState, useCallback, useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type SlotInfo,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import type { MyEvent } from "@/types/event"; // Adjust path if needed
import { EventModal } from "./EventModal"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using Card for structure

// Setup the localizer by providing the required date formatting functions
const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarComponentProps {
  initialEvents?: MyEvent[];
  onViewDetails: (event: MyEvent) => void; // Required prop for custom view action
  height?: string | number; // Optional height prop
}

export function CalendarComponent({
  initialEvents = [],
  onViewDetails,
  height = "70vh", // Default height
}: CalendarComponentProps) {
  const [events, setEvents] = useState<MyEvent[]>(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedEvent, setSelectedEvent] = useState<Partial<MyEvent> | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Memoize default date for performance
  const defaultDate = useMemo(() => new Date(), []);

  // Handler for clicking an empty slot
  const handleSelectSlot = useCallback(
    ({ start, end, action }: SlotInfo) => {
      // Ensure it's a click or drag-select action, not just navigating views
       if (action === 'click' || action === 'select') {
           setSelectedSlot({ start, end });
           setSelectedEvent(null); // Clear any selected event
           setModalMode("add");
           setModalOpen(true);
       }
    },
    [] // No dependencies needed if state setters are used directly
  );

  // Handler for clicking an existing event
  const handleSelectEvent = useCallback(
    (event: MyEvent) => {
      setSelectedEvent(event);
      setSelectedSlot(null); // Clear any selected slot
      setModalMode("edit");
      setModalOpen(true);
    },
    [] // No dependencies needed
  );

  // Handler for saving (add or edit)
  const handleSaveEvent = useCallback(
    (eventData: MyEvent) => {
      if (modalMode === "add") {
        setEvents((prev) => [...prev, eventData]);
      } else if (modalMode === "edit") {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventData.id ? eventData : ev))
        );
      }
      // Reset state after save
      setModalOpen(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
    },
    [modalMode] // Depends on the current mode
  );

    // Handler for deleting an event
    const handleDeleteEvent = useCallback((eventId: string) => {
        setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
        // Reset state after delete
        setModalOpen(false); // Ensure modal closes if delete happens from within it
        setSelectedEvent(null);
        setSelectedSlot(null);
    }, []);


  // Close modal handler
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Event Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: height }} className="calendar-container"> {/* Apply height here */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultDate={defaultDate}
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            style={{ height: '100%' }} // Make calendar fill the container height
            selectable // Enable clicking/dragging on slots
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            className="rbc-calendar" // Add a class for potential overrides
          />
        </div>

        <EventModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          // Pass either selected event data (for edit) or selected slot data (for add)
          eventData={modalMode === 'edit' ? selectedEvent! : selectedSlot!}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent} // Pass delete handler
          onViewDetails={onViewDetails} // Pass view details handler
        />
      </CardContent>
    </Card>
  );
}