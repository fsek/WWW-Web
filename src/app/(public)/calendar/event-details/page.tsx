"use client";

import { getSingleEventOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Utensils, TableOfContents, CreditCard, Lock, Star, Repeat, User, Beer, HandCoins, FilePenLine, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function idAsNumber(value: string | null): number {
	if (value === null || value.trim() === "") return -1;
	const num = Number(value);
	return Number.isNaN(num) ? -1 : num;
}

export default function Page() {
	const router = useRouter();
  const { t, i18n } = useTranslation();
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	const eventID = idAsNumber(search);

	// If no valid eventID, show fallback
	if (eventID === -1) {
		return (
			<div className="px-12 py-4">
				{t("admin:events.no_event_selected")}
			</div>
		);
	}

	let data;
	try {
		const query = useSuspenseQuery({
			...getSingleEventOptions({
				path: { eventId: eventID },
			}),
		});
		data = query.data;
	} catch (e) {
		return (
			<div className="px-12 py-4">
				{t("admin:events.event_not_found")}
			</div>
		);
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "sv-SE", {
			dateStyle: "full",
			timeStyle: "short"
		}).format(new Date(date));
	};

	const formatDateShort = (date: Date) => {
		return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "sv-SE", {
			dateStyle: "medium",
			timeStyle: "short"
		}).format(new Date(date));
	};

  const featureDivClassName = "flex items-center gap-1 text-sm";
  const featureClassName = "w-10 h-10";

	return (
		<Suspense fallback={<div>{t("admin:events.no_event_selected")}</div>}>
			<div className="px-12 py-4 space-y-6">
				<div className="justify-between w-full flex flex-row">
					<p className="text-3xl font-bold">
						{i18n.language === "en" ? data.title_en : data.title_sv}
					</p>
					{/* Implement properly later: */}
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => router.back()}
					>
						<ArrowLeft className="w-4 h-4" />
						Tillbaka
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Calendar className="w-5 h-5" />
								{t("admin:events.event_information")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="font-semibold mb-2 text-med">
									{t("admin:description")}
								</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {i18n.language === "en" ? data.description_en : data.description_sv}
                </p>
							</div>
							
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("admin:events.location_title") + data.location}
									{!(data.location) ? (
										<span className="text-muted-foreground">
											{t("admin:events.no_location")}
										</span>
									) : (
										<>
											{t("admin:events.location_title") + data.location}
										</>
									)}
									</span>
								
							</div>

							<div className="flex items-center gap-2">
								<User className="w-4 h-4 text-muted-foreground" />
								<span>{t("admin:events.council_title") + data.council.name}</span>
							</div>

							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("admin:events.max_event_users") + ": "}
									{data.max_event_users}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Event Features */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
                <TableOfContents className="w-5 h-5" />
								{t("admin:events.event_features")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!(
								data.all_day ||
								data.recurring ||
								data.is_nollning_event ||
								data.food ||
								data.drink ||
								data.drink_package ||
								data.cash ||
								data.closed
							) ? (
								<p className="text-muted-foreground text-sm">
									{t("admin:events.no_features")}
								</p>
							) : (
								<div className="flex flex-wrap gap-2">
									{data.all_day && (
										<Badge variant="secondary" className={featureDivClassName}>
											<Calendar className={featureClassName} />
											{t("admin:events.all_day")}
										</Badge>
									)}
									{data.recurring && (
										<Badge variant="secondary" className={featureDivClassName}>
											<Repeat className={featureClassName} />
											{t("admin:events.recurring")}
										</Badge>
									)}
									{data.is_nollning_event && (
										<Badge variant="secondary" className={featureDivClassName}>
											<Star className={featureClassName} />
											{t("admin:events.is_nollning_event")}
										</Badge>
									)}
									{data.food && (
										<Badge variant="outline" className={featureDivClassName}>
											<Utensils className={featureClassName} />
											{t("admin:events.food")}
										</Badge>
									)}
									{data.drink && (
										<Badge variant="outline" className={featureDivClassName}>
											<Beer className={featureClassName} />
											{t("admin:events.drink")}
										</Badge>
									)}
									{data.drink_package && (
										<Badge variant="outline" className={featureDivClassName}>
											<HandCoins className={featureClassName} />
											{t("admin:events.drink_package")}
										</Badge>
									)}
									{data.cash && (
										<Badge variant="outline" className={featureDivClassName}>
											<CreditCard className={featureClassName} />
											{t("admin:events.cash")}
										</Badge>
									)}
									{data.closed && (
										<Badge variant="destructive" className={featureDivClassName}>
											<Lock className={featureClassName} />
											{t("admin:events.closed")}
										</Badge>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Timing Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Clock className="w-5 h-5" />
								{t("admin:events.event_timing")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="font-semibold text-sm text-muted-foreground">
									{t("admin:events.event_period")}
								</p>
								<p className="font-medium">{formatDate(data.starts_at)}</p>
								<p className="text-sm text-muted-foreground">
									{t("admin:events.to")} {formatDateShort(data.ends_at)}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Signup Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
                <FilePenLine className="w-5 h-5" />
								{t("admin:events.signup_information")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="font-semibold text-sm text-muted-foreground">
									{t("admin:events.signup_period")}
								</p>
								<p className="font-medium">{formatDateShort(data.signup_start)}</p>
								<p className="text-sm text-muted-foreground">
									{t("admin:events.to")} {formatDateShort(data.signup_end)}
								</p>
							</div>

							<div className="flex flex-wrap gap-2">
								{data.signup_not_opened_yet && (
									<Badge variant="secondary">
										{t("admin:events.signup_not_opened_yet")}
									</Badge>
								)}
								{data.can_signup && (
									<Badge variant="default">
										{t("admin:events.can_signup")}
									</Badge>
								)}
							</div>

							{data.priorities.length > 0 && (
								<div>
									<p className="font-semibold text-sm text-muted-foreground mb-2">
										{t("admin:events.priorities")}
									</p>
									<div className="space-y-1">
										{data.priorities.map((priority, index) => (
											<div key={index} className="text-sm">
												{priority.priority}
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</Suspense>
	);
}