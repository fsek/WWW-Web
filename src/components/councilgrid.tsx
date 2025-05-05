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
	{ key: "bokforlaget", url: "/utskott/bokforlaget", icon: BookOpen },
	{ key: "cafem", url: "/utskott/cafem", icon: Coffee },
	{ key: "externa-rep", url: "/utskott/externa-rep", icon: Users },
	{ key: "foset", url: "/utskott/foset", icon: Shield },
	{ key: "kulturm", url: "/utskott/kulturm", icon: LayoutGrid },
	{ key: "fnu", url: "/utskott/fnu", icon: ClipboardList },
	{ key: "prylm", url: "/utskott/prylm", icon: Archive },
	{ key: "samvetet", url: "/utskott/samvetet", icon: SlidersHorizontal },
	{ key: "sanningsm", url: "/utskott/sanningsm", icon: Server },
	{ key: "secretservice", url: "/utskott/secretservice", icon: Shield },
	{ key: "studieradet", url: "/utskott/studieradet", icon: Users2 },
	{ key: "styrelsen", url: "/utskott/styrelsen", icon: Users },
	{ key: "ovriga", url: "/utskott/ovriga", icon: MoreHorizontal },
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
