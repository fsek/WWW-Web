import { type NextRequest, NextResponse } from "next/server";
import stripHtmlLinebreaks from "@/help_functions/stripHtmlLinebreaks";

interface EventExtendedProps {
	description?: string;
	location?: string;
}

interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end?: Date;
	allDay?: boolean;
	extendedProps?: EventExtendedProps;
}

const MS_ONE_DAY = 86400000;
const MS_SEVEN_DAYS = MS_ONE_DAY * 7;

// This endpoint provides a live calendar feed that updates automatically
export async function GET(request: NextRequest) {
	try {
		// Get fresh events data each time
		const events = await fetchLatestEvents(); // Fetch and transform event data from backend

		const icsContent = generateICS(events);

		return new Response(icsContent, {
			headers: {
				"Content-Type": "text/calendar; charset=utf-8",
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to generate calendar feed" },
			{ status: 500 },
		);
	}
}

function generateICS(events: CalendarEvent[]) {
	const now = new Date();
	const calendarName = "F-kalender";

	const icsContent = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//F-sektionen//${calendarName}//SV`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${calendarName}`,
		"X-WR-CALDESC:(Swedish) Alla framtida event inom F-sektionen",
		"X-WR-TIMEZONE:UTC",
		"REFRESH-INTERVAL;VALUE=DURATION:PT1H", // Refresh every hour
		"X-PUBLISHED-TTL:PT1H",
	];

	for (const event of events as CalendarEvent[]) {
		const startDate = new Date(event.start);
		const endDate = new Date(event.end || event.start);

		// Handle all-day events
		let dtStart: string;
		let dtEnd: string;
		if (event.allDay) {
			dtStart = `DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`;
			dtEnd = `DTEND;VALUE=DATE:${formatDateOnly(new Date(endDate.getTime() + MS_ONE_DAY))}`;
		} else {
			dtStart = `DTSTART:${formatICSDate(startDate)}`;
			dtEnd = `DTEND:${formatICSDate(endDate)}`;
		}

		icsContent.push(
			"BEGIN:VEVENT",
			`UID:event-${event.id}-sv@fsektionen.se`,
			dtStart,
			dtEnd,
			`SUMMARY:${escapeICSText(event.title)}`,
			`DESCRIPTION:${escapeICSText(event.extendedProps?.description || "")}`,
			`LOCATION:${escapeICSText(event.extendedProps?.location || "")}`,
			`DTSTAMP:${formatICSDate(now)}`,
		);

		icsContent.push("END:VEVENT");
	}

	icsContent.push("END:VCALENDAR");
	return icsContent.join("\r\n");
}

function formatICSDate(date: string | Date) {
	return `${new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function formatDateOnly(date: string | Date) {
	return `${new Date(date).toISOString().split("T")[0].replace(/-/g, "")}`;
}

function escapeICSText(text: string) {
	if (!text) return "";
	return (
		text
			// normalize all line breaks to \n first
			.replace(/\r\n|\r|\n/g, "\n")
			// then escape specials per RFC 5545 TEXT
			.replace(/\\/g, "\\\\")
			.replace(/;/g, "\\;")
			.replace(/,/g, "\\,")
			.replace(/\n/g, "\\n")
	);
}

async function fetchLatestEvents() {
	// TODO: Since we discard all old events anyway, we eventually want to create a backend route which
	// only gives us the old events to avoid the frontend server getting too much data
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || "http://host.docker.internal:8000";
	const backendRes = await fetch(`${baseUrl}/events/`);
	const data = await backendRes.json();

	// Transform the data to the correct format
	// Only use events in the future and one week back
	const events = Array.isArray(data)
		? data
				.filter(
					(event) =>
						new Date(event.ends_at).getTime() >
						new Date().getTime() - MS_SEVEN_DAYS,
				)
				.map((event) => ({
					id: String(event.id),
					title: event.title_sv,
					start: event.starts_at,
					end: event.ends_at,
					allDay: event.all_day,
					extendedProps: {
						description: stripHtmlLinebreaks(event.description_sv),
						location: event.location,
					},
				}))
		: [];

	return events;
}
