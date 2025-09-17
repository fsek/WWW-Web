"use client";

import React, { useEffect, useState } from "react";
import { AdminChooseDates } from "./AdminChooseDates";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearableAdminChooseDatesProps {
	value: Date | undefined;
	onChange: (value: Date | undefined) => void;
}

export function ClearableAdminChooseDates({
	value,
	onChange,
}: ClearableAdminChooseDatesProps) {
	const [isCleared, setIsCleared] = useState(false);
	const [lastValue, setLastValue] = useState<Date | undefined>(value);

	useEffect(() => {
		if (value === undefined) {
			setIsCleared(true);
		} else {
			setIsCleared(false);
		}
	}, [value]);

	const handleChange = (date: Date) => {
		setIsCleared(false);
		setLastValue(date);
		onChange(date);
	};

	const handleToggle = () => {
		if (!isCleared) {
			setIsCleared(true);
			setLastValue(value);
			onChange(undefined);
		} else {
			setIsCleared(false);
			onChange(lastValue);
		}
	};

	return (
		<div className="flex items-center w-full gap-2">
			<div className="flex-1 min-w-0">
				<AdminChooseDates
					value={isCleared ? undefined : value}
					onChange={handleChange}
					disabled={isCleared}
				/>
			</div>

			<Button
				type="button"
				variant={isCleared ? "default" : "destructive"}
				size="icon"
				onClick={handleToggle}
				aria-label={isCleared ? "Restore date" : "Clear date"}
			>
				{isCleared ? <Plus /> : <X />}
			</Button>
		</div>
	);
}
