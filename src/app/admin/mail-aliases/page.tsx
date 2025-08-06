"use client";

import type { AliasRead } from "@/api";
import { aliasListAliasesOptions } from "@/api/@tanstack/react-query.gen";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import SourceForm from "./SourceForm";
import { useAliasColumns } from "./hooks/useAliasColumns";

// Use fake data instead of API
const useFakeData = false;

const fakeAliasData: AliasRead[] = [
	{
		alias: "board@fsektionen.se",
		members: [
			"president@fsektionen.se",
			"vice-president@fsektionen.se",
			"treasurer@fsektionen.se",
		],
	},
	{
		alias: "teknikfokus@fsektionen.se",
		members: [
			"editor@fsektionen.se",
			"journalist1@fsektionen.se",
			"journalist2@fsektionen.se",
		],
	},
	{
		alias: "sexmasteriet@fsektionen.se",
		members: ["sexmaster@fsektionen.se", "vice-sexmaster@fsektionen.se"],
	},
	{
		alias: "cafe@fsektionen.se",
		members: [
			"cafemaster@fsektionen.se",
			"barista1@fsektionen.se",
			"barista2@fsektionen.se",
			"barista3@fsektionen.se",
		],
	},
	{
		alias: "event@fsektionen.se",
		members: [
			"eventmaster@fsektionen.se",
			"event-coordinator@fsektionen.se",
			"president@fsektionen.se",
		],
	},
	{
		alias: "info@fsektionen.se",
		members: [
			"infomaster@fsektionen.se",
			"webmaster@fsektionen.se",
			"social-media@fsektionen.se",
		],
	},
	{
		alias: "study@fsektionen.se",
		members: ["studieradgivare@fsektionen.se", "studierektor@fsektionen.se"],
	},
];

export default function MailAliasPage() {
	const { t } = useTranslation();
	const {
		data: aliasListFromAPI,
		error,
		isLoading,
		refetch: refetchAliasList,
	} = useQuery({
		...aliasListAliasesOptions(),
		refetchOnWindowFocus: false,
		enabled: !useFakeData,
	});

	const aliasPairList = useFakeData ? fakeAliasData : aliasListFromAPI;

	const [search, setSearch] = useState<string>("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const filteredAliasPairList = useMemo(() => {
		if (!aliasPairList) return [];
		const lower = search.toLowerCase();
		return aliasPairList.filter((pair) => {
			const matchesSearch =
				pair.alias.toLowerCase().includes(lower) ||
				pair.members.some((m) => m.toLowerCase().includes(lower));
			return matchesSearch;
		});
	}, [aliasPairList, search]);

	const columns = useAliasColumns(refetchAliasList);

	const table = useReactTable({
		columns: columns,
		data: filteredAliasPairList,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	if (!useFakeData && isLoading) {
		return <LoadingErrorCard />;
	}

	if (!useFakeData && error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:mail_aliases.list")}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:mail_aliases.list_description")}
				</p>
				<div className="mt-4 mb-2 flex flex-row gap-2 items-center flex-wrap">
					<div className="w-xs">
						<Input
							placeholder={t("admin:mail_aliases.search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
				</div>
				<Separator className="mb-8" />
			</div>
			<SourceForm />
			<Separator />
			<AdminTable table={table} />
		</div>
	);
}
