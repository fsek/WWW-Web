"use client";

import {
	type EncloseMooseLevelRead,
	mooseAdminGetAllLevelsOptions,
	mooseAdminGetLevelOptions,
	mooseGetAllLevelsOptions,
} from "../../../api";
import { useTranslation } from "react-i18next";
import AdminPage from "@/widgets/AdminPage";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	createColumnHelper,
	type Row,
} from "@tanstack/react-table";
import EncloseMooseLevelEditForm from "./EncloseMooseLevelEditForm";
import EncloseMooseLevelForm from "./EncloseMooseLevelForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { useState } from "react";

export default function EncloseMoose() {
	const { t } = useTranslation("admin");
	const router = useRouter();

	const columnHelper = createColumnHelper<EncloseMooseLevelRead>();

	const dayIndexFilter = (row: any, columnId: string, filterValue: string) => {
		const value = row.getValue(columnId);
		switch (filterValue) {
			case "daily":
				return value !== null;
			case "bonus":
				return value === null;
		}
		return true;
	};

	const columns: ColumnDef<EncloseMooseLevelRead, any>[] = [
		columnHelper.accessor("name_sv", {
			header: t("enclose_moose.level_name_sv"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("name_en", {
			header: t("enclose_moose.level_name_en"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("release_date", {
			header: t("enclose_moose.release_date"),
			cell: (info) => new Date(info.getValue()).toLocaleDateString("sv-SE"),
		}),
		columnHelper.accessor("day_index", {
			header: t("enclose_moose.day_index"),
			cell: (info) =>
				info.getValue() ?? (
					<span className="italic text-muted-foreground">
						{t("enclose_moose.day_index_missing")}
					</span>
				),
			filterFn: dayIndexFilter,
		}),
		// {
		// 	id: "view",
		// 	header: t("enclose_moose.results"),
		// 	cell: ({ row }: { row: Row<EncloseMooseLevelRead> }) => (
		// 		<Button
		// 			variant="outline"
		// 			onClick={(e) => {
		// 				e.stopPropagation();
		// 				router.push(`/admin/enclose-moose/levels/${row.original.level_id}`);
		// 			}}
		// 		>
		// 			{t("enclose_moose.view_results")}
		// 		</Button>
		// 	),
		// },
	];

	const [filterValue, setFilterValue] = useState("all");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	return (
		<AdminPage
			title={t("enclose_moose.page_title")}
			description={t("enclose_moose.page_description")}
			queryResult={useQuery({
				...mooseAdminGetAllLevelsOptions(),
				refetchOnWindowFocus: false,
			})}
			columns={columns}
			editComponent={EncloseMooseLevelEditForm}
			headerButtons={
				<>
					<SelectFromOptions
						className="w-auto"
						options={[
							{ value: "all", label: t("enclose_moose.view_all_levels") },
							{ value: "daily", label: t("enclose_moose.view_daily_levels") },
							{ value: "bonus", label: t("enclose_moose.view_bonus_levels") },
						]}
						value={filterValue}
						onChange={(newFilter) => {
							setColumnFilters(() =>
								newFilter === "all"
									? []
									: [{ id: "day_index", value: newFilter }],
							);
							setFilterValue(newFilter);
						}}
					/>
					<EncloseMooseLevelForm />
				</>
			}
			columnFilters={columnFilters}
			onColumnFiltersChange={setColumnFilters}
			initialSorting={[
				{ id: "release_date", desc: true },
				{ id: "day_index", desc: true },
			]}
		/>
	);
}
