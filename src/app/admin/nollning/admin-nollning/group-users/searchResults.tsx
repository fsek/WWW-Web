import type { GroupUserRead, UserRead } from "@/api";
import { searchUsersOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation("admin");
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
		<ScrollArea className="max-h-[200px] min-h-0 w-full overflow-scroll">
			<div className="flex flex-col gap-1 p-1 shrink">
				{users.data.length > 0 ? (
					users.data.map((user) => {
						return (
							<Button
								key={user.id}
								variant="ghost"
								className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-muted"
								onClick={() => onRowClick?.(user)}
							>
								<div className="flex flex-col items-start">
									<span className="font-medium">
										{user.first_name} {user.last_name}
									</span>
									<span className="text-sm text-muted-foreground">
										{user.program}
										{user.start_year % 100}
									</span>
								</div>
							</Button>
						);
					})
				) : (
					<Button
						variant="ghost"
						className="w-full justify-start text-muted-foreground"
						disabled
					>
						{t("nollning.group_members.no_users_found")}
					</Button>
				)}
			</div>
		</ScrollArea>
	);
};

export default SearchResults;
