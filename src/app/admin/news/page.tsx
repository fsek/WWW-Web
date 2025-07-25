"use client";

import type { NewsRead } from "../../../api";
import NewsForm from "./NewsForm";
import { useQuery } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import NewsEditForm from "./NewsEditForm";
import { useState } from "react";

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

const columnHelper = createColumnHelper<NewsRead>();

const columns = [
	columnHelper.accessor("title_sv", {
		header: "Svensk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("title_en", {
		header: "Engelsk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("pinned_from", {
		header: "Pinnad Från",
		cell: (info) => {
			const date = info.getValue();
			return date ? new Date(date).toLocaleDateString("sv-SE") : "Oklart";
		},
	}),
	columnHelper.accessor("pinned_to", {
		header: "Pinnad Till",
		cell: (info) => {
			const date = info.getValue();
			return date ? new Date(date).toLocaleDateString("sv-SE") : "Oklart";
		},
	}),
];

export default function News() {
	const { t } = useTranslation();

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedNews, setSelectedNews] = useState<NewsRead | null>(null);

	const { data, isPending } = useQuery({
		...getAllNewsOptions(),
	});

	const table = useCreateTable({ data: data ?? [], columns });

	const handleRowClick = (row: Row<NewsRead>) => {
		setSelectedNews(row.original);
		setEditFormOpen(true);
	};

	if (isPending) {
		return <p> Hämtar</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				{t("admin:news.page_title")}
			</h3>
			<p className="py-3">
				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
			</p>
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
	);
}
