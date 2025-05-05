import { getAllCouncilsOptions } from "@/api/@tanstack/react-query.gen";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// const counilcs = [
// 	{ id: 0, name: "Piratutskottet" },
// 	{ id: 1, name: "Pippi Långstrumputskottet" },
// ];

interface AdminChooseCouncilProps {
	value: number;
	onChange: (value: number) => void;
}

export function AdminChooseCouncil({
	value,
	onChange,
}: AdminChooseCouncilProps) {
	const queryClient = useQueryClient();

	const {
		data: councils,
		error,
		isPending,
	} = useQuery({
		...getAllCouncilsOptions(),
	});

	if (error) {
		return <p>Hämtar...</p>;
	}

	return (
		<Select
			value={value.toString()}
			onValueChange={(val) => onChange(Number(val))}
		>
			<SelectTrigger className="w-[280px]">
				<SelectValue placeholder="Select a Council" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Available Councils</SelectLabel>
					{councils?.map((item) => (
						<SelectItem key={item.id} value={item.id.toString()}>
							{item.name || "Unnamed Council"}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
