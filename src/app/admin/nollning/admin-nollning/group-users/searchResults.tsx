import type { GroupUserRead, UserRead } from "@/api";
import { searchUsersOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
	nameFilter: string;
	programFilter: string;
	startYearFilter: number | null;
	excludedFromSearch: GroupUserRead[];
	onRowClick?: (user: UserRead) => void;
}

const SearchResults = ({
	nameFilter,
	programFilter,
	startYearFilter,
	excludedFromSearch,
	onRowClick,
}: Props) => {
	const users = useSuspenseQuery({
		...searchUsersOptions({
			query: {
				name: nameFilter.length > 0 ? nameFilter : null,
				program: programFilter.length > 0 ? programFilter : null,
				start_year: startYearFilter,
				exclude_ids:
					excludedFromSearch.length > 0
						? excludedFromSearch.map((group_user) => group_user.user.id)
						: null,
			},
		}),
	});
	return (
		<div className="flex flex-col gap-1">
			{users.data.length > 0 ? (
				users.data.map((user) => {
					return (
						<Button
							key={user.id}
							variant="ghost"
							className="w-full justify-start"
							onClick={() => onRowClick?.(user)}
						>
							{user.first_name} {user.last_name} {user.program}
							{user.start_year % 100}
						</Button>
					);
				})
			) : (
				<Button variant="ghost" className="w-full justify-start">
					Inga användare hittade
				</Button>
			)}
		</div>
	);
};

export default SearchResults;
