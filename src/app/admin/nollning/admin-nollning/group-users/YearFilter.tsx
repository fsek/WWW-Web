import { useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState(value?.toString() || "");
	const [inputValid, setInputValid] = useState(true);

	const handleSelect = (year: string) => {
		if (isInputValid(year)) {
			setInputValid(true);
			setInputValue(year);
			onChange(Number(year));
			setOpen(false);
		} else {
			setInputValid(false);
		}
	};

	const handleClose = () => {
		setOpen(false);

		const parsed = Number.parseInt(inputValue);
		if (isInputValid(inputValue)) {
			setInputValid(true);
			onChange(Number.isNaN(parsed) ? null : parsed);
		} else {
			setInputValid(false);
			onChange(null); // treat invalid year as unselected
		}
	};

	const handleClear = () => {
		setInputValue("");
		onChange(null);
		setOpen(false);
	};

	return (
		<div className="w-full max-w-xs">
			<Popover
				open={open}
				onOpenChange={(next) => {
					if (next) {
						setInputValid(true);
						setOpen(next);
					} else {
						handleClose();
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-start p-3 ",
							!inputValid && "border-red-500 text-red-500",
							inputValue === "" && "text-gray-500",
						)}
					>
						{inputValue || "Select start year"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0 ">
					<ScrollArea className="h-[200px]">
						<div className="p-3">
							<Input
								placeholder="Enter year"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								className={cn(
									"mb-2 text-sm font-normal",
									!inputValid && "border-red-500",
								)}
							/>
							{!inputValid && (
								<p className="text-red-500 text-sm mt-1">
									Year must be between {MIN_YEAR} and {currentYear}
								</p>
							)}
							<div className="flex flex-col gap-1">
								<Button
									variant="ghost"
									className="w-full justify-start text-red-500 text-sm font-normal"
									onClick={handleClear}
								>
									Clear
								</Button>
								{recentYears.map((year) => (
									<Button
										key={year}
										variant="ghost"
										className="w-full justify-start text-sm font-normal"
										onClick={() => handleSelect(year)}
									>
										{year}
									</Button>
								))}
							</div>
						</div>
					</ScrollArea>
				</PopoverContent>
			</Popover>
		</div>
	);
}
