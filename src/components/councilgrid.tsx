"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
	BookOpen,
	Coffee,
	Users,
	Shield,
	FileText,
	Calendar,
	Car,
	Archive,
	Users2,
	Server,
	ClipboardList,
	LayoutGrid,
	SlidersHorizontal,
	MoreHorizontal,
} from "lucide-react";

const councils = [
	{ key: "bokforlaget", url: "/councils/bokforlaget", icon: BookOpen },
	{ key: "cafem", url: "/councils/cafem", icon: Coffee },
	{ key: "externa-rep", url: "/councils/externa-rep", icon: Users },
	{ key: "foset", url: "/councils/foset", icon: Shield },
	{ key: "kulturm", url: "/councils/kulturm", icon: LayoutGrid },
	{ key: "fnu", url: "/councils/fnu", icon: ClipboardList },
	{ key: "prylm", url: "/councils/prylm", icon: Archive },
	{ key: "samvetet", url: "/councils/samvetet", icon: SlidersHorizontal },
	{ key: "sanningsm", url: "/councils/sanningsm", icon: Server },
	{ key: "secretservice", url: "/councils/secretservice", icon: Shield },
	{ key: "studieradet", url: "/councils/studieradet", icon: Users2 },
	{ key: "styrelsen", url: "/councils/styrelsen", icon: Users },
	{ key: "ovriga", url: "/councils/ovriga", icon: MoreHorizontal },
];

export default function CouncilGrid() {
	const { t } = useTranslation();

	return (
		<div className="p-14 bg-background">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{councils.map(({ key, url, icon: Icon }) => (
					<Link
						key={key}
						href={url}
						className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-md hover:shadow-lg transition-shadow"
					>
						{/* lucide icons use stroke-current to pick up text color */}
						<Icon className="h-12 w-12 mb-4 stroke-current text-primary" />
						<span className="text-lg font-medium text-foreground">
							{t(`utskott:${key}.self`)}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
