"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	viewShiftOptions,
	getMeOptions,
	adminViewShiftOptions,
	signupToShiftMutation,
	signoffFromShiftMutation,
	viewShiftQueryKey,
} from "@/api/@tanstack/react-query.gen";
import type { CafeShiftRead, AdminUserRead } from "@/api";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { use } from "react";
import {
	ArrowLeft,
	Calendar,
	Clock,
	User,
	Mail,
	Phone,
	IdCard,
} from "lucide-react";

import viewingUserGotPerms from "@/utils/viewingUserGotPerms";

interface CafeShiftPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CafeShiftPage({ params }: CafeShiftPageProps) {
	const { t, i18n } = useTranslation("cafe");
	const router = useRouter();
	const resolvedParams = use(params);
	const shiftId = Number.parseInt(resolvedParams.id, 10);
	const queryClient = useQueryClient();

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

	// 2. Then fetch shift data - enabled if shiftId is valid
	const { data, error, isFetching } = useQuery({
		...viewShiftOptions({
			path: { shift_id: shiftId },
		}),
		enabled: shiftId > 0,
		refetchOnWindowFocus: false,
	});

	// 3. Check permissions based on user data
	const userHasPerms = viewingUserGotPerms(
		userData,
		userError,
		userIsFetching,
		"cafe",
	);

	// 4. Finally fetch user details - enabled if permissions and shift data exist
	const { data: adminData, error: adminDataError } = useQuery({
		...adminViewShiftOptions({
			path: { shift_id: shiftId },
		}),
		enabled: userHasPerms && !!data?.user && !!data?.user?.id,
		staleTime: 30 * 60 * 1000,
	});

	const signupMutation = useMutation({
		...signupToShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: viewShiftQueryKey({
					path: { shift_id: shiftId },
				}),
			});
		},
	});
	const signoffMutation = useMutation({
		...signoffFromShiftMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: viewShiftQueryKey({
					path: { shift_id: shiftId },
				}),
			});
		},
	});

	const isAssignedToMe = data?.user && userData && data.user.id === userData.id;

	if (shiftId <= 0 || Number.isNaN(shiftId)) {
		return (
			<LoadingErrorCard error={t("no_shift_selected")} isLoading={false} />
		);
	}

	if (isFetching) {
		return <LoadingErrorCard />;
	}

	if (error || !data) {
		return <LoadingErrorCard error={error || undefined} />;
	}

	if (userHasPerms && adminDataError) {
		return <LoadingErrorCard error={adminDataError} isLoading={false} />;
	}

	const formatDateShort = (date: Date) => {
		return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "sv-SE", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(date));
	};

	return (
		<div className="px-2 py-2 lg:px-4 lg:py-4">
			<div className="gap-4 mx-[20%]">
				<div className="justify-between w-full flex flex-row mb-6">
					<h1 className="text-3xl font-bold">{t("shift_details")}</h1>
					<Button
						variant="outline"
						className="flex items-center gap-2"
						onClick={() => router.back()}
					>
						<ArrowLeft className="w-4 h-4" />
						{t("back")}
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Shift Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Calendar className="w-5 h-5" />
								{t("shift_information")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-2">
								<User className="w-4 h-4 text-muted-foreground" />
								<span>
									{t("assigned_to")}:{" "}
									{data.user
										? data.user.first_name && data.user.last_name
											? `${data.user.first_name} ${data.user.last_name}`
											: `User ${data.user.id}`
										: t("unassigned")}
								</span>
							</div>
							{userHasPerms && adminData?.user && (
								<>
									<div className="flex items-center gap-2">
										<Mail className="w-4 h-4 text-muted-foreground" />
										<span>
											{t("email")}: {adminData.user.email}
										</span>
									</div>
									{adminData.user.telephone_number && (
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4 text-muted-foreground" />
											<span>
												{t("telephone_number")}:{" "}
												{parsePhoneNumberWithError(
													adminData.user.telephone_number,
												).formatNational() ?? adminData.user.telephone_number}
											</span>
										</div>
									)}
									<div className="flex items-center gap-2">
										<IdCard className="w-4 h-4 text-muted-foreground" />
										<span>
											{t("stil_id")}: {adminData.user.stil_id}
										</span>
									</div>
								</>
							)}
							{/* Sign up / Sign off button */}
							{userData && (
								<div className="pt-2">
									{isAssignedToMe ? (
										<Button
											variant="destructive"
											disabled={signoffMutation.isPending}
											onClick={() =>
												signoffMutation.mutate({ path: { shift_id: shiftId } })
											}
										>
											{t("signoff")}
										</Button>
									) : (
										<Button
											// Disable if anyone has signed up (!!data.user)
											disabled={!!data.user || signupMutation.isPending}
											onClick={() =>
												signupMutation.mutate({ path: { shift_id: shiftId } })
											}
										>
											{t("signup")}
										</Button>
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
								{t("shift_timing")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="font-semibold text-sm text-muted-foreground">
									{t("start_time")}
								</p>
								<p className="font-medium">{formatDateShort(data.starts_at)}</p>
							</div>
							<div>
								<p className="font-semibold text-sm text-muted-foreground">
									{t("end_time")}
								</p>
								<p className="font-medium">{formatDateShort(data.ends_at)}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
