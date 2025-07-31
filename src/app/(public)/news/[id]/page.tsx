"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import {
	getNewsOptions,
	getNewsImageOptions,
} from "@/api/@tanstack/react-query.gen";
import type { NewsRead } from "@/api";
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
import { use, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface NewsPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function MainPageNews({ params }: NewsPageProps) {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const resolvedParams = use(params);
	const newsId = Number.parseInt(resolvedParams.id, 10);

	const { data, error, isFetching } = useQuery({
		...getNewsOptions({
			path: { news_id: newsId },
		}),
		refetchOnWindowFocus: false,
	});

	const now = new Date();

	const imageQuery = useQuery({
		...getNewsImageOptions({ path: { news_id: newsId } }),
		enabled: !!newsId,
		refetchOnWindowFocus: false,
	});

	const imageExists = imageQuery.data !== undefined;

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
								{i18n.language === "en" ? data.title_en : data.title_sv}
							</CardTitle>
							<Button
								variant="outline"
								className="flex items-center gap-2"
								onClick={() => router.back()}
							>
								<ArrowLeft className="w-4 h-4" />
								{t("main:back")}
							</Button>
						</div>
						<CardDescription>
							{`${t("main:news.by")} ${data.author.first_name} ${data.author.last_name}`}{" "}
							- {new Date(data.created_at).toLocaleDateString()}
							{data.pinned_from &&
								data.pinned_to &&
								now >= new Date(data.pinned_from) &&
								now <= new Date(data.pinned_to) && (
									<span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
										{t("main:news.pinned")}
									</span>
								)}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-grow">
						{imageExists && (
							<div className="relative h-60 mb-2 mx-auto w-[50%]">
								<img
									src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/news/${data.id}/image/stream`}
									alt={`News image for ${data.title_en}`}
									className="object-cover rounded-lg w-full h-full"
								/>
							</div>
						)}
						<p className="whitespace-pre-wrap">
							{i18n.language === "sv" ? data.content_sv : data.content_en}
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
