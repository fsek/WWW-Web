import type { PostRead } from "@/api";
import { getAllCouncilsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import StyledMultiSelect, { type Option } from "@/components/StyledMultiSelect";

export interface AdminChooseMultPostsProps {
	value?: number[];
	onChange?: (value: number[]) => void;
	className?: string;
}

export function AdminChooseMultPosts({
	value = [],
	onChange,
	className = "",
}: AdminChooseMultPostsProps) {
	const { t, i18n } = useTranslation("admin");
	const {
		data: councils,
		error,
		isFetching,
	} = useQuery({
		...getAllCouncilsOptions(),
		refetchOnWindowFocus: false,
	});

	if (isFetching) {
		return (
			<StyledMultiSelect isDisabled={true} options={[]} className={className} />
		);
	}

	if (error) {
		return <p>{t("error")}</p>;
	}

	const lang = i18n.language.startsWith("sv") ? "sv" : "en";

	// Create both post options (for passing to select component) and ID map (for lookup) in a single pass
	const { postOptions, postIdMap } = councils?.reduce(
		(acc, council) => {
			if (council.posts?.length) {
				// Council has posts, add them to options and map
				for (const post of council.posts) {
					acc.postIdMap.set(post.id, post);
					acc.postOptions.push({
						value: post.id,
						label:
							lang === "sv"
								? post.name_sv || t("unnamed_post")
								: post.name_en || t("unnamed_post"),
					});
				}
			}
			return acc;
		},
		{
			postOptions: [] as Option[],
			postIdMap: new Map<number, PostRead>(),
		},
	) || { postOptions: [], postIdMap: new Map<number, PostRead>() };

	// Convert current values to options format using the efficient Map lookup
	const selectedOptions: Option[] = value.map((val) => {
		// Use Map for O(1) lookup instead of nested iteration
		const foundPost = postIdMap.get(val);

		return {
			value: val,
			label:
				lang === "sv"
					? foundPost?.name_sv || t("unnamed_post")
					: foundPost?.name_en || t("unnamed_post"),
		};
	});

	const handleChange = (selected: readonly Option[] | Option | null) => {
		if (!onChange) return;

		if (Array.isArray(selected)) {
			const newValues = selected.map((option) =>
				typeof option.value === "number" ? option.value : Number(option.value),
			);
			onChange(newValues);
		} else {
			// Handle single select case if ever needed, or clear
			onChange([]);
		}
	};

	return (
		<StyledMultiSelect
			isMulti={true}
			options={postOptions}
			value={selectedOptions}
			onChange={handleChange}
			placeholder={t("select_posts")}
			className={className}
		/>
	);
}

export default AdminChooseMultPosts;
