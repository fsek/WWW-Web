"use client";

import { searchUsersOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";

interface AdminChooseUserProps {
	isMulti?: boolean;
	value?: Option | Option[] | null;
	onChange?: (selected: readonly Option[] | Option | null) => void;
	placeholder?: string;
	className?: string;
	isDisabled?: boolean;
	additionalFilters?: {
		exclude_ids?: Array<number>;
		program?: string;
		start_year?: number;
	};
}

export default function AdminChooseUser({
	isMulti = false,
	value,
	onChange,
	placeholder,
	className = "",
	isDisabled = false,
	additionalFilters = undefined,
}: AdminChooseUserProps) {
	const [queryString, setQueryString] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const queryClient = useQueryClient();
	const { t } = useTranslation("admin");

	const {
		data: users,
		refetch,
		isPending,
	} = useQuery({
		...searchUsersOptions({
			query: { name: queryString, limit: 5, ...additionalFilters },
		}),
		enabled: false,
		refetchOnWindowFocus: false,
	});

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const debounce = <T extends (...args: any[]) => void>(
		func: T,
		timeout = 10000,
	) => {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timer);
			setIsTyping(true);
			timer = setTimeout(() => {
				setIsTyping(false);
				func(...args);
			}, timeout);
		};
	};

	const processChange = debounce(() => {
		// setQueryString(searchStr);
		refetch();
	}, 1000);

	return (
		<StyledMultiSelect
			isMulti={isMulti}
			options={
				users?.map((u) => ({
					value: u.id,
					label: `${u.first_name} ${u.last_name}`,
				})) ?? []
			}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className={className}
			isDisabled={isDisabled}
			noOptionsMessage={({ inputValue }) =>
				inputValue.length < 3
					? ""
					: isPending || isTyping
						? t("searching")
						: t("user_not_found")
			}
			onInputChange={(input) => {
				setQueryString(input);
				if (input.length > 2) {
					processChange();
				}
			}}
		/>
	);
}
