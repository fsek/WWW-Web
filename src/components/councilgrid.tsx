"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
	BookOpen,
	Coffee,
	Users,
	Shield,
	Archive,
	Users2,
	Server,
	ClipboardList,
	LayoutGrid,
	SlidersHorizontal,
	MoreHorizontal,
	Beer,
} from "lucide-react";

const councils = [
	{ key: "bokforlaget", url: "/councils/bokforlaget", icon: BookOpen },
	{ key: "cafemasteriet", url: "/councils/cafemasteriet", icon: Coffee },
	{
		key: "externa-representanter",
		url: "/councils/externa-representanter",
		icon: Users,
	},
	{ key: "foset", url: "/councils/foset", icon: Shield },
	{
		key: "kulturministeriet",
		url: "/councils/kulturministeriet",
		icon: LayoutGrid,
	},
	{ key: "fnu", url: "/councils/fnu", icon: ClipboardList },
	{ key: "prylmasteriet", url: "/councils/prylmasteriet", icon: Archive },
	{ key: "samvetet", url: "/councils/samvetet", icon: SlidersHorizontal },
	{
		key: "sanningsministeriet",
		url: "/councils/sanningsministeriet",
		icon: Server,
	},
	{ key: "sekret-service", url: "/councils/sekret-service", icon: Shield },
	{ key: "sexmasteriet", url: "/councils/sexmasteriet", icon: Beer },
	{ key: "studieradet", url: "/councils/studieradet", icon: Users2 },
	{ key: "styrelsen", url: "/councils/styrelsen", icon: Users },
	{ key: "ovriga", url: "/councils/ovriga", icon: MoreHorizontal },
];

export default function CouncilGrid({
	showInfo = false,
	noLinks = false,
}: { noLinks?: boolean; showInfo?: boolean }) {
	const { t } = useTranslation();

	return (
		<div className="p-14 bg-background">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{councils.map(
					({ key, url, icon: Icon }) => (
						// noLinks ? (
						// 	<Card
						// 		key={key}
						// 		className="items-center p-6 rounded-2xl cursor-default bg-muted/50 gap-2 hover:shadow-md transition-shadow place-items-center justify-center"
						// 	>
						// 		<CardHeader className="flex flex-col items-center whitespace-nowrap">
						// 			<Icon className="h-12 w-12 mb-4 stroke-current text-primary justify-center" />
						// 			<span className="text-lg font-medium text-foreground">
						// 				{t(`utskott:${key}.self`)}
						// 			</span>
						// 		</CardHeader>
						// 		<CardContent>
						// 			<span className="text-sm text-muted-foreground">
						// 				{showInfo ? t(`utskott:${key}.info`) : ""}
						// 			</span>
						// 		</CardContent>
						// 	</Card>
						// ) : (
						<Link
							key={key}
							href={url}
							className={`flex flex-col items-center p-6 bg-card rounded-2xl shadow-md hover:shadow-lg transition-shadow hover:bg-card-hover ${noLinks ? "pointer-events-none cursor-none" : "cursor-pointer"}`}
						>
							<Icon className="h-12 w-12 mb-4 stroke-current text-primary" />
							<span className="text-lg font-medium text-foreground">
								{t(`utskott:${key}.self`)}
							</span>
							<span className="text-sm text-muted-foreground">
								{showInfo ? t(`utskott:${key}.info`) : ""}
							</span>
						</Link>
					),
					// ),
				)}
			</div>
		</div>
	);
}
