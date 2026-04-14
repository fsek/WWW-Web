"use client";

import CustomTitle from "@/components/CustomTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function MainLanding() {
	const { t } = useTranslation();

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-background text-foreground">
			<section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:py-16">
				<Card className="bg-card text-card-foreground shadow-sm">
					<CardHeader className="pb-2">
						<CustomTitle
							text={t("plugg:page.title")}
							className="mb-1 text-3xl font-bold tracking-tight md:text-4xl"
						/>
						<CardDescription className="text-base leading-relaxed md:text-lg">
							{t("plugg:page.intro")}
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col gap-6 pt-2">
						<Separator />

						<Link href="mailto:plugg@fsektionen.se" className="no-underline">
							<Alert className="border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
								<AlertTitle className="mb-2 text-lg font-semibold">
									{t("plugg:page.contact_notice_title")}
								</AlertTitle>
								<AlertDescription className="text-sm leading-relaxed">
									{t("plugg:page.contact_notice_text")}
								</AlertDescription>
							</Alert>
						</Link>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Card className="bg-card text-card-foreground gap-1">
								<CardHeader>
									<CardTitle className="text-lg font-semibold">
										{t("plugg:page.section_programs_title")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{t("plugg:page.section_programs_text")}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-card text-card-foreground gap-1">
								<CardHeader>
									<CardTitle className="text-lg font-semibold">
										{t("plugg:page.section_courses_title")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{t("plugg:page.section_courses_text")}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-card text-card-foreground gap-1">
								<CardHeader>
									<CardTitle className="text-lg font-semibold">
										{t("plugg:page.section_specialisations_title")}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{t("plugg:page.section_specialisations_text")}
									</p>
								</CardContent>
							</Card>
						</div>

						<Alert>
							<AlertDescription className="text-sm leading-relaxed text-muted-foreground md:text-base">
								{t("plugg:page.footer_note")}
							</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
