import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import React from "react";
import { MENTOR_GROUP_TYPE_ENUM } from "@/constants";

interface Props {
	value: string;
	onChange: (value: string) => void;
}

const GroupTypeSelect = ({ value, onChange }: Props) => {
	const { t } = useTranslation("admin");

	return (
		<Select value={value.toString()} onValueChange={(val) => onChange(val)}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={t("nollning.groups.group_type")} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{Object.values(MENTOR_GROUP_TYPE_ENUM).map((type) => (
						<SelectItem key={type} value={type}>
							{t(`nollning.groups.${type.toLowerCase()}`)}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default GroupTypeSelect;
