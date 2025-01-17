"use client";

import React from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface AdminChooseDatesProps {
	value: string;
	onChange: (value: string) => void;
}

export function AdminChooseDates({ value, onChange }: AdminChooseDatesProps) {
	const [date, setDate] = React.useState<Date | undefined>(
		value ? new Date(value) : undefined,
	);

	const handleDateChange = (newDate: Date | undefined) => {
		if (newDate) {
			const adjustedDate = new Date(newDate.getTime() + 60 * 60 * 1000);
			console.log("Adjusted Date (UTC+1):", adjustedDate.toISOString());
			onChange(adjustedDate.toISOString());
		} else {
			onChange("");
		}
		setDate(newDate);
	};

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
			<div className="w-72 space-y-2">
				<DateTimePicker
					granularity="minute"
					value={date}
					onChange={handleDateChange}
				/>
			</div>
		</div>
	);
}

// "use client";

// import React, { useEffect, useState } from "react";
// import { addDays, format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
// import type { DateRange } from "react-day-picker";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
// 	Popover,
// 	PopoverContent,
// 	PopoverTrigger,
// } from "@/components/ui/popover";
// import { DateTimePicker } from "@/components/ui/datetime-picker";

// /**
//  * Utility to combine the day/month/year from `datePart`
//  * with the hours/min/sec from `timePart`.
//  */
// function combineDateAndTime(datePart: Date, timePart: Date): Date {
// 	const combined = new Date(datePart);
// 	combined.setHours(timePart.getHours());
// 	combined.setMinutes(timePart.getMinutes());
// 	combined.setSeconds(timePart.getSeconds());
// 	combined.setMilliseconds(timePart.getMilliseconds());
// 	return combined;
// }

// interface AdminChooseDateRangeProps {
// 	/** The initially selected start Date (full date–time) */
// 	startsAt?: Date;
// 	/** The initially selected end Date (full date–time) */
// 	endsAt?: Date;
// 	/** Called whenever the date or time changes, passing back the final combined start + end. */
// 	onChange?: (start: Date, end: Date) => void;
// }

// /**
//  * Picks a date range (start + end) from a calendar, plus
//  * lets the user adjust the start time and end time.
//  * Calls `onChange` with fully combined start/end `Date` objects.
//  */
// export function AdminChooseDateRange({
// 	startsAt,
// 	endsAt,
// 	onChange,
// }: AdminChooseDateRangeProps) {
// 	// 1) Manage the "pure date" portion with react-day-picker's DateRange
// 	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
// 		// If we have startsAt/endsAt, keep just the date portion
// 		// (time is stripped out implicitly by the day-based range).
// 		const initialFrom = startsAt ? new Date(startsAt) : new Date();
// 		const initialTo = endsAt ? new Date(endsAt) : addDays(initialFrom, 1);

// 		return {
// 			from: initialFrom,
// 			to: initialTo,
// 		};
// 	});

// 	// 2) Manage separate time pickers for the start time and end time
// 	const [startTime, setStartTime] = useState<Date | undefined>(startsAt);
// 	const [endTime, setEndTime] = useState<Date | undefined>(endsAt);

// 	// 3) Whenever dateRange or startTime/endTime changes, combine them and call onChange
// 	useEffect(() => {
// 		if (
// 			dateRange?.from &&
// 			dateRange?.to &&
// 			startTime instanceof Date &&
// 			endTime instanceof Date
// 		) {
// 			const combinedStart = combineDateAndTime(dateRange.from, startTime);
// 			const combinedEnd = combineDateAndTime(dateRange.to, endTime);

// 			if (onChange) {
// 				onChange(combinedStart, combinedEnd);
// 			}
// 		}
// 	}, [dateRange, startTime, endTime, onChange]);

// 	return (
// 		<div className="flex flex-col gap-4">
// 			{/* (A) Calendar popover for picking the date range */}
// 			<div className={cn("grid gap-2")}>
// 				<Popover>
// 					<PopoverTrigger asChild>
// 						<Button
// 							variant={"outline"}
// 							className={cn("w-[300px] justify-start text-left font-normal")}
// 						>
// 							<CalendarIcon className="mr-2" />
// 							{dateRange?.from ? (
// 								dateRange.to ? (
// 									<>
// 										{format(dateRange.from, "LLL dd, y")} -{" "}
// 										{format(dateRange.to, "LLL dd, y")}
// 									</>
// 								) : (
// 									format(dateRange.from, "LLL dd, y")
// 								)
// 							) : (
// 								<span>Pick a date range</span>
// 							)}
// 						</Button>
// 					</PopoverTrigger>
// 					<PopoverContent className="w-auto p-0" align="start">
// 						<Calendar
// 							initialFocus
// 							mode="range"
// 							defaultMonth={dateRange?.from}
// 							selected={dateRange}
// 							onSelect={setDateRange}
// 							numberOfMonths={2}
// 						/>
// 					</PopoverContent>
// 				</Popover>
// 			</div>

// 			{/* (B) Time pickers for start and end times */}
// 			<div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
// 				<div>
// 					<p className="font-semibold mb-1">Start Time</p>
// 					<DateTimePicker
// 						granularity="minute"
// 						value={startTime}
// 						onChange={(val) => setStartTime(val || undefined)}
// 					/>
// 				</div>
// 				<div>
// 					<p className="font-semibold mb-1">End Time</p>
// 					<DateTimePicker
// 						granularity="minute"
// 						value={endTime}
// 						onChange={(val) => setEndTime(val || undefined)}
// 					/>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
