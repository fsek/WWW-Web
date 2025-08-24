"use client";

import { getSingleEventOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
	Calendar,
	Clock,
	MapPin,
	Users,
	Utensils,
	TableOfContents,
	CreditCard,
	Lock,
	Star,
	Repeat,
	User,
	Beer,
	FilePenLine,
	ArrowLeft,
	Shirt,
	WineIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { EventRead } from "@/api/types.gen";
import SignupCard from "./SignupCard";

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
			<div className="px-12 py-4">{t("admin:events.no_event_selected")}</div>
		);
	}

	let data: EventRead;
	try {
		const query = useSuspenseQuery({
			...getSingleEventOptions({
				path: { eventId: eventID },
			}),
		});
		data = query.data;
	} catch (e) {
		return (
			<div className="px-12 py-4">{t("admin:events.event_not_found")}</div>
		);
	}

	const formatDateShort = (date: Date) => {
		return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "sv-SE", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(date));
	};

	const featureDivClassName = "flex items-center gap-1 text-sm";
	const featureClassName = "w-10 h-10";

	// Check if signup is allowed right now
	const currentDate = new Date();
	// It doesn't work without this
	const signupStart = new Date(data.signup_start);
	const signupEnd = new Date(data.signup_end);
	const isSignupAllowed =
		data.can_signup &&
		!data.closed &&
		signupStart <= currentDate &&
		currentDate <= signupEnd;

	const signupPeriodPassed = currentDate > signupEnd;

	return (
		<Suspense fallback={<div>{t("admin:events.no_event_selected")}</div>}>
			<div className="px-12 py-4 space-y-6">
				<div className="justify-between w-full flex flex-row">
					<p className="text-3xl font-bold">
						{i18n.language === "en" ? data.title_en : data.title_sv}
					</p>
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
									{i18n.language === "en"
										? data.description_en
										: data.description_sv}
								</p>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>
									{!data.location ? (
										<span className="text-muted-foreground">
											{t("admin:events.no_location")}
										</span>
									) : (
										<>{t("admin:events.location_title") + data.location}</>
									)}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Shirt className="w-4 h-4 text-muted-foreground" />
								<span>
									{`${t("admin:events.dress_code")}: `}
									{data.dress_code || t("admin:events.no_dress_code")}
								</span>
							</div>

							{Boolean(
								data.alcohol_event_type !== "None" || data.is_nollning_event,
							) && (
								<div className="flex items-center gap-2">
									<WineIcon className="w-4 h-4 text-muted-foreground" />
									<span>
										{`${t("admin:events.alcohol_event_type")}: `}
										{(
											{
												Alcohol: t("admin:events.alcohol"),
												"Alcohol-Served": t("admin:events.alcohol_served"),
												None: t("admin:events.alcohol_not_allowed"),
											} as Record<string, string>
										)[data.alcohol_event_type] ||
											t("admin:events.alcohol_none")}
									</span>
								</div>
							)}

							<div className="flex items-center gap-2">
								<User className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("admin:events.council_title") +
										(i18n.language === "en"
											? data.council.name_en
											: data.council.name_sv)}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-muted-foreground" />
								<span>
									{`${t("admin:events.max_event_users")}: `}
									{data.max_event_users === 0 ? (
										<span className="text-muted-foreground text-sm">
											{t("admin:events.no_max_event_users")}
										</span>
									) : (
										<>{data.max_event_users as number}</>
									)}
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
								data.drink_package ||
								data.closed ||
								data.price !== 0
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
									{data.drink_package && (
										<Badge variant="outline" className={featureDivClassName}>
											<Beer className={featureClassName} />
											{t("admin:events.drink_package")}
										</Badge>
									)}
									{data.price !== 0 && (
										<Badge variant="outline" className={featureDivClassName}>
											<CreditCard className={featureClassName} />
											{t("admin:events.costs_money")}
										</Badge>
									)}
									{data.closed && (
										<Badge
											variant="destructive"
											className={featureDivClassName}
										>
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
								<p className="font-medium">{formatDateShort(data.starts_at)}</p>
								<p className="font-semibold text-sm text-muted-foreground">
									{t("admin:events.to")}
								</p>
								<p className="font-medium">{formatDateShort(data.ends_at)}</p>
							</div>
							<div>
								{data.all_day && (
									<p className="text-sm text-muted-foreground">
										{t("admin:events.all_day")}
									</p>
								)}
								<div className="flex items-center gap-2">
									<span>
										{`${t("admin:events.dot_type")}: `}
										{(
											{
												None: t("admin:events.dot_none"),
												Single: t("admin:events.dot_single"),
												Double: t("admin:events.dot_double"),
											} as Record<string, string>
										)[data.dot] || t("admin:events.dot_none")}
									</span>
								</div>
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
							{data.can_signup === true && (
								<>
									<div>
										<p className="font-semibold text-sm text-muted-foreground">
											{t("admin:events.signup_period")}
										</p>
										<p className="font-medium">
											{formatDateShort(data.signup_start)}
										</p>
										<p className="font-semibold text-sm text-muted-foreground">
											{t("admin:events.to")}
										</p>
										<p className="font-medium">
											{formatDateShort(data.signup_end)}
										</p>
									</div>

									<div className="flex items-center gap-2 mt-2">
										<Users className="w-4 h-4 text-muted-foreground" />
										<span>
											{`${t("admin:events.signup_count")}: ${
												data.signup_count
											} / ${data.max_event_users === 0 ? "∞" : data.max_event_users}`}
										</span>
									</div>
								</>
							)}

							{data.can_signup === false && (
								<p className="text-sm text-muted-foreground">
									{t("admin:events.signup_not_used")}
								</p>
							)}

							{(data.signup_start === null || data.signup_end === null) && (
								<p className="text-sm text-muted-foreground">
									{t("admin:events.signup_not_available")}
								</p>
							)}

							<div className="flex flex-wrap gap-2">
								{data.can_signup && (
									<Badge variant="default">
										{t("admin:events.can_signup")}
									</Badge>
								)}
								{data.lottery && (
									<Badge variant="secondary">{t("admin:events.lottery")}</Badge>
								)}
							</div>

							{data.price > 0 && (
								<div className="flex items-center gap-2">
									<CreditCard className="w-4 h-4 text-muted-foreground" />
									<span>
										{`${t("admin:events.price")}: `}
										{data.price} {"kr"}
									</span>
								</div>
							)}

							{data.priorities.length > 0 && (
								<div>
									<p className="font-semibold text-sm text-muted-foreground mb-2">
										{t("admin:events.priorities")}
									</p>
									<div className="space-y-1">
										{(() => {
											return (
												<div className="flex flex-wrap items-center gap-2">
													{data.priorities.map((p, idx) => {
														const raw = p.priority;
														let label = raw;
														let isSpecial = false;
														if (i18n.language === "en") {
															switch (raw) {
																case "Nolla":
																	label = "Mentee (new student)";
																	isSpecial = true;
																	break;
																case "Gruppfadder":
																	label = "Mentor (group)";
																	isSpecial = true;
																	break;
																case "Uppdragsfadder":
																	label = "Mentor (mission)";
																	isSpecial = true;
																	break;
																case "Fotograf":
																	label = "Photographer";
																	isSpecial = true;
																	break;
																default:
																	break;
															}
														}
														return (
															<span
																key={raw}
																className={isSpecial ? "font-semibold" : ""}
															>
																{`${label}${idx < data.priorities.length - 1 ? ", " : ""}`}
															</span>
														);
													})}
												</div>
											);
										})()}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{data && (
						<SignupCard
							event={data}
							availablePriorities={data.priorities.map((p) => p.priority)}
							isSignupAllowed={isSignupAllowed}
							signupPeriodPassed={signupPeriodPassed}
							useDrinkPackage={data.drink_package}
							isSignupUsed={data.can_signup} // if event requires signup
						/>
					)}
				</div>
			</div>
		</Suspense>
	);
}
