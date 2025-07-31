"use client";

import { searchUsersOptions } from "@/api/@tanstack/react-query.gen";
import Select, { type OnChangeValue } from "react-select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type Option = {
	value: string | number;
	label: string;
};

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

	const handleChange = (selected: OnChangeValue<Option, boolean>) => {
		if (!onChange) return;
		onChange(selected);
	};

	return (
		<Select
			isMulti={isMulti}
			options={
				users?.map((u) => ({
					value: u.id,
					label: `${u.first_name} ${u.last_name}`,
				})) ?? []
			}
			value={value}
			onChange={handleChange}
			placeholder={placeholder}
			noOptionsMessage={({ inputValue }) =>
				isPending || isTyping ? t("searching") : t("user_not_found")
			}
			className={className}
			isDisabled={isDisabled}
			onInputChange={(input) => {
				setQueryString(input);
				processChange();
			}}
		/>
	);
}
