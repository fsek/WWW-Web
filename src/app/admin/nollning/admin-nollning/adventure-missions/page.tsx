"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import idAsNumber from "../idAsNumber";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getNollningOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper } from "@tanstack/react-table";
import type { AdventureMissionRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import CreateAdventureMission from "./createAdventureMission";
import EditAdventureMission from "./editAdventureMission";

const page = () => {
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	const nollningID = idAsNumber(search);
	const [selectedMission, setSelectedMission] =
		useState<AdventureMissionRead | null>(null);
	const [open, setOpen] = useState<boolean>(false);

	const { data } = useSuspenseQuery({
		...getNollningOptions({
			path: { nollning_id: nollningID },
		}),
	});

	const columnHelper = createColumnHelper<AdventureMissionRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: "Titel",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("description", {
			header: "Uppdrag",
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "points",
			header: "Poäng",
			cell: (info) => {
				const row = info.row.original;
				return row.min_points === row.max_points
					? `${row.max_points}`
					: `${row.min_points}–${row.max_points}`;
			},
		}),
		columnHelper.accessor("nollning_week", {
			header: "Vecka",
			cell: (info) => info.getValue(),
		}),
	];

	const table = useCreateTable({ data: data.missions ?? [], columns });

	function onClose() {
		setOpen(false);
		setSelectedMission(null);
	}

	return (
		<Suspense fallback={<div>Nollning finns ej</div>}>
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera äventyrsuppdrag för "{data.name}"
			</h3>
			<p className="py-3">Här kan du skapa äventyrsuppdrag</p>
			<CreateAdventureMission nollningID={nollningID} />
			<AdminTable
				table={table}
				onRowClick={(e) => {
					setSelectedMission(e.original);
					setOpen(true);
				}}
			/>
			<EditAdventureMission
				open={open}
				onClose={onClose}
				selectedMission={selectedMission as AdventureMissionRead}
				nollning_id={nollningID}
			/>
		</Suspense>
	);
};

export default page;
