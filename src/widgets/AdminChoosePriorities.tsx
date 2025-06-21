import { useTranslation } from 'react-i18next';
import Select from 'react-select'
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
	const selectedOptions = selectedValues.map(v => ({ value: v, label: v }));

	const handleChange = (selected: any) => {
		if (!onChange) return;
		
		// If multiselect, return array of values, otherwise single value
		const newValues = selected ? 
			(Array.isArray(selected) ? selected.map(option => option.value) : selected.value) :
			[];
			
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