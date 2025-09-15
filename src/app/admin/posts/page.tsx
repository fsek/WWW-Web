"use client";

import {
	getAllCouncilsOptions,
	getAllPostsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	createColumnHelper,
	type Row,
} from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PostRead } from "../../../api";
import PostForm from "./PostForm";
import PostEditForm from "./PostEditForm";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";

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
	const columns: ColumnDef<PostRead, any>[] = [
		columnHelper.accessor(i18n.language === "en" ? "name_en" : "name_sv", {
			header: t("posts.name", "Post"),
			cell: (info) => info.getValue(),
			id: "name",
		}),
		columnHelper.accessor("council_id", {
			header: t("posts.council", "Council name"),
			enableGlobalFilter: false, // it doesn't make sense to filter by council id
			cell: (info) => <CouncilName councilId={info.getValue()} />,
		}),
		columnHelper.accessor("email", {
			header: t("posts.email", "Email"),
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

	return (
		<AdminPage
			title={t("posts.title")}
			description={t("posts.description")}
			queryResult={useQuery({
				...getAllPostsOptions(),
			})}
			columns={columns}
			editComponent={PostEditForm}
			headerButtons={<PostForm />}
		/>
	);
}
