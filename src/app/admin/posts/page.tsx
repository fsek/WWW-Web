"use client";

import {
	getAllPostsOptions,
	getCouncilOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PostRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";

function CouncilName({ council_id }: { council_id: number }) {
	const { data } = useQuery(
		getCouncilOptions({
			path: {
				council_id,
			},
		}),
	);

	return data?.name;
}

// Column setup
const columnHelper = createColumnHelper<PostRead>();
const columns = [
	columnHelper.accessor("id", {
		header: "ID",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("name", {
		header: "Namn",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("council_id", {
		header: "Utskott",
		cell: (info) => <CouncilName council_id={info.getValue()} />, //fixa så att man ser utskottsnamn
	}),
];

export default function Posts() {
	const { data, error, isPending } = useQuery({
		...getAllPostsOptions(),
	});

	const { t } = useTranslation();

	const table = useCreateTable({ data: data ?? [], columns });

	if (isPending) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				{t("admin:posts.page_title")}
			</h3>
			<p className="py-3">Här kan du se de poster som finns på sektionen</p>

			<AdminTable table={table} />
		</div>
	);
}
