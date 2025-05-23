"use client";

import { getNollningOptions } from "@/api/@tanstack/react-query.gen";
import React, { Suspense } from "react";
import type { NollningGroupRead } from "@/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import { useSearchParams } from "next/navigation";
import idAsNumber from "./idAsNumber";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreateGroup from "./groups/CreateGroup";

export default function Page() {
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	const nollningID = idAsNumber(search);
	const router = useRouter();

	const { data } = useSuspenseQuery({
		...getNollningOptions({
			path: { nollning_id: nollningID },
		}),
	});

	const columnHelper = createColumnHelper<NollningGroupRead>();
	const columns = [
		columnHelper.accessor("group.name", {
			header: "Group Name",
			cell: (info) => info.getValue(),
		}),
	];

	const table = useCreateTable({ data: data.nollning_groups ?? [], columns });

	function adminAdventureMissions() {
		router.push(
			`/admin/nollning/admin-nollning/adventure-missions?id=${nollningID}`,
		);
	}

	return (
		<Suspense fallback={<div>{"Ingen nollning vald :(("}</div>}>
			<div className="px-8 space-x-4">
				<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
					Administrera "{data.name}"
				</h3>
				<p className="py-3">
					Här kan du skapa och redigera faddergrupper och äventyrsuppdrag
				</p>
				<Button onClick={adminAdventureMissions}>
					Administrera äventyrsuppdrag
				</Button>
				<CreateGroup nollningID={nollningID} />
				<AdminTable table={table} />
			</div>
		</Suspense>
	);
}
