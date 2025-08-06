"use client";

import {
	getRoomBookingOptions,
} from "@/api/@tanstack/react-query.gen";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
	Calendar,
	Clock,
	MapPin,
	User,
	ArrowLeft,
	Home,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

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
	const bookingID = idAsNumber(search);

	// Fetch booking data
	const {
		data: bookingData,
		error: bookingError,
		isLoading: bookingIsLoading,
	} = useQuery({
		...getRoomBookingOptions({
			path: { booking_id: bookingID },
		}),
		enabled: bookingID > 0,
	});

	// Rendering logic
	if (bookingID === -1) {
		return (
			<LoadingErrorCard
				error={t("admin:room_bookings.no_booking_selected")}
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
				error={t("admin:room_bookings.booking_not_found")}
				isLoading={false}
			/>
		);
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
					{t("admin:room_bookings.back")}
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Booking Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Calendar className="w-5 h-5" />
							{t("admin:room_bookings.booking_information")}
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
							<Home className="w-4 h-4 text-muted-foreground" />
							<span>
								{t("admin:room_bookings.room")}: {bookingData.room}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<User className="w-4 h-4 text-muted-foreground" />
							<span>
								{t("admin:room_bookings.user")}:{" "}
								{bookingData.user.first_name && bookingData.user.last_name
									? `${bookingData.user.first_name} ${bookingData.user.last_name}`
									: `User ${bookingData.user.id}`}
							</span>
						</div>
						{bookingData.council && (
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("admin:room_bookings.council")}:{" "}
									{i18n.language === "en"
										? bookingData.council.name_en
										: bookingData.council.name_sv}
								</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Timing Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Clock className="w-5 h-5" />
							{t("admin:room_bookings.booking_timing")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<p className="font-semibold text-sm text-muted-foreground">
								{t("admin:room_bookings.start_time")}
							</p>
							<p className="font-medium">
								{formatDateShort(bookingData.start_time)}
							</p>
							<p className="font-semibold text-sm text-muted-foreground">
								{t("admin:room_bookings.end_time")}
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