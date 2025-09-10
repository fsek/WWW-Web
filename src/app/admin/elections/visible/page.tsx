"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVisibleElectionOptions } from "@/api/@tanstack/react-query.gen";
import { useRouter } from "next/navigation";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";

export default function VisibleElectionRedirect() {
	const router = useRouter();
	const { data, error, isPending } = useQuery({
		...getVisibleElectionOptions(),
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (data?.election_id) {
			router.replace(`/admin/elections/${data.election_id}`);
		}
	}, [data, router]);

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	if (!data || !data.election_id) {
		return (
			<div className="flex flex-col items-center gap-4 py-8">
				<p>No visible election found.</p>
				<Button onClick={() => router.push("/admin/elections")}>
					Go to Elections List
				</Button>
			</div>
		);
	}

	// The redirect will happen automatically.
	return null;
}
