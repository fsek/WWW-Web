import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getEventPrioritiesOptions } from "@/api/@tanstack/react-query.gen";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";
import { _0Enum } from "@/api";
import { object } from "zod";

export interface AdminChooseMentorGroupTypeProps {
	mentor_group_types?: string[];
	value?: string | string[];
	onChange?: (value: string | string[]) => void;
	className?: string;
}

export function AdminChooseMentorGroupTypes({
	mentor_group_types,
	value = [],
	onChange,
	className = "",
}: AdminChooseMentorGroupTypeProps) {
	const { t } = useTranslation("admin");

	const availableMentorGroupTypes = Object.values(_0Enum);

	if (!mentor_group_types || mentor_group_types.length === 0) {
		mentor_group_types = availableMentorGroupTypes;
	}

	// Convert string value to array if needed
	const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

	// Convert current values to options format
	const selectedOptions: Option[] = selectedValues.map((val) => ({
		value: val,
		label: t(`nollning.groups.${val}`),
	}));

	const handleChange = (selected: readonly Option[] | Option | null) => {
		if (!onChange) return;

		if (Array.isArray(selected)) {
			const newValues = selected.map((option) =>
				typeof option.value === "string" ? option.value : String(option.value),
			);
			console.log(newValues);
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
			options={mentor_group_types.map((type) => ({
				value: type,
				label: t(`nollning.groups.${type}`),
			}))}
			placeholder={t("events.choose_mentor_group_types")}
			className={className}
			value={selectedOptions}
			onChange={handleChange}
		/>
	);
}

export default AdminChooseMentorGroupTypes;
