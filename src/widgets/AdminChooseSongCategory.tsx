import { getAllSongCategoriesOptions } from "@/api/@tanstack/react-query.gen";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const categories = [
	{ id: 0, name: "POP" },
	{ id: 1, name: "Rock" },
	{ id: 2, name: "Visor" },
];

interface AdminChooseCouncilProps {
	value: number;
	onChange: (value: number) => void;
}

export function AdminChooseSongCategory({
	value,
	onChange,
}: AdminChooseCouncilProps) {
	const { data, error, isPending } = useQuery({
		...getAllSongCategoriesOptions(),
	});

	if (isPending) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	return (
		<Select
			value={value.toString()}
			onValueChange={(val) => onChange(Number(val))}
		>
			<SelectTrigger className="w-[280px]">
				<SelectValue placeholder="Select a Category" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Available Categories</SelectLabel>
					{data.map((item) => (
						<SelectItem key={item.id} value={item.id.toString()}>
							{item.name || "Category Unknown"}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
