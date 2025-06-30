import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import React from "react";

interface Props {
	value: string;
	onChange: (value: string) => void;
}

const GroupTypeSelect = ({ value, onChange }: Props) => {
	const groupTypes: { [key: string]: string } = {
		Fadder: "Mentor",
		Uppdrag: "Mission",
	};

	return (
		<Select value={value.toString()} onValueChange={(val) => onChange(val)}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Select a Council" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{["Fadder", "Uppdrag"]?.map((item) => (
						<SelectItem key={item} value={groupTypes[item]}>
							{item || "Unnamed Council"}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default GroupTypeSelect;
