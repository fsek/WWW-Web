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

interface Props {
	value: string;
	onChange: (value: string) => void;
}

const GroupTypeSelect = ({ value, onChange }: Props) => {
	const { t } = useTranslation("admin");
	const groupTypes: { [key: string]: string } = {
		Fadder: "Mentor",
		Uppdrag: "Mission",
		Standard: "Default",
		Utskott: "Committee",
		Mentor: "Mentor",
		Mission: "Mission",
		Default: "Default",
		Committee: "Committee",
	};

	return (
		<Select value={value.toString()} onValueChange={(val) => onChange(val)}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={t("nollning.groups.group_type")} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{[
						t("nollning.groups.fadder"),
						t("nollning.groups.uppdrag"),
						t("nollning.groups.standard"),
						t("nollning.groups.utskott"),
					]?.map((item) => (
						<SelectItem key={item} value={groupTypes[item]}>
							{item || t("unnamed_council")}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default GroupTypeSelect;
