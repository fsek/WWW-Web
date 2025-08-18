import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getEventPrioritiesOptions } from "@/api/@tanstack/react-query.gen";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";

export interface AdminChooseOnePriorityProps {
	priorities?: string[];
	value?: string;
	onChange?: (value: string | null) => void;
	className?: string;
}

export function AdminChooseOnePriority({
	priorities,
	value = "",
	onChange,
	className = "",
}: AdminChooseOnePriorityProps) {
	const { t } = useTranslation("admin");

	const { data, error, isFetching } = useQuery({
		...getEventPrioritiesOptions(),
		refetchOnWindowFocus: false,
	});

	const availablePriorities = data ?? [];

	if (isFetching) {
		return (
			<StyledMultiSelect isDisabled={true} options={[]} className={className} />
		);
	}

	if (error) {
		return <p>{t("error")}</p>;
	}

	if (!priorities || priorities.length === 0) {
		priorities = availablePriorities;
	}

	const selectedOption: Option | null =
		value && typeof value === "string" ? { value, label: value } : null;

	// This is super cursed but is forced by type checking and just works (TM)
	const handleChange = (selected: Option | readonly Option[] | null) => {
		if (!onChange) return;
		if (Array.isArray(selected)) {
			// Since isMulti is false, this should not happen, but handle gracefully
			if (selected.length > 0 && typeof selected[0].value === "string") {
				onChange(selected[0].value);
			} else {
				onChange(null);
			}
		} else if (selected && !Array.isArray(selected)) {
			// selected is Option
			const selectedValue = (selected as Option).value;
			if (typeof selectedValue === "string") {
				onChange(selectedValue);
			} else {
				onChange(null);
			}
		} else {
			onChange(null);
		}
	};

	return (
		<StyledMultiSelect
			isMulti={false}
			options={priorities.map((priority) => ({
				value: priority,
				label: priority,
			}))}
			placeholder={t("choose_priorities")}
			className={className}
			value={selectedOption}
			onChange={handleChange}
			isClearable={true}
		/>
	);
}

export default AdminChooseOnePriority;
