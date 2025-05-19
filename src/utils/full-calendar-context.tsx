"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { calendarRef } from "./full-calendar-seed";

export function generateDaysInMonth(daysInMonth: number) {
	const daysArray = [];

	for (let day = 1; day <= daysInMonth; day++) {
		daysArray.push({
			value: String(day),
			label: String(day),
		});
	}

	return daysArray;
}

export function goPrev(calendarRef: calendarRef) {
	const calendarApi = calendarRef.current!.getApi();
	calendarApi.prev();
}

export function goNext(calendarRef: calendarRef) {
	const calendarApi = calendarRef.current!.getApi();
	calendarApi.next();
}

export function goToday(calendarRef: calendarRef) {
	const calendarApi = calendarRef.current!.getApi();
	calendarApi.today();
}

export function handleDayChange(
	calendarRef: calendarRef,
	currentDate: Date,
	day: string,
) {
	const calendarApi = calendarRef.current!.getApi();
	const newDate = currentDate.setDate(Number(day));
	calendarApi.gotoDate(newDate);
}

export function handleMonthChange(
	calendarRef: calendarRef,
	currentDate: Date,
	month: string,
) {
	const calendarApi = calendarRef.current!.getApi();
	const newDate = new Date(currentDate);
	newDate.setMonth(Number(month) - 1);
	calendarApi.gotoDate(newDate);
}

export function handleYearChange(
	calendarRef: calendarRef,
	currentDate: Date,
	e: ChangeEvent<HTMLInputElement>,
) {
	const calendarApi = calendarRef.current!.getApi();
	const newDate = currentDate.setFullYear(Number(e.target.value));
	calendarApi.gotoDate(newDate);
}

export function setView(
	calendarRef: calendarRef,
	viewName: string,
	setCurrentView: Dispatch<SetStateAction<string>>,
) {
	const calendarApi = calendarRef.current!.getApi();
	setCurrentView(viewName);
	calendarApi.changeView(viewName);
}
