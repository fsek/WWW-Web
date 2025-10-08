"use client";

import {
	ActionEnum,
	type BumpNewsData,
	TargetEnum,
	type NewsRead,
} from "../../../api";
import NewsForm from "./NewsForm";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
	bumpNewsMutation,
	getAllNewsOptions,
} from "@/api/@tanstack/react-query.gen";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import NewsEditForm from "./NewsEditForm";
import { useState } from "react";
import PermissionWall from "@/components/PermissionWall";
import { Suspense } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

function getBumpDate(news: NewsRead): string | undefined {
	if (!news.bumped_at) {
		return undefined;
	}
	const createdAt = new Date(news.created_at);
	const bumpedAt = new Date(news.bumped_at);

	// Compare down to whole seconds
	const createdAtSec = Math.floor(createdAt.getTime() / 1000);
	const bumpedAtSec = Math.floor(bumpedAt.getTime() / 1000);

	if (createdAtSec === bumpedAtSec) {
		return undefined;
	}
	return bumpedAt.toLocaleDateString("sv-SE");
}

const columnHelper = createColumnHelper<NewsRead>();

export default function News() {
	const { t } = useTranslation("admin");
	const columns = [
		columnHelper.accessor("title_sv", {
			header: t("news.title_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("title_en", {
			header: t("news.title_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("pinned_from", {
			header: t("news.pinned_from"),
			cell: (info) => {
				const date = info.getValue();
				return date
					? new Date(date).toLocaleDateString("sv-SE")
					: t("news.no_pin");
			},
		}),
		columnHelper.accessor("pinned_to", {
			header: t("news.pinned_to"),
			cell: (info) => {
				const date = info.getValue();
				return date
					? new Date(date).toLocaleDateString("sv-SE")
					: t("news.no_pin");
			},
		}),
		{
			id: "bump",
			header: t("news.bump_header"),
			cell: ({ row }: { row: Row<NewsRead> }) => (
				<Button
					variant={getBumpDate(row.original) ? "default" : "outline"}
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						const newsBump: BumpNewsData["path"] = { news_id: row.original.id };
						handleBumpNews.mutate(
							{ path: newsBump },
							{
								onError: (error) => {
									toast.error(
										t("news.bump_error") +
											(error?.detail ? `: ${error.detail}` : ""),
									);
								},
							},
						);
					}}
				>
					{getBumpDate(row.original) ? (
						<>
							{t("news.last_bumped")} {getBumpDate(row.original)}
						</>
					) : (
						<>{t("news.no_bump")}</>
					)}
				</Button>
			),
		},
	];

	const handleBumpNews = useMutation({
		...bumpNewsMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("news.bump_success"));
			refetch();
		},
	});

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedNews, setSelectedNews] = useState<NewsRead | null>(null);

	const { data, error, refetch } = useSuspenseQuery({
		...getAllNewsOptions(),
		refetchOnWindowFocus: false,
	});

	const table = useCreateTable({ data: data ?? [], columns });

	const handleRowClick = (row: Row<NewsRead>) => {
		setSelectedNews(row.original);
		setEditFormOpen(true);
	};

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<PermissionWall
			requiredPermissions={[[ActionEnum.MANAGE, TargetEnum.NEWS]]}
		>
			<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
				<div className="px-8 space-x-4">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("admin:news.page_title")}
					</h3>
					<p className="py-3">{t("admin:news.page_description")}</p>
					<NewsForm />
					<AdminTable table={table} onRowClick={handleRowClick} />
					{selectedNews && (
						<NewsEditForm
							open={editFormOpen}
							onClose={() => {
								setEditFormOpen(false);
								setSelectedNews(null);
							}}
							selectedNews={selectedNews}
						/>
					)}
				</div>
			</Suspense>
		</PermissionWall>
	);
}
