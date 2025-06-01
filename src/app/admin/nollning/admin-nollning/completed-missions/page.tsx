"use client";

import type { AdventureMissionRead } from "@/api";
import {
	addCompletedMissionToGroupMutation,
	editCompletedMissionInGroupMutation,
	getAllAdventureMissionsInNollningOptions,
	getCompletedMissionsFromGroupOptions,
	getCompletedMissionsFromGroupQueryKey,
	getSingleGroupOptions,
	removeCompletedMissionFromGroupMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import idAsNumber from "../idAsNumber";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import MissionPointRangeDialog from "./missionPointRangeDialog";
import { Button } from "@/components/ui/button";

const page = () => {
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
		...getCompletedMissionsFromGroupOptions({
			path: { nollning_id: nollningID, group_id: groupID },
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
			return "bg-green-100";
		}
		return "white";
	}

	const queryClient = useQueryClient();

	const addCompletedMission = useMutation({
		...addCompletedMissionToGroupMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getCompletedMissionsFromGroupQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => {},
	});

	const removeCompletedMission = useMutation({
		...removeCompletedMissionFromGroupMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getCompletedMissionsFromGroupQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => {},
	});

	const editCompletedMission = useMutation({
		...editCompletedMissionInGroupMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getCompletedMissionsFromGroupQueryKey({
					path: { nollning_id: nollningID, group_id: groupID },
				}),
			});
		},
		onError: () => {},
	});

	const mutationOptions = {
		onSuccess: () => {
			console.log("Yay!!");
			setEditDialogOpen(false);
			setSelectedMission(null);
		},
		onError: () => {
			console.log("oopsie");
			setEditDialogOpen(false);
			setSelectedMission(null);
		},
	};

	function handleRowClickFixedPoints(row: Row<AdventureMissionRead>) {
		if (completedMissionsID.includes(row.original.id)) {
			console.log(nollningID);
			console.log(groupID);
			console.log(row.original.id);
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
			console.log("hejHej");
			addCompletedMission.mutate(
				{
					path: { group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
						points: row.original.max_points,
					},
				},
				mutationOptions,
			);
		}
	}

	function handleRowClickPointRange(row: Row<AdventureMissionRead>) {
		setSelectedMission(row.original);
		if (completedMissionsID.includes(row.original.id)) {
			console.log("tabort/ändra");
			setEditDialogOpen(true);
		} else {
			console.log("läggtill");
			setAddDialogOpen(true);
		}
	}

	const columnHelper = createColumnHelper<AdventureMissionRead>();
	const columns = [
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

	return (
		<Suspense fallback={<div>{"Ingen nollning vald :(("}</div>}>
			<div className="px-8 space-x-4 space-y-4">
				<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
					Äventyrsuppdrag för "{group.data.name}"
				</h3>
				<p className="py-3">
					Här kan du skapa och redigera faddergrupper och äventyrsuppdrag
				</p>

				<AdminTable
					table={table}
					onRowClick={(row) => {
						if (row.original.min_points !== row.original.max_points) {
							handleRowClickPointRange(row);
							console.log("hejhejhej");
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
					onClose={() => {
						setEditDialogOpen(false);
						setSelectedMission(null);
					}}
					selectedMission={selectedMission as AdventureMissionRead}
					onSubmit={(points: number, adventure_mission_id: number) =>
						editCompletedMission.mutate(
							{
								path: { group_id: groupID },
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
								path: { group_id: groupID },
								body: {
									adventure_mission_id: adventure_mission_id,
									points: points,
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
