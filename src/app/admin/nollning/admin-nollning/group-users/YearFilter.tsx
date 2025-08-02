import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

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
				placeholder="Select start year"
				clearable
				renderOption={(option: { label: string; value: string }) => (
					<span className="text-sm font-normal">{option.label}</span>
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
							Year must be between {MIN_YEAR} and {currentYear}
						</span>
					) : (
						<span className="text-gray-500 text-sm">No years found</span>
					)
				}
			/>
			{!inputValid && (
				<p className="text-red-500 text-sm mt-1">
					Year must be between {MIN_YEAR} and {currentYear}
				</p>
			)}
		</div>
	);
}