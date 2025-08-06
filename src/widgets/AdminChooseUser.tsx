import { adminGetAllUsersOptions } from "@/api/@tanstack/react-query.gen";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface AdminChooseUserProps {
	value: number;
	onChange: (value: number) => void;
}

export function AdminChooseUser({ value, onChange }: AdminChooseUserProps) {
	const { t, i18n } = useTranslation("admin");
	const {
		data: users,
		error,
		isFetching,
	} = useQuery({
		...adminGetAllUsersOptions(),
	});

	if (isFetching) {
		return <StyledMultiSelect isDisabled={true} options={[]} />;
	}

	if (error) {
		return <p>{t("loading")}</p>;
	}

	const lang = i18n.language.startsWith("sv") ? "sv" : "en";

	const options: Option[] =
		users?.map((item) => ({
			value: item.id.toString(),
			label: `${item.stil_id} - ${item.first_name} ${item.last_name}`,
		})) ?? [];

	const selectedOption =
		options.find((opt) => opt.value === value.toString()) ?? null;

	const handleChange = (selected: Option | readonly Option[] | null) => {
		// biome-ignore lint/suspicious/useIsArray: We need to do this to prevent TypeScript errors
		if (selected && !(selected instanceof Array)) {
			onChange(Number(selected.value));
		}
	};

	return (
		<StyledMultiSelect
			isMulti={false}
			options={options}
			placeholder={t("select_user")}
			value={selectedOption}
			onChange={handleChange}
		/>
	);
}
