import Obfuscate from "react-obfuscate";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

export default function EmergencyCard() {
	const { t } = useTranslation("contact");
	return (
		<Card className="px-8 md:px-12 w-full bg-destructive/10 border-destructive/30 dark:bg-destructive/50 border shadow-lg">
			<div className="text-2xl font-bold text-center text-destructive dark:text-destructive-foreground m-0 p-0">
				{t("emergency.title")}
			</div>
			<div className="grid grid-cols-1 xl:grid-cols-3 whitespace-pre-wrap wrap-normal">
				<div className="flex flex-col mt-3 text-base">
					<span className="font-bold">{t("emergency.text_ordf.self")}</span>
					<br />
					{t("emergency.text_ordf.name")} - Algot:{" "}
					<address>
						<Obfuscate
							email="ordf@fsektionen.se"
							style={{ textDecoration: "underline" }}
						/>
						<br />
						<Obfuscate
							tel="+46 072-525 09 88"
							style={{ textDecoration: "underline" }}
						/>
					</address>
				</div>
				<div className="flex flex-col mt-3 text-base">
					<span className="font-bold">{t("emergency.text_foset.self")}</span>
					<br />
					<address>
						<Obfuscate
							email="foset@fsektionen.se"
							style={{ textDecoration: "underline" }}
						/>
					</address>
					<br />
					Överfös Elina:{" "}
					<address>
						<Obfuscate
							tel="+46 073-772 59 55"
							style={{ textDecoration: "underline" }}
						/>
					</address>
					<br />
					Cofös Manne:{" "}
					<address>
						<Obfuscate
							tel="+46 070-948 78 39"
							style={{ textDecoration: "underline" }}
						/>
					</address>
				</div>
				<div className="flex flex-col mt-3 text-base">
					<span className="font-bold">{t("emergency.text_car.self")}</span>
					<br />
					{t("emergency.text_car.name1")} - Vic:{" "}
					<address>
						<Obfuscate
							email="bil@fsektionen.se"
							style={{ textDecoration: "underline" }}
						/>
						<br />
						<Obfuscate
							tel="+46 073-803 48 11"
							style={{ textDecoration: "underline" }}
						/>
					</address>
					<br />
					{t("emergency.text_car.name2")} - Alva:{" "}
					<address>
						<Obfuscate
							email="prylm@fsektionen.se"
							style={{ textDecoration: "underline" }}
						/>
						<br />
						<Obfuscate
							tel="+46 076-027 21 07"
							style={{ textDecoration: "underline" }}
						/>
					</address>
					<br />
					{t("emergency.text_car.name3")} - Algot:{" "}
					<address>
						<Obfuscate
							email="ordf@fsektionen.se"
							style={{ textDecoration: "underline" }}
						/>
						<br />
						<Obfuscate
							tel="+46 072-525 09 88"
							style={{ textDecoration: "underline" }}
						/>
					</address>
				</div>
			</div>
		</Card>
	);
}
