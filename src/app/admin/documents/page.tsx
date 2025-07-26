"use client";

import { useState } from "react";
import DocumentsForm from "./DocumentsForm";
import DocumentsEditForm from "./DocumentsEditForm";
import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { EventRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

import type { DocumentRead } from "@/api";
import { getAllDocumentsOptions } from "@/api/@tanstack/react-query.gen";

export default function Documents() {
	// TODO: Fix this page lmao
	const { t } = useTranslation();
	const { data, error, isPending } = useQuery({
		...getAllDocumentsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState<DocumentRead | null>(
		null,
	);

	// Column setup
	const columnHelper = createColumnHelper<DocumentRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("admin:documents.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("created_at", {
			header: t("admin:documents.created_at"),
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
			header: t("admin:documents.private_explanation"),
			cell: (info) => (info.getValue() ? t("admin:yes") : t("admin:no")),
		}),
		columnHelper.accessor("author", {
			header: t("admin:documents.author"),
			cell: (info) => {
				const author = info.getValue();
				return `${author.first_name} ${author.last_name}`;
			},
		}),
	];

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<DocumentRead>) {
		setSelectedDocument(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedDocument(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 underline underline-offset-4">
				{t("admin:documents.page_title")}
			</h3>
			<p className="py-3">{t("admin:documents.description")}</p>
			<DocumentsForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<DocumentsEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedDocument={selectedDocument as DocumentRead}
			/>
		</div>
	);
}
