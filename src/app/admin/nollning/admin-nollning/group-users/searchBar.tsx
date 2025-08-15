import type { GroupAddUser, GroupUserRead, UserRead } from "@/api";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Suspense, useRef, useState } from "react";
import StartYearFilter from "./YearFilter";
import SearchResults from "./searchResults";
import {} from "@radix-ui/react-popover";
import {
	PopoverTrigger,
	Popover,
	PopoverContent,
} from "@/components/ui/popover-no-portal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
	excludedFromSearch?: GroupUserRead[];
	onRowClick?: (
		user: UserRead,
		groupUserType: GroupAddUser["group_user_type"],
	) => void;
}

const groupUserTypes = ["Default", "Mentee", "Mentor"] as const;
type GroupUserTypes = (typeof groupUserTypes)[number];

function toGroupUserType(s: string): GroupUserTypes {
	if (groupUserTypes.includes(s as GroupUserTypes)) {
		return s as GroupUserTypes;
	}
	return "Default" as GroupUserTypes;
}

export default function SearchBar({
	excludedFromSearch = [],
	onRowClick,
}: Props) {
	const { t } = useTranslation("admin");
	const [nameFilter, setNameFilter] = useState("");
	const [programFilter, setProgramFilter] = useState("");
	const [startingYearRangeFilter, setStartingYearRangeFilter] = useState<
		number | null
	>(null);
	const [resultsOpen, setResultsOpen] = useState(false);
	const [groupUserType, setGroupUserType] = useState<GroupUserTypes>("Mentee");
	const popoverRef = useRef<HTMLDivElement>(null);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		// Check if focus is moving to an element inside the popover
		if (
			popoverRef.current &&
			!popoverRef.current.contains(event.relatedTarget)
		) {
			setTimeout(() => setResultsOpen(false), 10000);
		}
	};

	return (
		<div className="flex flex-col space-y-3">
			<Select
				onValueChange={(value) => setGroupUserType(toGroupUserType(value))}
				value={groupUserType}
			>
				<SelectTrigger className="w-full bg-white max-w-sm">
					<SelectValue
						placeholder={t("nollning.group_members.select_role_placeholder")}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Mentee">
						{t("nollning.group_members.add_as_mentee")}
					</SelectItem>
					<SelectItem value="Mentor">
						{t("nollning.group_members.add_as_mentor")}
					</SelectItem>
				</SelectContent>
			</Select>
			<Select
				value={programFilter}
				onValueChange={(value) => {
					if (value === "clear") {
						setProgramFilter("");
					} else {
						setProgramFilter(value);
					}
				}}
			>
				<SelectTrigger className="w-full bg-white max-w-sm">
					<SelectValue
						placeholder={t("nollning.group_members.filter_by_program")}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="clear">
						{t("nollning.group_members.clear")}
					</SelectItem>
					<SelectItem value="F">F</SelectItem>
					<SelectItem value="Pi">Pi</SelectItem>
					<SelectItem value="N">N</SelectItem>
				</SelectContent>
			</Select>
			<StartYearFilter
				value={startingYearRangeFilter}
				onChange={(value) => {
					setStartingYearRangeFilter(value);
				}}
			/>
			<div className="w-full max-w-sm">
				<Popover>
					<PopoverTrigger asChild>
						<div>
							<Input
								className="bg-white"
								placeholder={t(
									"nollning.group_members.search_user_placeholder",
								)}
								value={nameFilter}
								onChange={(e) => {
									setNameFilter(e.target.value);
									if (!resultsOpen && e.target.value.length > 0) {
										setResultsOpen(true);
									}
								}}
								onFocus={() => {
									if (nameFilter.length > 0) {
										setResultsOpen(true);
									}
								}}
								onBlur={handleBlur}
							/>
						</div>
					</PopoverTrigger>

					<PopoverContent
						ref={popoverRef}
						onOpenAutoFocus={(e) => e.preventDefault()}
						className="p-0"
						side={
							// This is a workaround for radix-ui not allowing fallback side selection
							// see: https://github.com/radix-ui/primitives/issues/3101
							typeof window !== "undefined" && window.innerHeight > 700
								? "top"
								: "right"
						}
					>
						<Suspense
							fallback={
								<div className="p-4">
									<Button
										variant="ghost"
										className="w-full justify-start"
										disabled
									>
										{t("nollning.group_members.searching")}
									</Button>
								</div>
							}
						>
							<SearchResults
								nameFilter={nameFilter}
								programFilter={programFilter}
								startYearFilter={startingYearRangeFilter}
								excludedFromSearch={excludedFromSearch}
								onRowClick={(user: UserRead) => {
									onRowClick?.(user, groupUserType);
								}}
							/>
						</Suspense>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
