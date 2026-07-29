import { ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Select, { type OnChangeValue } from "react-select";

export type Option = {
	value: string | number;
	label: string;
};

interface StyledMultiSelectProps {
	isMulti?: boolean;
	options: Option[];
	value?: Option | Option[] | null;
	onChange?: (selected: readonly Option[] | Option | null) => void;
	placeholder?: string;
	className?: string;
	isDisabled?: boolean;
	isClearable?: boolean;
}

/*
This is basically all Claude. Sorry!
*/
export default function StyledMultiSelect({
	isMulti = false,
	options,
	value,
	onChange,
	placeholder,
	className = "",
	isDisabled = false,
	isClearable = false,
}: StyledMultiSelectProps) {
	const { t } = useTranslation("admin");

	const handleChange = (selected: OnChangeValue<Option, boolean>) => {
		if (!onChange) return;
		onChange(selected);
	};

	return (
		<Select
			isMulti={isMulti}
			options={options}
			unstyled
			placeholder={placeholder || t("select")}
			value={value}
			onChange={handleChange}
			isDisabled={isDisabled}
			isClearable={isClearable}
			components={{
				DropdownIndicator: ({ innerProps }) => (
					<div {...innerProps}>
						<ChevronDownIcon className="text-muted-foreground size-4 opacity-50 pointer-events-none" />
					</div>
				),
			}}
			classNames={{
				container: () => `${className}`,
				control: ({ isFocused }) =>
					`min-h-9 rounded-md border px-3 py-1 text-sm
          bg-transparent dark:bg-input/30
          border-input shadow-xs
          !cursor-pointer
					aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:pointer-events-none
					transition-[color,box-shadow]
          ${isFocused ? "border-ring ring-[3px] ring-ring/50" : ""}`,
				multiValue: () =>
					"bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground rounded px-2 py-1 m-0.5 text-xs",
				multiValueLabel: () =>
					"text-primary-foreground dark:text-primary-foreground",
				multiValueRemove: () =>
					"text-primary-foreground hover:bg-destructive dark:text-foreground dark:hover:bg-destructive rounded-r px-1",
				menu: () =>
					"mt-2 border bg-popover text-popover-foreground rounded-md shadow-md z-50",
				menuList: () => "p-1 max-h-60 overflow-auto",
				option: ({ isFocused }) =>
					`relative flex items-center rounded-sm py-1.5 px-2 !text-sm !cursor-pointer select-none ${
						isFocused
							? "bg-accent text-accent-foreground"
							: "text-popover-foreground"
					}`,
				placeholder: () => "text-muted-foreground",
				input: () => "text-foreground",
				noOptionsMessage: () => "text-muted-foreground py-2 px-3 text-sm",
			}}
		/>
	);
}
