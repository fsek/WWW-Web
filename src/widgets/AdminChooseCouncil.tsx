import { getAllCouncilsOptions } from "@/api/@tanstack/react-query.gen";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface AdminChooseCouncilProps {
	value: number;
	onChange: (value: number) => void;
}

export function AdminChooseCouncil({
	value,
	onChange,
}: AdminChooseCouncilProps) {
	const { t, i18n } = useTranslation("admin");
	const { data: councils, error } = useQuery({
		...getAllCouncilsOptions(),
		refetchOnWindowFocus: false,
	});

	if (error) {
		return <p>{t("loading")}</p>;
	}

	const lang = i18n.language.startsWith("sv") ? "sv" : "en";

	return (
		<Select
			value={value.toString()}
			onValueChange={(val) => onChange(Number(val))}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={t("select_council")} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>{t("available_councils")}</SelectLabel>
					{councils?.map((item) => (
						<SelectItem key={item.id} value={item.id.toString()}>
							{lang === "sv"
								? item.name_sv || t("unnamed_council")
								: item.name_en || t("unnamed_council")}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
