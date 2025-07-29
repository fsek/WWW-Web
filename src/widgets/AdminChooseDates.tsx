"use client";

import React from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { sv } from "date-fns/locale";

interface AdminChooseDatesProps {
	value: Date | undefined;
	onChange: (value: Date) => void;
	disabled?: boolean;
}

export function AdminChooseDates({
	value,
	onChange,
	disabled = false,
}: AdminChooseDatesProps) {
	const handleDateChange = (newDate: Date | undefined) => {
		if (newDate) {
			const adjustedDate = new Date(newDate.getTime());
			// console.log("Adjusted Date (UTC+1):", adjustedDate.toISOString());
			onChange(adjustedDate);
		} else {
			// placeholder for invalid date
			onChange(new Date());
		}
	};

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
			<div className="w-full space-y-2">
				<DateTimePicker
					granularity="minute"
					value={value}
					onChange={handleDateChange}
					weekStartsOn={1} // Monday
					locale={sv}
					showWeekNumber={false}
					showOutsideDays={true}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}
