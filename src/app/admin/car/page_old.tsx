"use client";

import { useState } from "react";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import formatTime from "@/help_functions/timeFormater";
import type { EventRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import { addHours } from 'date-fns'; 
import SimpleCalendar from "@/components/Custom-small-calendar"; // Adjust path
import type { MyEvent } from "@/types/event";

// Column setup
const columnHelper = createColumnHelper<EventRead>();
const columns = [
	columnHelper.accessor("title_sv", {
		header: "Svensk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("starts_at", {
		header: "Starttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("ends_at", {
		header: "Sluttid",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("signup_start", {
		header: "Anmälningsöppning",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.accessor("signup_end", {
		header: "Anmälningsavslut",
		cell: (info) => formatTime(info.getValue()),
	}),
];

export default function Events() {
	const { data, error, isPending } = useQuery({
		...getAllEventsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<EventRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedEvent(null);
	}

	if (isPending) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	// Example initial events
  const sampleEvents: MyEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly sync-up call',
      start: new Date(), // Starts now
      end: addHours(new Date(), 1), // Ends 1 hour from now
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'Submit phase 1 report',
      start: addHours(new Date(), 24), // Starts tomorrow same time
      end: addHours(new Date(), 25), // Ends 1 hour later
      allDay: false,
    },
  ];

  // Custom function to handle viewing event details
  const handleViewEventDetails = (event: MyEvent) => {
    console.log("Viewing details for:", event);
    // Replace with your actual logic, e.g., open a custom non-editable modal,
    // navigate to a details page, show a toast, etc.
    alert(`Viewing Event: ${event.title}\nDescription: ${event.description}\nStarts: ${event.start}\nEnds: ${event.end}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-12 lg:p-24">
      <div className="w-full max-w-6xl"> {/* Limit width for better layout */}
        <h1 className="text-3xl font-bold mb-6 text-center">My Calendar</h1>
        <SimpleCalendar
        />
      </div>
    </main>
  );

}
