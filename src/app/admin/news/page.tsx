"use client";

import { action, target, type NewsRead } from "../../../api";
import NewsForm from "./NewsForm";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import NewsEditForm from "./NewsEditForm";
import { useState } from "react";
import PermissionWall from "@/components/PermissionWall";
import { Suspense } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
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
	];

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedNews, setSelectedNews] = useState<NewsRead | null>(null);

	const { data, error } = useSuspenseQuery({
		...getAllNewsOptions(),
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
		<PermissionWall requiredPermissions={[[action.MANAGE, target.NEWS]]}>
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
