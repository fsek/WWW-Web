import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	MegaphoneIcon,
	PartyPopperIcon,
	BriefcaseBusiness,
	GraduationCap,
} from "lucide-react";
import { useTranslation } from "node_modules/react-i18next";
import { cloneElement } from "react";

interface FeatureProps {
	icon: JSX.Element;
	title: string;
	description: string;
}

const features: FeatureProps[] = [
	{
		icon: <PartyPopperIcon />,
		title: "whatwedo.event.title",
		description: "whatwedo.event.description",
	},
	{
		icon: <GraduationCap />,
		title: "whatwedo.study.title",
		description: "whatwedo.study.description",
	},
	{
		icon: <MegaphoneIcon />,
		title: "whatwedo.representation.title",
		description: "whatwedo.representation.description",
	},
	{
		icon: <BriefcaseBusiness />,
		title: "whatwedo.career.title",
		description: "whatwedo.career.description",
	},
];

export const WhatWeDo = () => {
	const { t } = useTranslation("landingpage");
	return (
		<section id="activities" className="container text-center py-24 sm:py-32">
			<h2 className="text-5xl md:text-6xl font-bold ">
				{t("whatwedo.title_1")}
				<span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
					{t("whatwedo.title_2")}
				</span>
				{t("whatwedo.title_3")}
			</h2>
			<p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
				{t("whatwedo.subtitle")}
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				{features.map(({ icon, title, description }: FeatureProps) => (
					<Card key={title} className="bg-muted/50 gap-1">
						<CardHeader>
							<CardTitle className="grid gap-2 place-items-center">
								<span className="w-10 h-10 flex items-center justify-center">
									{cloneElement(icon, { size: 40 })}
								</span>
								{t(title)}
							</CardTitle>
						</CardHeader>
						<CardContent>{t(description)}</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
};
