"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import idAsNumber from "../idAsNumber";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getNollningByYearOptions, getNollningOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper } from "@tanstack/react-table";
import type { AdventureMissionRead } from "@/api";
import useCreateTable from "@/widgets/useCreateTable";
import AdminTable from "@/widgets/AdminTable";
import CreateAdventureMission from "./createAdventureMission";
import EditAdventureMission from "./editAdventureMission";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import WeekFilter from "@/components/WeekFilter";

export default function AdventureMissionsPage() {
	const { t, i18n } = useTranslation("admin");
	const searchParams = useSearchParams();
	const search = searchParams.get("id");
	let nollningID = idAsNumber(search);
	const [selectedMission, setSelectedMission] =
		useState<AdventureMissionRead | null>(null);
	const [open, setOpen] = useState<boolean>(false);
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

	const { data } =
		search === null || search === "current"
			? useSuspenseQuery(getNollningByYearOptions({
				path: { year: new Date().getFullYear() },
			}))
			: useSuspenseQuery(getNollningOptions({
				path: { nollning_id: nollningID },
			}));

	// After getting the data, switch the parameter to nollningID, to make it easier to pass down
	if (search === null || search === "current") {
		nollningID = data.id;
	}

	// Filter missions based on selected week
	const filteredAdventureMissions = useMemo(() => {
		let missions = data.missions ?? [];
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
	}, [data.missions, selectedWeek, searchTerm]);

	const columnHelper = createColumnHelper<AdventureMissionRead>();
	const columns = [
		columnHelper.accessor(i18n.language === "en" ? "title_en" : "title_sv", {
			header: t("nollning.missions.title_header"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor(i18n.language === "en" ? "description_en" : "description_sv", {
			header: t("nollning.missions.description_header"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "points",
			header: t("nollning.missions.points_header"),
			cell: (info) => {
				const row = info.row.original;
				return row.min_points === row.max_points
					? `${row.max_points}`
					: `${row.min_points}–${row.max_points}`;
			},
		}),
		columnHelper.accessor("nollning_week", {
			header: t("nollning.missions.week_header"),
			cell: (info) => info.getValue(),
		}),
	];

	const table = useCreateTable({ data: filteredAdventureMissions, columns });

	function onClose() {
		setOpen(false);
		setSelectedMission(null);
	}

	const router = useRouter();

	return (
		<Suspense fallback={<div>{t("nollning.group_admin.no_nollning_selected")}</div>}>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("nollning.missions.admin_title", { name: data.name })}
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() =>
							router.push(`/admin/nollning/admin-nollning?id=${nollningID}`)
						}
					>
						<ArrowLeft className="w-4 h-4" />
						{t("nollning.missions.back")}
					</Button>
				</div>
				<div className="flex flex-row w-full justify-between items-end">
					<p className="">
						{t("nollning.missions.intro")}
					</p>
				</div>
				<CreateAdventureMission nollningID={nollningID} />
				<div className="flex flex-row gap-3 items-center">
					<span>
						{t("nollning.missions.filter_label")}
					</span>
					<Input
						type="text"
						placeholder={t("nollning.missions.search_placeholder")}
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
					onRowClick={(row) => {
						setSelectedMission(row.original);
						setOpen(true);
					}}
				/>
				{selectedMission && (
					<EditAdventureMission
						open={open}
						onClose={onClose}
						selectedMission={selectedMission}
						nollning_id={nollningID}
					/>
				)}
			</div>
		</Suspense>
	);
};