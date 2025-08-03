"use client";

import type { AdventureMissionRead, GroupMissionRead } from "@/api";
import {
	getGroupMissionsFromNollningGroupOptions,
	getAllAdventureMissionsInNollningOptions,
	getSingleGroupOptions,
	getAllAdventureMissionsInNollningQueryKey,
	addCompletedGroupMissionMutation,
	uncompleteGroupMissionMutation,
	editCompletedGroupMissionMutation,
	getGroupMissionsFromNollningGroupQueryKey,
	getSingleGroupQueryKey,
} from "@/api/@tanstack/react-query.gen";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import idAsNumber from "../idAsNumber";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import MissionPointRangeDialog from "./missionPointRangeDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import WeekFilter from "@/components/WeekFilter";
import { Input } from "@/components/ui/input";
import { is_accepted as acceptEnum } from "@/api";

export default function CompletedMissionsPage() {
	const { t, i18n } = useTranslation();
	const searchParams = useSearchParams();
	const router = useRouter();
	const searchID = searchParams.get("id");
	const searchGroup = searchParams.get("group");
	const nollningID = idAsNumber(searchID);
	const groupID = idAsNumber(searchGroup);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [selectedMission, setSelectedMission] =
		useState<AdventureMissionRead | null>(null);
	const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
	const [weekLoaded, setWeekLoaded] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const savedWeek = localStorage.getItem("completedMissions_weekFilter");
		if (savedWeek && savedWeek !== "null") {
			setSelectedWeek(Number.parseInt(savedWeek));
		}
		setWeekLoaded(true);
	}, []);

	useEffect(() => {
		if (!weekLoaded) return;
		if (selectedWeek !== null) {
			localStorage.setItem("completedMissions_weekFilter", selectedWeek.toString());
		} else {
			localStorage.removeItem("completedMissions_weekFilter");
		}
	}, [selectedWeek, weekLoaded]);

	const allAdventureMissions = useSuspenseQuery({
		...getAllAdventureMissionsInNollningOptions({
			path: { nollning_id: nollningID },
		}),
		refetchOnWindowFocus: false,
	});

	// Filter missions based on selected week
	const filteredAdventureMissions = useMemo(() => {
		let missions = allAdventureMissions.data ?? [];
		// Filter by week if selected
		if (selectedWeek !== null) {
			missions = missions.filter((mission) => mission.nollning_week === selectedWeek);
		}
		// Filter by search term if provided
		if (searchTerm.trim() !== "") {
			const term = searchTerm.toLowerCase();
			missions = missions.filter((mission) =>
			(mission.title_en?.toLowerCase().includes(term) ||
				mission.title_sv?.toLowerCase().includes(term) ||
				mission.description_en?.toLowerCase().includes(term) ||
				mission.description_sv?.toLowerCase().includes(term))
			);
		}
		return missions;
	}, [allAdventureMissions.data, selectedWeek, searchTerm]);

	const completedAdventureMissions = useSuspenseQuery({
		...getGroupMissionsFromNollningGroupOptions({
			path: { nollning_group_id: groupID },
		}),
		refetchOnWindowFocus: false,
	});

	const group = useSuspenseQuery({
		...getSingleGroupOptions({
			path: { id: groupID },
		}),
		refetchOnWindowFocus: false,
	});

	const completedMissionsID: number[] = completedAdventureMissions.data.map(
		(e) => e.adventure_mission.id,
	);

	function rowColor(row: Row<AdventureMissionRead>) {
		const completedMission = completedAdventureMissions.data.find(
			(mission) => mission.adventure_mission.id === row.original.id,
		);
		if (!completedMission) {
			return "";
		}
		if (completedMission.is_accepted === acceptEnum.ACCEPTED) {
			return "bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800";
		}
		if (completedMission.is_accepted === acceptEnum.FAILED) {
			return "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800";
		}
		if (completedMission.is_accepted === acceptEnum.REVIEW) {
			return "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800";
		}
		return "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-800";
	}

	const queryClient = useQueryClient();

	function invalidateAllQueries() {
		queryClient.invalidateQueries({
			queryKey: getAllAdventureMissionsInNollningQueryKey({
				path: { nollning_id: nollningID },
			}),
		});
		queryClient.invalidateQueries({
			queryKey: getGroupMissionsFromNollningGroupQueryKey({
				path: { nollning_group_id: groupID },
			}),
		});
		queryClient.invalidateQueries({
			queryKey: getSingleGroupQueryKey({
				path: { id: groupID },
			}),
		});
	}

	const addCompletedMission = useMutation({
		...addCompletedGroupMissionMutation(),
		onSuccess: () => {
			invalidateAllQueries();
		},
		onError: () => { },
	});

	const removeCompletedMission = useMutation({
		...uncompleteGroupMissionMutation(),
		onSuccess: () => {
			invalidateAllQueries();
		},
		onError: () => { },
	});

	const editCompletedMission = useMutation({
		...editCompletedGroupMissionMutation(),
		onSuccess: () => {
			invalidateAllQueries();
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

	function handleRowClick(row: Row<AdventureMissionRead>) {
		// This always called when the user clicks on a row
		const completedMission = completedAdventureMissions.data.find(
			(mission) => mission.adventure_mission.id === row.original.id,
		);

		if (!completedMission) {
			addCompletedMission.mutate(
				{
					path: { nollning_group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
						points: row.original.max_points, // Use max points as default
						is_accepted: acceptEnum.ACCEPTED, // Default to accepted
					},
				},
				mutationOptions,
			);
			return;
		}


		// If mission is already completed, toggle its state
		if (completedMissionsID.includes(row.original.id) && completedMission.is_accepted === acceptEnum.ACCEPTED) {
			editCompletedMission.mutate(
				{
					path: { nollning_group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
						points: row.original.min_points, // Use min points as default
						is_accepted: acceptEnum.FAILED,
					},
				},
				mutationOptions,
			);
		}
		if (completedMissionsID.includes(row.original.id) && completedMission.is_accepted === acceptEnum.FAILED) {
			removeCompletedMission.mutate(
				{
					path: { nollning_group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
					},
				},
				mutationOptions,
			);
		}
		if (completedMissionsID.includes(row.original.id) && completedMission.is_accepted === acceptEnum.REVIEW) {
			editCompletedMission.mutate(
				{
					path: { nollning_group_id: groupID },
					body: {
						adventure_mission_id: row.original.id,
						points: row.original.max_points, // Use max points as default
						is_accepted: acceptEnum.ACCEPTED, // Default to accepted
					},
				},
				mutationOptions,
			);
		}
	}

	function handleClickAdvanced(row: Row<AdventureMissionRead>) {
		setSelectedMission(row.original);
		if (completedMissionsID.includes(row.original.id)) {
			setEditDialogOpen(true);
		} else {
			setAddDialogOpen(true);
		}
	}

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
		columnHelper.accessor("id", {
			id: "id",
			header: "Fådda Poäng",
			cell: (info) => {
				if (completedMissionsID.includes(info.getValue())) {
					return `${completedAdventureMissions.data.find((e) => e.adventure_mission.id === info.getValue())?.points ?? 0}`;
				}
				return "-";
			},
		}),
		columnHelper.accessor("nollning_week", {
			header: "Vecka",
			cell: (info) => info.getValue(),
		}),
		{
			id: "actions",
			header: "Åtgärder",
			cell: ({ row }: { row: Row<AdventureMissionRead> }) => (
				<Button
					variant={completedMissionsID.includes(row.original.id) ? "outline" : "default"}
					size="sm"
					className="text-foreground"
					onClick={(e) => { e.stopPropagation(); handleClickAdvanced(row) }}
				>
					{completedMissionsID.includes(row.original.id) ? "Redigera" : "Lägg till"}
				</Button>
			),
		},
	];

	const table = useCreateTable({
		data: filteredAdventureMissions,
		columns,
	});

	return (
		<Suspense
			fallback={<div>{"Ingen faddergrupp (eller nollning) vald :(("}</div>}
		>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 font-bold text-primary">
						Avklarade uppdrag för "{group.data.name}"
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
					Här kan du redigera avklarade uppdrag och sätta poäng för dem. En grön färg indikerar att uppdraget är avklarat, gul att det inte har tittats på än och röd att det är underkänt (gör om gör rätt).
				</p>

				<div className="flex flex-row gap-3 items-center">
					<span>
						Filter:
					</span>
					<Input
						type="text"
						placeholder="Sök uppdrag..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-64"
					/>
					{weekLoaded && (
						<WeekFilter
							value={selectedWeek}
							onChange={setSelectedWeek}
						/>
					)}
				</div>

				<AdminTable
					table={table}
					onRowClick={(row) => handleRowClick(row)}
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
					defaultIsAccepted={
						completedAdventureMissions.data.find(
							(e) => e.adventure_mission.id === selectedMission?.id,
						)?.is_accepted as acceptEnum ?? acceptEnum.ACCEPTED
					}
					onClose={() => {
						setEditDialogOpen(false);
						setSelectedMission(null);
					}}
					selectedMission={selectedMission as AdventureMissionRead}
					onSubmit={(
						points: number,
						adventure_mission_id: number,
						is_accepted: acceptEnum
					) =>
						editCompletedMission.mutate(
							{
								path: { nollning_group_id: groupID },
								body: {
									adventure_mission_id: adventure_mission_id,
									points: points,
									is_accepted: is_accepted,
								},
							},
							mutationOptions,
						)
					}
				>
					<Button
						type="button"
						onClick={() => {
							if (selectedMission) {
								removeCompletedMission.mutate(
									{
										path: {
											nollning_group_id: groupID,
										},
										body: {
											adventure_mission_id: selectedMission.id,
										},
									},
									mutationOptions,
								)
							}
						}
						}
					>
						Gör Oavklarat
					</Button>
				</MissionPointRangeDialog>
				<MissionPointRangeDialog
					title={"Lägg till avklarat uppdrag"}
					open={addDialogOpen}
					defaultPoints={selectedMission?.max_points}
					maxPoints={selectedMission?.max_points}
					minPoints={selectedMission?.min_points}
					defaultIsAccepted={acceptEnum.ACCEPTED}
					onClose={() => {
						setAddDialogOpen(false);
						setSelectedMission(null);
					}}
					selectedMission={selectedMission as AdventureMissionRead}
					onSubmit={(
						points: number,
						adventure_mission_id: number,
						is_accepted: acceptEnum
					) =>
						addCompletedMission.mutate(
							{
								path: { nollning_group_id: groupID },
								body: {
									adventure_mission_id: adventure_mission_id,
									points: points,
									is_accepted: is_accepted,
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