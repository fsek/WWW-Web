// "use client";

// import { useState } from "react";
// import DocumentsForm from "./DocumentsForm";
// import DocumentsEditForm from "./DocumentsEditForm";
// import { getAllEventsOptions } from "@/api/@tanstack/react-query.gen";
// import { useQuery } from "@tanstack/react-query";
// import { createColumnHelper, type Row } from "@tanstack/react-table";

// import AdminTable from "@/widgets/AdminTable";
// import type { DocumentRead, EventRead } from "../../../api";
// import useCreateTable from "@/widgets/useCreateTable";
// import { useTranslation } from "react-i18next";
// import { LoadingErrorCard } from "@/components/LoadingErrorCard";

// export default function Documents() {
// 	// TODO: Fix this page lmao
// 	const { t } = useTranslation();
// 	const { data, error, isPending } = useQuery({
// 		...getAllEventsOptions(),
// 	});

// 	const [openEditDialog, setOpenEditDialog] = useState(false);
// 	const [selectedEvent, setSelectedEvent] = useState<EventRead | null>(null);

// 	// Column setup
// 	const columnHelper = createColumnHelper<DocumentRead>();
// 	const columns = [
// 		columnHelper.accessor("title", {
// 			header: t("admin:documents.title"),
// 			cell: (info) => info.getValue(),
// 		}),
// 		columnHelper.accessor("created_at", {
// 			header: t("admin:documents.created_at"),
// 			cell: (info) => info.getValue(),
// 		}),
// 		columnHelper.accessor("is_private", {
// 			header: t("admin:documents.public"),
// 			cell: (info) => !info.getValue(),
// 		}),
// 		columnHelper.accessor("edited_by", {
// 			header: t("admin:documents.edited_by"),
// 			cell: (info) => info.getValue(),
// 		}),
// 	];

// 	const table = useCreateTable({ data: data ?? [], columns });

// 	function handleRowClick(row: Row<EventRead>) {
// 		setSelectedEvent(row.original);
// 		setOpenEditDialog(true);
// 	}

// 	function handleClose() {
// 		setOpenEditDialog(false);
// 		setSelectedEvent(null);
// 	}

// 	if (isPending) {
// 		return <LoadingErrorCard />;
// 	}

// 	if (error) {
// 		return <LoadingErrorCard error={error} />;
// 	}

// 	return (
// 		<div className="px-8 space-x-4">
// 			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
// 				{t("admin:documents.page_title")}
// 			</h3>
// 			<p className="py-3">{t("admin:documents.description")}</p>
// 			<DocumentsForm />

// 			<AdminTable table={table} onRowClick={handleRowClick} />

// 			<DocumentsEditForm
// 				open={openEditDialog}
// 				onClose={() => handleClose()}
// 				// selectedDocument={selectedDocument as EventRead}
// 			/>
// 		</div>
// 	);
// }
