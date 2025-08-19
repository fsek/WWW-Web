import { getMyPrioritiesOptions } from "@/api/@tanstack/react-query.gen";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface SelectMyPrioritiesProps {
	value: string | null;
	onChange: (value: string | null) => void;
	filterList: string[];
}

export function SelectMyPriorities({
	value,
	onChange,
	filterList,
}: SelectMyPrioritiesProps) {
	const { t, i18n } = useTranslation("admin");
	const {
		data: priorities,
		error,
		isFetching,
	} = useQuery({
		...getMyPrioritiesOptions(),
		refetchOnWindowFocus: false,
	});

	const filteredPriorities =
		priorities?.filter((item) => filterList.includes(item)) ?? [];

	const selectedOption: Option | null =
		value && typeof value === "string" ? { value, label: value } : null;

	const handleChange = (selected: Option | readonly Option[] | null) => {
		if (Array.isArray(selected)) {
			if (selected.length > 0 && typeof selected[0].value === "string") {
				onChange(selected[0].value);
			} else {
				onChange(null);
			}
		} else if (selected && !Array.isArray(selected)) {
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

	if (error || isFetching) {
		return <StyledMultiSelect isDisabled={true} options={[]} />;
	}

	return (
		<StyledMultiSelect
			isMulti={false}
			options={filteredPriorities.map((priority) => {
				let label = priority || t("event_signup.unnamed_priority");
				if (i18n.language === "en") {
					switch (priority) {
						case "Nolla":
							label = "Mentee (new student)";
							break;
						case "Gruppfadder":
							label = "Mentor (group)";
							break;
						case "Uppdragsfadder":
							label = "Mentor (mission)";
							break;
						case "Fotograf":
							label = "Photographer";
							break;
						default:
							break;
					}
				}
				return {
					value: priority,
					label,
				};
			})}
			placeholder={t("event_signup.select_priority")}
			value={selectedOption}
			onChange={handleChange}
			isClearable={true}
		/>
	);
}
