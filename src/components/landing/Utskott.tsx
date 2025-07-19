import CouncilGrid from "@/components/councilgrid";
import { useTranslation } from "react-i18next";
export const Utskott = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section id="councils" className="container text-center py-24 sm:py-32">
			<h2 className="text-3xl md:text-4xl font-bold ">{t("councils.title")}</h2>
			<p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
				{t("councils.subtitle")}
			</p>

			<CouncilGrid showInfo noLinks />
		</section>
	);
};
