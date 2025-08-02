"use client";

import type { AdventureMissionRead } from "@/api";
import {
	addGroupMissionMutation,
	editGroupMissionMutation,
	deleteGroupMissionMutation,
	getGroupMissionsFromNollningGroupOptions,
	getAllAdventureMissionsInNollningOptions,
	getSingleGroupOptions,
	getAllAdventureMissionsInNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import idAsNumber from "../idAsNumber";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import MissionPointRangeDialog from "./missionPointRangeDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const page = () => {
	const { t, i18n } = useTranslation();
	const searchParams = useSearchParams();
	const searchID = searchParams.get("id");
	const searchGroup = searchParams.get("group");
	const nollningID = idAsNumber(searchID);
	const groupID = idAsNumber(searchGroup);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [selectedMission, setSelectedMission] =
		useState<AdventureMissionRead | null>(null);

	const allAdventureMissions = useSuspenseQuery({
		...getAllAdventureMissionsInNollningOptions({
			path: { nollning_id: nollningID },
		}),
	});

	const completedAdventureMissions = useSuspenseQuery({
		...getGroupMissionsFromNollningGroupOptions({
			path: { nollning_group_id: groupID },
		}),
	});

	const group = useSuspenseQuery({
		...getSingleGroupOptions({
			path: { id: groupID },
		}),
	});

	const completedMissionsID: number[] = completedAdventureMissions.data.map(
		(e) => e.adventure_mission.id,
	);

	function rowColor(row: Row<AdventureMissionRead>) {
		if (completedMissionsID.includes(row.original.id)) {
			return "bg-sidebar";
		}
		return "white";
	}

	const queryClient = useQueryClient();

	const addCompletedMission = useMutation({
		...addGroupMissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllAdventureMissionsInNollningQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => { },
	});

	const removeCompletedMission = useMutation({
		...deleteGroupMissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllAdventureMissionsInNollningQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => { },
	});

	const editCompletedMission = useMutation({
		...editGroupMissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getAllAdventureMissionsInNollningQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => { },
	});

	const mutationOptions = {
		onSuccess: () => {
			setEditDialogOpen(false);
			setSelectedMission(null);
		},
		onError: () => {
			setEditDialogOpen(false);
			setSelectedMission(null);
		},
	};

	function handleRowClickFixedPoints(row: Row<AdventureMissionRead>) {
		if (completedMissionsID.includes(row.original.id)) {
			removeCompletedMission.mutate(
				{
					path: {
						nollning_id: nollningID,
						group_id: groupID,
						mission_id: row.original.id,
					},
					body: {
						group_id: groupID,
						mission_id: row.original.id,
					},
				},
				mutationOptions,
			);
		} else {
			addCompletedMission.mutate(
				{
					path: { nollning_group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
					},
				},
				mutationOptions,
			);
		}
	}

	function handleRowClickPointRange(row: Row<AdventureMissionRead>) {
		setSelectedMission(row.original);
		if (completedMissionsID.includes(row.original.id)) {
			setEditDialogOpen(true);
		} else {
			setAddDialogOpen(true);
		}
	}

	const columnHelper = createColumnHelper<AdventureMissionRead>();
	const columns = [
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
		columnHelper.accessor("id", {
			id: "id",
			header: "Fådda Poäng",
			cell: (info) => {
				if (completedMissionsID.includes(info.getValue())) {
					return `${completedAdventureMissions.data.find((e) => e.adventure_mission.id === info.getValue())?.points ?? 0}`;
				}
				return "0";
			},
		}),
		columnHelper.accessor("nollning_week", {
			header: "Vecka",
			cell: (info) => info.getValue(),
		}),
	];

	const table = useCreateTable({
		data: allAdventureMissions.data ?? [],
		columns,
	});

	const router = useRouter();

	return (
		<Suspense
			fallback={<div>{"Ingen faddergrupp (eller nollning) vald :(("}</div>}
		>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 underline underline-offset-4">
						Äventyrsuppdrag för "{group.data.name}"
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() =>
							router.push(`/admin/nollning/admin-nollning/?id=${nollningID}`)
						}
					>
						<ArrowLeft className="w-4 h-4" />
						Tillbaka
					</Button>
				</div>
				<p className="py-3">
					Här kan du skapa och redigera faddergrupper och äventyrsuppdrag
				</p>

				<AdminTable
					table={table}
					onRowClick={(row) => {
						if (row.original.min_points !== row.original.max_points) {
							handleRowClickPointRange(row);
						} else {
							handleRowClickFixedPoints(row);
						}
					}}
					rowClassName={rowColor}
				/>
				<MissionPointRangeDialog
					title={"Ändra avklarat uppdrag"}
					open={editDialogOpen}
					defaultPoints={
						completedAdventureMissions.data.find(
							(e) => e.adventure_mission.id === selectedMission?.id,
						)?.points ?? 0
					}
					maxPoints={selectedMission?.max_points ?? 0}
					minPoints={selectedMission?.min_points ?? 0}
					onClose={() => {
						setEditDialogOpen(false);
						setSelectedMission(null);
					}}
					selectedMission={selectedMission as AdventureMissionRead}
					onSubmit={(points: number, adventure_mission_id: number) =>
						editCompletedMission.mutate(
							{
								path: { nollning_group_id: groupID },
								body: {
									adventure_mission_id: adventure_mission_id,
									points: points,
								},
							},
							mutationOptions,
						)
					}
				>
					<Button
						onClick={() =>
							removeCompletedMission.mutate(
								{
									path: {
										nollning_id: nollningID,
										group_id: groupID,
										mission_id: selectedMission?.id ?? 0,
									},
									body: {
										group_id: groupID,
										mission_id: selectedMission?.id ?? 0,
									},
								},
								mutationOptions,
							)
						}
					>
						Gör Oavklarat
					</Button>
				</MissionPointRangeDialog>
				<MissionPointRangeDialog
					title={"Lägg till avklarat uppdrag"}
					open={addDialogOpen}
					defaultPoints={selectedMission?.max_points}
					onClose={() => {
						setAddDialogOpen(false);
						setSelectedMission(null);
					}}
					selectedMission={selectedMission as AdventureMissionRead}
					onSubmit={(points: number, adventure_mission_id: number) =>
						addCompletedMission.mutate(
							{
								path: { nollning_group_id: groupID },
								body: {
									adventure_mission_id: adventure_mission_id,
								},
							},
							mutationOptions,
						)
					}
				/>
			</div>
		</Suspense>
	);
};

export default page;
