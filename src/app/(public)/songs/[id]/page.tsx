"use client";

import { useQuery } from "@tanstack/react-query";
import { getSongOptions } from "@/api/@tanstack/react-query.gen";
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
import { ArrowLeft } from "lucide-react";

interface SongPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function SongPage({ params }: SongPageProps) {
	const { t } = useTranslation("main");
	const router = useRouter();
	const resolvedParams = use(params);
	const songId = Number.parseInt(resolvedParams.id, 10);

	const { data, error, isFetching } = useQuery({
		...getSongOptions({
			path: { song_id: songId },
		}),
		refetchOnWindowFocus: false,
	});

	if (isFetching) {
		return <LoadingErrorCard />;
	}

	if (error || !data) {
		return <LoadingErrorCard error={error || undefined} />;
	}

	return (
		<div className="px-2 py-2 lg:px-4 lg:py-4">
			<div className="gap-4 mx-[20%]">
				<Card className="flex flex-col">
					<CardHeader>
						<div className="justify-between w-full flex flex-row">
							<CardTitle className="text-3xl font-bold">
								{data.title}
							</CardTitle>
							<Button
								variant="outline"
								className="flex items-center gap-2"
								onClick={() => router.back()}
							>
								<ArrowLeft className="w-4 h-4" />
								{t("back")}
							</Button>
						</div>
						<CardDescription className="space-y-1">
							{data.author && (
								<div>{t("songs.by")} {data.author}</div>
							)}
							{data.melody && (
								<div>{t("songs.melody")}: {data.melody}</div>
							)}
							{data.category && (
								<div>{t("songs.category")}: {data.category.name}</div>
							)}
							<div>{t("songs.views")}: {data.views}</div>
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-grow">
						<div className="whitespace-pre-wrap">
							{data.content}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
