"use client";

import {
	getCandidateOptions,
	deleteCandidateMutation,
	electionsGetSubElectionOptions,
	deleteCandidationMutation,
	electionsGetSubElectionQueryKey,
	getCandidateQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useRouter, useParams } from "next/navigation";
import type { CandidatePostRead } from "@/api/types.gen";
import { toast } from "sonner";
import getErrorMessage from "@/help_functions/getErrorMessage";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { CandidationTable } from "@/app/admin/elections/CandidationTable";
import { ArrowLeft } from "lucide-react";

export default function AdminElectionCandidatePage() {
	const { t, i18n } = useTranslation("admin");
	const router = useRouter();
	const params = useParams();
	const subElectionId = Number(params?.sub_election_id);
	const candidateId = Number(params?.candidate_id);
	const queryClient = useQueryClient();

	const {
		data: candidate,
		error: candidateError,
		isLoading: candidateLoading,
	} = useQuery({
		...getCandidateOptions({
			path: { sub_election_id: subElectionId, candidate_id: candidateId },
		}),
		enabled: Number.isFinite(subElectionId) && Number.isFinite(candidateId),
		refetchOnWindowFocus: false,
	});

	const {
		data: subElection,
		error: subElectionError,
		isLoading: subElectionLoading,
	} = useQuery({
		...electionsGetSubElectionOptions({
			path: { sub_election_id: subElectionId },
		}),
		enabled: Number.isFinite(subElectionId),
		refetchOnWindowFocus: false,
	});

	const deleteCandidate = useMutation({
		...deleteCandidateMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("elections.election_candidations.delete_success"));
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: {
						sub_election_id: subElectionId,
					},
				}),
			});
			router.push(`/admin/elections/${params?.election_id}/${subElectionId}`);
		},
		onError: (error) => {
			toast.error(
				`${t("elections.election_candidations.error_delete")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const deleteCandidation = useMutation({
		...deleteCandidationMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(
				t("elections.election_candidations.delete_candidation_success"),
			);
			queryClient.invalidateQueries({
				queryKey: electionsGetSubElectionQueryKey({
					path: {
						sub_election_id: subElectionId,
					},
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getCandidateQueryKey({
					path: { sub_election_id: subElectionId, candidate_id: candidateId },
				}),
			});
		},
		onError: (error) => {
			toast.error(
				`${t("elections.election_candidations.error_delete_candidation")} ${getErrorMessage(error, t)}`,
			);
		},
	});

	const getPostName = (post_id: number) => {
		if (!subElection?.election_posts) return "-";
		const post = subElection.election_posts.find((p) => p.post_id === post_id);
		if (!post) return "-";
		return i18n.language === "en" ? post.name_en : post.name_sv;
	};

	if (!Number.isFinite(subElectionId) || !Number.isFinite(candidateId)) {
		return (
			<div className="px-8">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("elections.election_candidations.title")}
				</h3>
				<p className="text-red-600">
					{t("elections.election_candidations.missing_id")}
				</p>
			</div>
		);
	}

	if (candidateLoading || subElectionLoading) {
		return <LoadingErrorCard />;
	}

	if (candidateError || subElectionError) {
		return (
			<LoadingErrorCard
				error={candidateError || subElectionError || undefined}
			/>
		);
	}

	const user = candidate?.user;

	let formattedPhone = user?.telephone_number ?? "";
	try {
		if (formattedPhone) {
			formattedPhone = parsePhoneNumberWithError(
				formattedPhone,
				"SE",
			).formatInternational();
		}
	} catch {
		// fallback to raw phone if parsing fails
	}

	return (
		<div className="px-8 space-y-4">
			<div className="flex items-start justify-between gap-4 py-3">
				<div>
					<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
						{t("elections.election_candidations.title")}
					</h3>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.election_candidations.description")}
					</p>
				</div>
				<div className="flex items-start">
					<Button
						variant="outline"
						onClick={() =>
							router.push(
								`/admin/elections/${params?.election_id}/${subElectionId}`,
							)
						}
					>
						<ArrowLeft />
						{t("elections.back_to_elections")}
					</Button>
				</div>
			</div>
			<Separator className="mb-4" />
			<div className="mb-4">
				<h4 className="text-xl font-semibold">
					{t("elections.election_candidations.candidate_information")}
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.first_name")}:{" "}
						</span>
						{user?.first_name}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.last_name")}:{" "}
						</span>
						{user?.last_name}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.email")}:{" "}
						</span>
						{user?.email}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.telephone_number")}:{" "}
						</span>
						{formattedPhone}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.stil_id")}:{" "}
						</span>
						{user?.stil_id ?? "-"}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.start_year")}:{" "}
						</span>
						{user?.start_year}
					</div>
					<div>
						<span className="font-medium">
							{t("elections.election_candidations.program")}:{" "}
						</span>
						{user?.program}
					</div>
				</div>
				<Button
					variant="destructive"
					size="sm"
					className="mt-4"
					onClick={() =>
						candidate &&
						deleteCandidate.mutate({
							path: {
								sub_election_id: candidate.sub_election_id,
								user_id: candidate.user_id,
							},
						})
					}
				>
					{t("elections.election_candidations.remove_candidate")}
				</Button>
			</div>
			<Separator className="mb-4" />
			<div>
				<h4 className="text-xl font-semibold">
					{t("elections.election_candidations.candidations_title")}
				</h4>
				<CandidationTable
					candidations={candidate?.candidations ?? []}
					getPostName={getPostName}
					onDeleteCandidation={(c: CandidatePostRead) =>
						deleteCandidation.mutate({
							query: {
								candidate_id: candidateId,
								election_post_id: c.election_post_id,
							},
						})
					}
				/>
			</div>
		</div>
	);
}
