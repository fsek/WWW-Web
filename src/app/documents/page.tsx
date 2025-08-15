"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import type { DocumentRead } from "@/api";
import { getAllDocumentsOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function Documents() {
	// TODO: Fix this page lmao
	const { t } = useTranslation();
	const { data, error, isPending } = useQuery({
		...getAllDocumentsOptions(),
	});
	const [searchTitle, setSearchTitle] = useState<string>("");

	// Column setup
	const columnHelper = createColumnHelper<DocumentRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("main:documents.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("created_at", {
			header: t("main:documents.created_at"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					hour: "2-digit",
					minute: "2-digit",
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
		}),
		columnHelper.accessor("is_private", {
			header: t("main:documents.private_explanation"),
			cell: (info) => (info.getValue() ? t("main:yes") : t("main:no")),
		}),
		columnHelper.accessor("category", {
			header: t("main:documents.category"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("author", {
			header: t("main:documents.author"),
			cell: (info) => {
				const author = info.getValue();
				return `${author.first_name} ${author.last_name}`;
			},
		}),
		{
			id: "view",
			header: t("main:documents.view"),
			cell: (row: { row: Row<DocumentRead> }) => {
				return (
					<Button
						variant="outline"
						className={"px-2 py-1 border"}
						onClick={(e) => {
							e.stopPropagation();
							const url = `/documents/${row.row.original.id}`;
							window.open(url, "_blank", "noopener,noreferrer");
						}}
					>
						{t("main:documents.view")}
					</Button>
				);
			},
		},
	];

	// Filter data based on searchTitle
	const filteredData = useMemo(() => {
		if (!data) return [];
		const lower = (searchTitle ?? "").toLowerCase();

		return data.filter((doc) => {
			const matchesSearch =
				doc.title.toLowerCase().includes(lower) ||
				doc.category.toLowerCase().includes(lower);
			return matchesSearch;
		});
	}, [data, searchTitle]);

	const table = useCreateTable({ data: filteredData, columns });

	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<main className="flex-1">
				<div className="px-8 space-x-4 w-full lg:w-[80%] mx-auto">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("main:documents.page_title")}
					</h3>
					<p className="py-3">{t("main:documents.description")}</p>
					{isPending && <LoadingErrorCard />}
					{error && <LoadingErrorCard error={error} />}
					{!isPending && !error && (
						<>
							{/* Search input for filtering by title */}
							<div className="py-3">
								<input
									type="search"
									placeholder={t("main:documents.search_title")}
									value={searchTitle}
									onChange={(e) => setSearchTitle(e.target.value)}
									className="w-96 border rounded px-3 py-2"
								/>
							</div>
							<AdminTable table={table} />
						</>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
