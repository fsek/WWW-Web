"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import type { NewsRead } from "@/api";
import { LoadingErrorCard } from "./LoadingErrorCard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";

interface MainPageNewsProps {
	mini?: boolean;
}

export default function MainPageNews({ mini = false }: MainPageNewsProps) {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const [page, setPage] = useState(0);

	const { data, error, isFetching } = useQuery({
		...getAllNewsOptions(),
		refetchOnWindowFocus: false,
	});

	if (isFetching) {
		return <LoadingErrorCard />;
	}

	if (error || !data) {
		return <LoadingErrorCard error={error || undefined} />;
	}

	const newsItems = data as NewsRead[];
	const now = new Date();
	const sortedNews = newsItems.slice().sort((a, b) => {
		const isPinned = (n: NewsRead) =>
			n.pinned_from &&
			n.pinned_to &&
			now >= new Date(n.pinned_from) &&
			now <= new Date(n.pinned_to);
		const aPinned = isPinned(a);
		const bPinned = isPinned(b);
		if (aPinned && !bPinned) return -1;
		if (bPinned && !aPinned) return 1;
		if (aPinned && bPinned) {
			return (
				// if no pinned_from, treat as 1 jan 1970
				new Date(b.pinned_from ?? 0).getTime() -
				new Date(a.pinned_from ?? 0).getTime()
			);
		}
		const aDate = (
			a.bumped_at ? new Date(a.bumped_at) : new Date(a.created_at)
		).getTime();
		const bDate = (
			b.bumped_at ? new Date(b.bumped_at) : new Date(b.created_at)
		).getTime();
		return bDate - aDate;
	});
	const PAGE_SIZE = 5;
	const totalPages = Math.ceil(sortedNews.length / PAGE_SIZE);
	const paginatedNews = sortedNews.slice(
		page * PAGE_SIZE,
		(page + 1) * PAGE_SIZE,
	);

	return (
		<div className="px-2 py-2 lg:px-4 lg:py-4">
			<div className="grid  gap-4 grid-cols-1 lg:grid-cols-2 w-full">
				{paginatedNews.map((news) => (
					<Card key={news.id} className="flex flex-col">
						<CardHeader>
							<CardTitle className="text-2xl font-bold">
								{i18n.language === "sv" ? news.title_sv : news.title_en}
							</CardTitle>
							<CardDescription>
								{t("main:news.by", {
									name: `${news.author.first_name} ${news.author.last_name}`,
								})}{" "}
								- {new Date(news.created_at).toLocaleDateString()}
								{news.pinned_from &&
									news.pinned_to &&
									now >= new Date(news.pinned_from) &&
									now <= new Date(news.pinned_to) && (
										<span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
											{t("main:news.pinned")}
										</span>
									)}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-grow">
							<p className="whitespace-pre-line">
								{i18n.language === "sv" ? news.content_sv : news.content_en}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
			{!mini && totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-6">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage(page - 1)}
						disabled={page === 0}
					>
						{t("main:previous")}
					</Button>
					<span>
						{t("main:page")} {page + 1} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage(page + 1)}
						disabled={page >= totalPages - 1}
					>
						{t("main:next")}
					</Button>
				</div>
			)}
			{mini && newsItems.length > 3 && (
				<div className="text-center mt-4">
					<Button variant="default" onClick={() => router.push("/news")}>
						{t("main:news.see_all")}
					</Button>
				</div>
			)}
		</div>
	);
}
