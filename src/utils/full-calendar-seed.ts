import type FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";

export type calendarRef = RefObject<FullCalendar | null>;

// setting earliest / latest available time in minutes since Midnight
export const earliestTime = 0;
export const latestTime = 24 * 60 - 1;

// This is kinda cursed imo
export const months_en = [
	{
		value: "1",
		label: "January",
	},
	{
		value: "2",
		label: "February",
	},
	{
		value: "3",
		label: "March",
	},
	{
		value: "4",
		label: "April",
	},
	{
		value: "5",
		label: "May",
	},
	{
		value: "6",
		label: "June",
	},
	{
		value: "7",
		label: "July",
	},
	{
		value: "8",
		label: "August",
	},
	{
		value: "9",
		label: "September",
	},
	{
		value: "10",
		label: "October",
	},
	{
		value: "11",
		label: "November",
	},
	{
		value: "12",
		label: "December",
	},
];

export const months_sv = [
	{
		value: "1",
		label: "Januari",
	},
	{
		value: "2",
		label: "Februari",
	},
	{
		value: "3",
		label: "Mars",
	},
	{
		value: "4",
		label: "April",
	},
	{
		value: "5",
		label: "Maj",
	},
	{
		value: "6",
		label: "Juni",
	},
	{
		value: "7",
		label: "Juli",
	},
	{
		value: "8",
		label: "Augusti",
	},
	{
		value: "9",
		label: "September",
	},
	{
		value: "10",
		label: "Oktober",
	},
	{
		value: "11",
		label: "November",
	},
	{
		value: "12",
		label: "December",
	},
];

const getRandomDays = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const currentDate = new Date();

export interface BaseEventData {
	id: string;
	title_sv: string;
	start: Date;
	end: Date;
	description_sv: string;
	backgroundColor?: string;
}

export type CustomEventData = Record<string, unknown>;

export type CalendarEvent<TCustomData extends object = CustomEventData> =
	BaseEventData & TCustomData;

export const initialEvents: CalendarEvent<Record<string, unknown>>[] = [
	{
		id: "1",
		title_sv: "These are fake events",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			12,
			15,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			13,
			0,
		),
		all_day: false,
		backgroundColor: "#AEC6E4",
		description_sv: "This is a daily meeting to go over today's tasks.",
	},
	{
		id: "2",
		title_sv: "If these show up, you need to add an event source",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 1,
			16,
			30,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 1,
			17,
			30,
		),
		all_day: false,
		backgroundColor: "#FFD1DC",
		description_sv: "Lunch at Cracker Barrel with integration clients.",
	},
	{
		id: "3",
		title_sv: "Counselor Meetup",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			18,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			18,
			45,
		),
		all_day: false,
		backgroundColor: "#B2E0B2",
		description_sv: "Conversation with counselor about progression.",
	},
	{
		id: "4",
		title_sv: "Team Retreat",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 3,
			8,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 3,
			18,
			45,
		),
		all_day: false,
		backgroundColor: "#FFB3BA",
		description_sv: "Team bonding and strategic planning.",
	},
	{
		id: "5",
		title_sv: "Time Management Workshop",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 5,
			10,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 5,
			15,
			30,
		),
		all_day: false,
		backgroundColor: "#FFDFBA",
		description_sv:
			"Improve your productivity with effective time management techniques.",
	},
	{
		id: "6",
		title_sv: "Health and Wellness Fair",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(20, 24),
			9,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(25, 29),
			15,
			0,
		),
		all_day: false,
		backgroundColor: "#B9FBC0",
		description_sv: "Explore health resources and wellness activities.",
	},
	{
		id: "7",
		title_sv: "Book Club Discussion",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(30, 34),
			18,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(35, 39),
			20,
			0,
		),
		all_day: false,
		backgroundColor: "#C3B1E1",
		description_sv: "Discussing this month's book selection with the club.",
	},
	{
		id: "8",
		title_sv: "Creative Writing Workshop",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(40, 44),
			14,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(45, 49),
			16,
			0,
		),
		all_day: false,
		backgroundColor: "#B2E7E0",
		description_sv: "Join us for a weekend of creative writing exercises.",
	},
	{
		id: "9",
		title_sv: "Charity Fundraiser",
		start: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(50, 54),
			19,
			0,
		),
		end: new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + getRandomDays(55, 59),
			22,
			0,
		),
		all_day: false,
		backgroundColor: "#F6C9D8",
		description_sv: "An evening of fun to raise funds for a good cause.",
	},
];
