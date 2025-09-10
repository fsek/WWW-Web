import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getAllPostsOptions } from "@/api/@tanstack/react-query.gen";

export interface Option {
	value: string;
	label: string;
}

interface SelectOnePostProps {
	value: number | null;
	onChange: (value: number | null) => void;
	filterList: number[];
}

export default function SelectOnePost({
	value,
	onChange,
	filterList,
}: SelectOnePostProps) {
	const { t, i18n } = useTranslation("admin");
	const {
		data: posts,
		error,
		isFetching,
	} = useQuery({
		...getAllPostsOptions(),
		refetchOnWindowFocus: false,
	});

	const filteredPosts =
		filterList.length === 0
			? (posts ?? [])
			: (posts?.filter((item) => filterList.includes(item.id)) ?? []);

	const selectedOption: Option | null =
		value !== null && typeof value === "number"
			? {
					value: value.toString(),
					label:
						filteredPosts.find((p) => p.id === value)?.name_en || String(value),
				}
			: null;

	if (error || isFetching) {
		return (
			<SelectFromOptions isDisabled={true} options={[]} onChange={() => {}} />
		);
	}

	return (
		<SelectFromOptions
			options={filteredPosts.map((post) => ({
				value: post.id.toString(),
				label: post.name_en || t("admin:unnamed_post"),
			}))}
			value={selectedOption?.value}
			onChange={(val: string) => {
				const numValue = Number(val);
				onChange(Number.isNaN(numValue) ? null : numValue);
			}}
			placeholder={t("admin:select_post_placeholder")}
		/>
	);
}
