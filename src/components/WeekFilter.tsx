import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectSeparator,
} from "@/components/ui/select";

const weekOptions = Array.from({ length: 5 }, (_, i) => i.toString());
const MIN_WEEK = 0;
const MAX_WEEK = 4;

interface Props {
	value: number | null;
	onChange: (n: number | null) => void;
}

export default function WeekFilter({ value, onChange }: Props) {
	const { t } = useTranslation("admin");
	const [inputValue, setInputValue] = useState(value?.toString() || "");
	const [inputValid, setInputValid] = useState(true);

	const handleChange = (val: string) => {
		setInputValue(val);
		if (val === "clear") {
			setInputValid(true);
			onChange(null);
			return;
		}
		setInputValid(true);
		onChange(Number(val));
	};

	return (
		<div className="w-full max-w-sm">
			<Select value={inputValue} onValueChange={handleChange}>
				<SelectTrigger
					className={cn(
						"p-3 text-sm font-normal w-full rounded border",
						!inputValid && "border-red-500 text-red-500",
					)}
					aria-invalid={!inputValid}
				>
					<SelectValue placeholder={t("week_selector.placeholder")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="clear">{t("week_selector.show_all")}</SelectItem>
					<SelectSeparator />
					{weekOptions.map((week) => (
						<SelectItem key={week} value={week}>
							{t("week_selector.week", { week })}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{!inputValid && (
				<p className="text-red-500 text-sm mt-1">
					{t("week_selector.invalid", { min: MIN_WEEK, max: MAX_WEEK })}
				</p>
			)}
		</div>
	);
}
