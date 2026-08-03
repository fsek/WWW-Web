"use client";

import { DateTimePicker } from "@/components/ui/datetime-picker";
import { enUS, sv } from "date-fns/locale";
import type { DayPickerLocale } from "react-day-picker";
import { useTranslation } from "react-i18next";

type Granularity = "day" | "hour" | "minute" | "second";
interface AdminChooseDatesProps {
	value: Date | undefined;
	onChange: (value: Date) => void;
	granularity?: Granularity;
	placeholder?: string;
	disabled?: boolean;
	locale?: Partial<DayPickerLocale>;
}

export function AdminChooseDates({
	value,
	onChange,
	granularity = "minute",
	placeholder = undefined,
	disabled = false,
	locale = undefined,
}: AdminChooseDatesProps) {
	const { i18n } = useTranslation();

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

	locale ??= i18n.language.startsWith("en") ? enUS : sv;

	return (
		<div className="flex flex-col gap-3 lg:flex-row lg:gap-10">
			<div className="w-full space-y-2">
				<DateTimePicker
					className="border-border hover:border-ring dark:bg-input/30 dark:border-border dark:hover:border-ring"
					granularity={granularity}
					value={value}
					onChange={handleDateChange}
					weekStartsOn={1} // Monday
					locale={locale}
					showWeekNumber={false}
					showOutsideDays={true}
					displayFormat={{
						hour24: granularity === "day" ? "PPP" : "PPP HH:mm",
					}}
					placeholder={placeholder}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}
