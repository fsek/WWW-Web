import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const currentYear = new Date().getFullYear();
const recentYears = Array.from({ length: 8 }, (_, i) =>
	(currentYear - i).toString(),
);
const MIN_YEAR = 1961;

interface Props {
	value: number | null;
	onChange: (n: number | null) => void;
}

const isInputValid = (input: string) => {
	return (
		input === "" ||
		(!Number.isNaN(Number.parseInt(input)) &&
			Number.parseInt(input) <= currentYear &&
			Number.parseInt(input) >= MIN_YEAR)
	);
};

export default function StartYearFilter({ value, onChange }: Props) {
	const { t } = useTranslation("admin");
	const [inputValue, setInputValue] = useState(value?.toString() || "");
	const [inputValid, setInputValid] = useState(true);

	const handleChange = (val: string | null) => {
		if (val === null || val === "") {
			setInputValue("");
			setInputValid(true);
			onChange(null);
			return;
		}
		setInputValue(val);
		if (isInputValid(val)) {
			setInputValid(true);
			onChange(Number(val));
		} else {
			setInputValid(false);
			onChange(null);
		}
	};

	return (
		<div className="w-full max-w-sm">
			<Combobox
				options={recentYears.map((year) => ({
					label: year,
					value: year,
				}))}
				inputValue={inputValue}
				onInputChange={(val: string) => {
					setInputValue(val);
					if (isInputValid(val)) {
						setInputValid(true);
					} else {
						setInputValid(false);
					}
				}}
				value={inputValue === "" ? null : inputValue}
				onChange={handleChange}
				placeholder={t("nollning.group_members.select_start_year")}
				clearable
				renderOption={(option) => (
					<span className="text-sm font-normal">
						{typeof option.label === "string" ||
						typeof option.label === "number"
							? option.label
							: "Something went wrong"}
					</span>
				)}
				inputProps={{
					className: cn(
						"p-3 text-sm font-normal",
						!inputValid && "border-red-500 text-red-500",
					),
					"aria-invalid": !inputValid,
				}}
				noOptionsMessage={() =>
					!inputValid ? (
						<span className="text-red-500 text-sm">
							{t("nollning.group_members.year_invalid", {
								min: MIN_YEAR,
								max: currentYear,
							})}
						</span>
					) : (
						<span className="text-gray-500 text-sm">
							{t("nollning.group_members.no_years_found")}
						</span>
					)
				}
			/>
			{!inputValid && (
				<p className="text-red-500 text-sm mt-1">
					{t("nollning.group_members.year_invalid", {
						min: MIN_YEAR,
						max: currentYear,
					})}
				</p>
			)}
		</div>
	);
}
