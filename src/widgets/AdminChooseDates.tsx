"use client";

import React from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface AdminChooseDatesProps {
	value: Date;
	onChange: (value: Date) => void;
}

export function AdminChooseDates({ value, onChange }: AdminChooseDatesProps) {
	const [date, setDate] = React.useState<Date | undefined>(
		value ? new Date(value) : undefined,
	);

	const handleDateChange = (newDate: Date | undefined) => {
		if (newDate) {
			const adjustedDate = new Date(newDate.getTime() + 60 * 60 * 1000);
			console.log("Adjusted Date (UTC+1):", adjustedDate.toISOString());
			onChange(adjustedDate);
		} else {
			// placeholder for invalid date
			onChange(new Date());
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
