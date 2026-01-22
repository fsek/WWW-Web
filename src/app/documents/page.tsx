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
import { Info } from "lucide-react";
import InfoBox from "@/widgets/InfoBox";

export default function Documents() {
	// TODO: Fix this page lmao
	const { t } = useTranslation("main");
	const { data, error, isPending } = useQuery({
		...getAllDocumentsOptions(),
	});
	const [searchTitle, setSearchTitle] = useState<string>("");
	const [selectedDocument, setSelectedDocument] = useState<DocumentRead>();
	const [infoBoxOpen, setInfoBoxOpen] = useState<boolean>(false);

	// Column setup
	const columnHelper = createColumnHelper<DocumentRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("main:documents.title"),
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor("category", {
			maxSize: 64,
			size: 0,
			minSize: 32,
			header: t("main:documents.category"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("created_at", {
			header: t("main:documents.created_at"),
			size: 0,
			meta: {
				tooltip: (info: DocumentRead) => info.created_at.toLocaleString(),
			},
			cell: (info) =>
				new Date(info.getValue()).toLocaleDateString("sv-SE", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
		}),
		{
			id: "view",
			enableSorting: false,
			size: 0,
			meta: { tooltip: () => t("admin:documents.show_info") },
			cell: (row: { row: Row<DocumentRead> }) => {
				return (
					<Button
						size="icon-sm"
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							setSelectedDocument(row.row.original);
							setInfoBoxOpen(true);
						}}
					>
						<Info />
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

	const table = useCreateTable({
		data: filteredData,
		columns,
		initialSorting: [{ id: "created_at", desc: true }],
	});

	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<main className="flex-1">
				{selectedDocument && (
					<InfoBox
						open={infoBoxOpen}
						onClose={() => setInfoBoxOpen(false)}
						displayData={[
							// Look i really did try to make this better but typescript doesn't have a type system :)
							{ label: t("documents.title"), value: selectedDocument.title },
							{
								label: t("documents.author"),
								value: `${selectedDocument.author.first_name} ${selectedDocument.author.last_name}`,
							},
							{
								label: t("documents.file_name"),
								value: selectedDocument.file_name,
							},
							{
								label: t("documents.category"),
								value: selectedDocument.category,
							},
							{
								label: t("documents.created_at"),
								value: selectedDocument.created_at.toLocaleString(),
							},
							{
								label: t("documents.updated_at"),
								value: selectedDocument.updated_at.toLocaleString(),
							},
							{
								label: t("documents.is_private"),
								value: selectedDocument.is_private ? t("yes") : t("no"),
							},
						]}
						lg_columns={3}
					/>
				)}
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
							<AdminTable
								table={table}
								onRowClick={(row) => {
									const url = `/documents/${row.original.id}`;
									window.open(url, "_blank", "noopener,noreferrer");
								}}
							/>
						</>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
