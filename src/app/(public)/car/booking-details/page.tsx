"use client";

import {
	getMeOptions,
	getCarBookingOptions,
	adminGetUserOptions,
} from "@/api/@tanstack/react-query.gen";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
	Calendar,
	Clock,
	MapPin,
	User,
	CheckCircle2,
	XCircle,
	ArrowLeft,
	Mail,
	IdCard,
	Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { AdminUserRead } from "@/api/index";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

function idAsNumber(value: string | null): number {
	if (value === null || value.trim() === "") return -1;
	const num = Number(value);
	return Number.isNaN(num) ? -1 : num;
}

function viewingUserGotPerms(
	userData: AdminUserRead | undefined,
	userError: Error | null,
	userIsFetching: boolean,
): boolean {
	if (userIsFetching) return false;
	if (userError !== null || !userData) {
		return false;
	}

	if (userData.posts) {
		return userData.posts.some((post) =>
			post.permissions.some(
				(permission) =>
					(permission.action.toLowerCase() === "manage" &&
						permission.target.toLowerCase() === "user") ||
					(permission.action.toLowerCase() === "view" &&
						permission.target.toLowerCase() === "user"),
			),
		);
	}
	return false;
}

export default function Page() {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	const bookingID = idAsNumber(search);

	// Always call all hooks in the same order
	// 1. Fetch user data first - always enabled
	const {
		data: userData,
		error: userError,
		isFetching: userIsFetching,
	} = useQuery({
		...getMeOptions(),
		staleTime: 30 * 60 * 1000,
	});

	// 2. Then fetch booking data - enabled if bookingID is valid
	const {
		data: bookingData,
		error: bookingError,
		isLoading: bookingIsLoading,
	} = useQuery({
		...getCarBookingOptions({
			path: { booking_id: bookingID },
		}),
		enabled: bookingID > 0,
	});

	// 3. Check permissions based on user data
	const userHasPerms = viewingUserGotPerms(userData, userError, userIsFetching);

	// 4. Finally fetch user details - enabled if permissions and bookingData exist
	const { data: userDetails, error: userDetailsError } = useQuery({
		...adminGetUserOptions({
			path: { user_id: bookingData?.user.id ?? -1 },
		}),
		enabled: userHasPerms && !!bookingData?.user.id,
		staleTime: 30 * 60 * 1000,
	});

	// Rendering logic after all hooks
	if (bookingID === -1) {
		return (
			<LoadingErrorCard
				error={t("admin:car.no_booking_selected")}
				isLoading={false}
			/>
		);
	}

	if (bookingIsLoading) {
		return <LoadingErrorCard />;
	}

	if (bookingError || !bookingData) {
		return (
			<LoadingErrorCard
				error={t("admin:car.booking_not_found")}
				isLoading={false}
			/>
		);
	}

	if (userHasPerms && userDetailsError) {
		return <LoadingErrorCard error={userDetailsError} isLoading={false} />;
	}

	const formatDateShort = (date: Date) => {
		return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "sv-SE", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(date));
	};

	return (
		<div className="px-12 py-4 space-y-6">
			<div className="justify-between w-full flex flex-row">
				<p className="text-3xl font-bold">
					{bookingData.user.first_name && bookingData.user.last_name
						? `${bookingData.user.first_name} ${bookingData.user.last_name}`
						: `User ${bookingData.user.id}`}
				</p>
				<Button
					variant="ghost"
					className="flex items-center gap-2"
					onClick={() => router.back()}
				>
					<ArrowLeft className="w-4 h-4" />
					{t("admin:car.back")}
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Booking Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Calendar className="w-5 h-5" />
							{t("admin:car.booking_information")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="font-semibold mb-2 text-med">
								{t("admin:description")}
							</p>
							<p className="text-muted-foreground whitespace-pre-wrap">
								{bookingData.description}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<User className="w-4 h-4 text-muted-foreground" />
							<span>
								{t("admin:car.user")}:{" "}
								{bookingData.user.first_name && bookingData.user.last_name
									? `${bookingData.user.first_name} ${bookingData.user.last_name}`
									: `User ${bookingData.user.id}`}
							</span>
						</div>
						{userHasPerms && userDetails && (
							<>
								<div className="flex items-center gap-2">
									<Mail className="w-4 h-4 text-muted-foreground" />
									<span>
										{t("admin:car.email")}: {userDetails.email}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="w-4 h-4 text-muted-foreground" />
									<span>
										{t("admin:car.telephone_number")}:{" "}
										{parsePhoneNumberWithError(
											userDetails.telephone_number,
										).formatNational() ?? userDetails.telephone_number}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<IdCard className="w-4 h-4 text-muted-foreground" />
									<span>
										{t("admin:car.stil_id")}:{userDetails.stil_id}
									</span>
								</div>
							</>
						)}
						{bookingData.council && (
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("admin:car.council")}:{" "}
									{i18n.language === "en"
										? bookingData.council.name_en
										: bookingData.council.name_sv}
								</span>
							</div>
						)}
						<div className="flex items-center gap-2">
							{bookingData.confirmed ? (
								<CheckCircle2 className="w-4 h-4 text-green-600" />
							) : (
								<XCircle className="w-4 h-4 text-yellow-600" />
							)}
							<span>
								{t("admin:car.confirmed")}:{" "}
								{bookingData.confirmed ? t("admin:yes") : t("admin:no")}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant={bookingData.personal ? "default" : "secondary"}>
								{bookingData.personal
									? t("admin:car.personal")
									: t("admin:car.council_booking")}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Timing Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Clock className="w-5 h-5" />
							{t("admin:car.booking_timing")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<p className="font-semibold text-sm text-muted-foreground">
								{t("admin:car.start_time")}
							</p>
							<p className="font-medium">
								{formatDateShort(bookingData.start_time)}
							</p>
							<p className="font-semibold text-sm text-muted-foreground">
								{t("admin:car.end_time")}
							</p>
							<p className="font-medium">
								{formatDateShort(bookingData.end_time)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
