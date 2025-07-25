"use client";

import type { NewsRead } from "../../../api";
import NewsForm from "./NewsForm";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
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

const columns = [
	columnHelper.accessor("title_sv", {
		header: "Svensk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("content_sv", {
		header: "Svensk beskrivning",
		cell: (info) => info.getValue(),
	}),
];

export default function News() {
	const { t } = useTranslation();

	const { data, error } = useSuspenseQuery({
		...getAllNewsOptions(),
	});

	console.log(data);

	const table = useCreateTable({ data: data ?? [], columns });

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<PermissionWall requiredPermissions={[["manage", "News"]]}>
			<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
				<div className="px-8 space-x-4">
					<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
						{t("admin:news.page_title")}
					</h3>
					<p className="py-3">
						Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
					</p>
					<NewsForm />
					<AdminTable table={table} />
				</div>
			</Suspense>
		</PermissionWall>
	);
}
