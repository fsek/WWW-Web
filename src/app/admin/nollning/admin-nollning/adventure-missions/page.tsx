"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdventureMissionsPage() {
	const { t, i18n } = useTranslation();
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
		columnHelper.accessor(i18n.language === "en" ? "title_en" : "title_sv", {
			header: "Titel",
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor(i18n.language === "en" ? "description_en" : "description_sv", {
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

	const router = useRouter();

	return (
		<Suspense fallback={<div>{"Ingen nollning vald :(("}</div>}>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 underline underline-offset-4">
						Administrera äventyrsuppdrag för "{data.name}"
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() =>
							router.push(`/admin/nollning/admin-nollning?id=${nollningID}`)
						}
					>
						<ArrowLeft className="w-4 h-4" />
						Tillbaka
					</Button>
				</div>
				<div className="flex flex-row w-full justify-between items-end">
					<p className="">
						Klicka på ett uppdrag för att redigera eller förinta det! Du kan skapa nya uppdrag med knappen nedan. Tips: Sätt minsta poäng till 0 för att inte ge grupper poäng även om det markeras som ej godkänt.
					</p>
					<CreateAdventureMission nollningID={nollningID} />
				</div>
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
			</div>
		</Suspense>
	);
};