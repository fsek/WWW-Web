import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";
import { MENTOR_GROUP_TYPE_ENUM } from "@/constants";
import { useTranslation } from "react-i18next";

export interface AdminChooseMentorGroupTypeProps {
	mentor_group_types?: string[];
	value?: string | string[];
	onChange?: (value: string | string[]) => void;
	className?: string;
	disabled?: boolean;
}

export function AdminChooseMentorGroupTypes({
	mentor_group_types,
	value = [],
	onChange,
	className = "",
	disabled = false,
}: AdminChooseMentorGroupTypeProps) {
	const { t } = useTranslation("admin");

	const availableMentorGroupTypes: readonly string[] =
		mentor_group_types && mentor_group_types.length > 0
			? mentor_group_types
			: Object.values(MENTOR_GROUP_TYPE_ENUM);

	// Convert string value to array if needed
	const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

	// Convert current values to options format
	const selectedOptions: Option[] = selectedValues.map((val) => ({
		value: val,
		label: t(`nollning.groups.${val.toLowerCase()}`),
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
			options={availableMentorGroupTypes.map((type) => ({
				value: type,
				label: t(`nollning.groups.${type.toLowerCase()}`),
			}))}
			placeholder={t("events.choose_mentor_group_types")}
			className={className}
			value={selectedOptions}
			onChange={handleChange}
			isDisabled={disabled}
		/>
	);
}

export default AdminChooseMentorGroupTypes;
