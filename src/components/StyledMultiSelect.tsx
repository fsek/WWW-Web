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
}

export default function StyledMultiSelect({
	isMulti = false,
	options,
	value,
	onChange,
	placeholder,
	className = "",
	isDisabled = false,
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
			classNames={{
				container: () => `${className}`,
				control: ({ isFocused }) =>
					`min-h-[38px] rounded-md px-3 py-1 text-sm border 
          bg-background text-foreground
          ${
						isFocused
							? "border-ring ring-2 ring-ring/20 dark:border-ring dark:ring-ring/20"
							: "border-border hover:border-ring dark:border-border dark:hover:border-ring"
					}`,
				multiValue: () =>
					"bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground rounded px-2 py-1 m-0.5 text-xs",
				multiValueLabel: () =>
					"text-primary-foreground dark:text-primary-foreground",
				multiValueRemove: () =>
					"text-primary-foreground hover:bg-destructive dark:text-foreground dark:hover:bg-destructive rounded-r px-1",
				menu: () =>
					"mt-1 border border-border dark:border-border rounded-md shadow-lg bg-popover dark:bg-popover z-50",
				menuList: () => "py-1 max-h-60 overflow-auto",
				option: ({ isFocused, isSelected }) =>
					`px-3 py-2 text-sm cursor-pointer ${
						isSelected
							? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
							: isFocused
								? "bg-muted text-foreground dark:bg-muted dark:text-foreground"
								: "text-foreground hover:bg-muted dark:text-foreground dark:hover:bg-muted"
					}`,
				placeholder: () => "text-muted-foreground dark:text-muted-foreground",
				input: () => "text-foreground dark:text-foreground",
				noOptionsMessage: () =>
					"text-muted-foreground dark:text-muted-foreground py-2 px-3 text-sm",
			}}
		/>
	);
}
