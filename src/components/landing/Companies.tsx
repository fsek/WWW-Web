import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	UtensilsCrossed,
	Megaphone,
	Calendar,
	MessageCircleQuestion,
	ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";

import faradImg from "@/assets/landing/FARAD-073.jpg";

interface CompaniesProps {
	title: string;
	description: string;
	icon: JSX.Element;
}

export const Companies = () => {
	const { t } = useTranslation("landingpage");

	const companiesList: CompaniesProps[] = [
		{
			title: t("companies.lunch"),
			description: t("companies.lunch_description"),
			icon: <UtensilsCrossed />,
		},
		{
			title: t("companies.marketing"),
			description: t("companies.marketing_description"),
			icon: <Megaphone />,
		},
		{
			title: t("companies.events"),
			description: t("companies.events_description"),
			icon: <Calendar />,
		},
		{
			title: t("companies.more"),
			description: t("companies.more_description"),
			icon: <MessageCircleQuestion />,
		},
	];

	return (
		<section
			id="foretag"
			className="container py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-2 gap-10 px-10 md:px-0"
		>
			<div className="place-items-center">
				<div>
					<h2 className="text-3xl md:text-4xl font-bold">
						<span className="bg-gradient-to-b from-primary-light to-primary text-transparent bg-clip-text">
							{t("companies.title_1")}
						</span>
						{t("companies.title_2")}
					</h2>

					<p className="text-muted-foreground text-xl mt-4 mb-8 ">
						{t("companies.description")}
					</p>

					<div className="flex flex-col gap-8">
						{companiesList.map(
							({ icon, title, description }: CompaniesProps) => (
								<Card
									key={title}
									className="transition-transform hover:scale-[1.01]"
								>
									<CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
										<div className="mt-1 bg-primary/20 p-1 rounded-2xl">
											{icon}
										</div>
										<div>
											<CardTitle>{title}</CardTitle>
											<CardDescription className="text-md mt-2">
												{description}
											</CardDescription>
										</div>
									</CardHeader>
								</Card>
							),
						)}
					</div>
				</div>
			</div>
			<div className="w-full h-full flex flex-col">
				<Link
					href="/foretag/vi-erbjuder"
					className="relative flex-1 group cursor-pointer"
				>
					<Image
						src={faradImg}
						alt="People at FARAD event"
						className="w-full h-full object-cover rounded-lg shadow-lg group-hover:blur-xs transition-all"
						fill
					/>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<div className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-[#fe5f75] to-[#fc9840] bg-no-repeat bg-[position:bottom] bg-[length:100%_6px] group-hover:bg-[length:100%_100%] transition-[background-size]">
							{t("companies.cta_title")}
						</div>
						<div className="bg-white/90 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
							<ArrowRight className="w-8 h-8 text-primary" />
						</div>
					</div>
				</Link>
			</div>
		</section>
	);
};
