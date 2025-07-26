"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

import type { DocumentRead } from "@/api";
import { getAllDocumentsOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { is } from "date-fns/locale";

export default function Documents() {
	// TODO: Fix this page lmao
	const { t } = useTranslation();
	const { data, error, isPending } = useQuery({
		...getAllDocumentsOptions(),
	});
	const router = useRouter();

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
									router.push(
										`/documents/${row.row.original.id}`,
									);
								}}
							>
								{t("main:documents.details")}
							</Button>
						);
					},
				},
	];

	const table = useCreateTable({ data: data ?? [], columns });

	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<main className="flex-1">
				<div className="px-8 space-x-4 w-full lg:w-[80%] mx-auto">
					<h3 className="text-3xl py-3 underline underline-offset-4">
						{t("main:documents.page_title")}
					</h3>
					<p className="py-3">{t("main:documents.description")}</p>
					{isPending && <LoadingErrorCard />}
					{error && <LoadingErrorCard error={error} />}
					{!isPending && !error && (
						<AdminTable table={table} />
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
