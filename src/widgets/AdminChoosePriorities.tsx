import { useTranslation } from 'react-i18next';
import Select, { type OnChangeValue } from 'react-select'

type Option = { value: string; label: string };
import { useQuery } from "@tanstack/react-query";
import { getEventPrioritiesOptions } from "@/api/@tanstack/react-query.gen";

export interface AdminChoosePrioritiesProps {
	priorities?: string[]
	value?: string | string[]
	onChange?: (value: string | string[]) => void
	className?: string
}

export function AdminChoosePriorities({
	priorities,
	value = [],
	onChange,
	className = ""
}: AdminChoosePrioritiesProps) {
	const { t } = useTranslation("admin");

	const { data, error, isFetching } = useQuery({
		...getEventPrioritiesOptions(),
	});

	const availablePriorities = data ?? [];

	if (isFetching) {
		return <p>{t("loading")}</p>;
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

	const handleChange = (selected: OnChangeValue<Option, true>) => {
		if (!onChange) return;

		const newValues = selected ? selected.map(option => option.value) : [];
		onChange(newValues);
	};

	return (
		<Select
			isMulti
			options={priorities.map((priority) => ({ value: priority, label: priority }))}
			placeholder={t("choose_priorities")}
			className={className}
			value={selectedOptions}
			onChange={handleChange}
		/>
	)
}

export default AdminChoosePriorities