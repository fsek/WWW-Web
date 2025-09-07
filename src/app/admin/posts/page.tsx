"use client";

import { useState } from "react";
import {
	getAllCouncilsOptions,
	getAllPostsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PostRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import PostForm from "./PostForm";
import PostEditForm from "./PostEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export default function Posts() {
	const { t, i18n } = useTranslation("admin");

	function CouncilName({ councilId }: { councilId: number }) {
		const { data } = useQuery({
			...getAllCouncilsOptions(),
		});

		const council = data?.find((c) => c.id === councilId);

		if (!council?.name_en && !council?.name_sv) {
			return t("posts.council_not_found");
		}

		return i18n.language === "en" ? council?.name_en : council?.name_sv;
	}

	// Column setup
	const columnHelper = createColumnHelper<PostRead>();
	const columns = [
		columnHelper.accessor(i18n.language === "en" ? "name_en" : "name_sv", {
			header: t("posts.name"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("council_id", {
			header: t("posts.council"),
			cell: (info) => <CouncilName councilId={info.getValue()} />,
		}),
		columnHelper.accessor("email", {
			header: t("posts.email"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("elected_at_semester", {
			header: t("posts.elected_at_semester"),
			cell: (info) => {
				const val = info.getValue();
				if (!val) return "-";
				return t(`enums.elected_at_semester.${val}`);
			},
		}),
		columnHelper.accessor("elected_by", {
			header: t("posts.elected_by"),
			cell: (info) => {
				const val = info.getValue();
				if (!val) return "-";
				return t(`enums.elected_by.${val}`);
			},
		}),
	];

	const { data, error, isPending } = useQuery({
		...getAllPostsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<PostRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<PostRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedEvent(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
				{t("posts.title")}
			</h3>
			<p className="py-3">{t("posts.description")}</p>
			<PostForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<PostEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedPost={selectedEvent as PostRead}
			/>
		</div>
	);
}
