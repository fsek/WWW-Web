import type { GroupAddUser, GroupUserRead, UserRead } from "@/api";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import type React from "react";
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

const SearchBar = ({ excludedFromSearch = [], onRowClick }: Props) => {
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
				<SelectTrigger className="w-full bg-white">
					<SelectValue placeholder="Filtrera efter program" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Mentee">Lägg till som nolla</SelectItem>
					<SelectItem value="Mentor">Lägg till som fadder</SelectItem>
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
				<SelectTrigger className="w-full bg-white">
					<SelectValue placeholder="Filtrera efter program" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="clear">Rensa</SelectItem>
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
			<div className="w-full max-w-xs">
				<Popover>
					<PopoverTrigger asChild>
						<div>
							<Input
								className="bg-white"
								placeholder="Sök användare"
								value={nameFilter}
								onChange={(e) => {
									setNameFilter(e.target.value);
									if (!resultsOpen && e.target.value.length > 0) {
										setResultsOpen(true);
									}
								}}
								onFocus={() => {
									if (nameFilter.length > 0) {
										console.log("length of name: ", nameFilter.length);
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
						className="w-[230px] p-1"
					>
						<ScrollArea>
							<Suspense
								fallback={
									<div>
										<Button variant="ghost" className="w-full justify-start">
											Söker...{" "}
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
						</ScrollArea>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

export default SearchBar;
