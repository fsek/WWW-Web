import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table";
import type { AliasRead } from "@/api";
import { AliasSourceCell } from "../components/AliasSourceCell";
import { AliasTargetsCell } from "../components/AliasTargetsCell";

const columnHelper = createColumnHelper<AliasRead>();

export function useAliasColumns(onRefetch: () => void) {
	const { t } = useTranslation();

	return useMemo(
		() => [
			columnHelper.accessor("alias", {
				header: t("admin:mail_aliases.source"),
				cell: (info) => (
					<AliasSourceCell alias={info.getValue()} onRefetch={onRefetch} />
				),
				size: 150,
			}),
			columnHelper.accessor("members", {
				header: t("admin:mail_aliases.target"),
				enableSorting: false,
				cell: (info) => (
					<AliasTargetsCell
						alias={info.row.original.alias}
						targets={info.getValue()}
						onRefetch={onRefetch}
					/>
				),
				size: 250,
			}),
		],
		[t, onRefetch],
	);
}
