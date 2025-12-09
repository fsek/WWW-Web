// Candidations page
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { CandidationTable } from "@/app/admin/elections/CandidationTable";
import {
	getVisibleElectionOptions,
	getMyCandidationsOptions,
	getVisibleElectionQueryKey,
	getMyCandidationsQueryKey,
	deleteCandidationMutation,
	getAllCouncilsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CandidatePostRead } from "@/api";

export default function CandidationsPage() {
	const { t, i18n } = useTranslation("main");
	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		data: election,
		isPending: electionPending,
		error: electionError,
	} = useQuery({
		...getVisibleElectionOptions(),
		refetchOnWindowFocus: false,
	});

	const {
		data: candidations,
		isPending: candidationsPending,
		error: candidationsError,
	} = useQuery({
		...getMyCandidationsOptions({
			path: { election_id: election?.election_id ?? 0 },
		}),
		enabled: !!election?.election_id,
		refetchOnWindowFocus: false,
	});

	const {
		data: councilsData,
		isPending: councilsPending,
		error: councilsError,
	} = useQuery({
		...getAllCouncilsOptions(),
		refetchOnWindowFocus: false,
	});

	const deleteCandidation = useMutation({
		...deleteCandidationMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("elections.delete_candidation_success"));
			queryClient.invalidateQueries({
				queryKey: getMyCandidationsQueryKey({
					path: { election_id: election?.election_id ?? 0 },
				}),
			});
			queryClient.invalidateQueries({ queryKey: getVisibleElectionQueryKey() });
		},
		onError: (error) => {
			toast.error(t("elections.error_delete_candidation"));
		},
	});

	if (electionPending || candidationsPending || councilsPending)
		return <LoadingErrorCard />;
	if (electionError) return <LoadingErrorCard error={electionError} />;
	if (candidationsError) return <LoadingErrorCard error={candidationsError} />;
	if (councilsError) return <LoadingErrorCard error={councilsError} />;

	if (!candidations || !Array.isArray(candidations)) {
		return (
			<div className="px-8 py-12 flex flex-col items-center gap-4">
				{t("elections.no_candidations")}
			</div>
		);
	}

	const allCouncils = councilsData ?? [];

	function getPostName(post_id: number) {
		for (const council of allCouncils) {
			const post = council.posts.find((p) => p.id === post_id);
			if (post) {
				return i18n.language === "en" ? post.name_en : post.name_sv;
			}
		}
		return `#${post_id}`;
	}

	function handleDeleteCandidation(candidation: CandidatePostRead) {
		deleteCandidation.mutate({
			query: {
				candidate_id: candidation.candidate_id,
				election_post_id: candidation.election_post_id,
			},
		});
	}

	return (
		<div className="px-8 py-6 space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
						{t("elections.my_candidations.page_title")}
					</h3>
					<p className="text-xs md:text-sm font-medium">
						{t("elections.my_candidations.page_description")}
					</p>
				</div>
				<div className="flex items-start">
					<Button variant="outline" onClick={() => router.push("/election")}>
						<ArrowLeft />
						{t("elections.back_to_elections")}
					</Button>
				</div>
			</div>
			<CandidationTable
				candidations={candidations}
				getPostName={getPostName}
				onDeleteCandidation={handleDeleteCandidation}
				showUserInfo={false}
			/>
		</div>
	);
}
