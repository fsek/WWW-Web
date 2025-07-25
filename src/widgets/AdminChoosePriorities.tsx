import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getEventPrioritiesOptions } from "@/api/@tanstack/react-query.gen";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";

export interface AdminChoosePrioritiesProps {
	priorities?: string[];
	value?: string | string[];
	onChange?: (value: string | string[]) => void;
	className?: string;
}

export function AdminChoosePriorities({
	priorities,
	value = [],
	onChange,
	className = "",
}: AdminChoosePrioritiesProps) {
	const { t } = useTranslation("admin");

	const { data, error, isFetching } = useQuery({
		...getEventPrioritiesOptions(),
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

	// Convert string value to array if needed
	const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

	// Convert current values to options format
	const selectedOptions: Option[] = selectedValues.map((val) => ({
		value: val,
		label: val,
	}));

	const handleChange = (selected: readonly Option[] | Option | null) => {
		if (!onChange) return;

		if (Array.isArray(selected)) {
			const newValues = selected.map((option) =>
				typeof option.value === "string" ? option.value : String(option.value),
			);
			onChange(newValues);
		} else {
			// isMulti is true, so selected will be an array or null.
			// If it's null (e.g., cleared), we pass an empty array.
			onChange([]);
		}
	};

	return (
		<StyledMultiSelect
			isMulti={true}
			options={priorities.map((priority) => ({
				value: priority,
				label: priority,
			}))}
			placeholder={t("choose_priorities")}
			className={className}
			value={selectedOptions}
			onChange={handleChange}
		/>
	);
}

export default AdminChoosePriorities;
