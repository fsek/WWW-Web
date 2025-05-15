import type { NollningRead } from "@/api";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import EditNollning from "./editNollning";
import DeleteNollning from "./deleteNollning";

interface Props {
	nollning: NollningRead;
}

const NollningAccordionItem = ({ nollning }: Props) => {
	return (
		<AccordionItem
			className="border-b transition duration-200 hover:bg-gray-50"
			value={nollning.name}
		>
			<AccordionTrigger>{nollning.name}</AccordionTrigger>
			<AccordionContent>
				{nollning.description}
				<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
					<EditNollning nollning={nollning} />
					<DeleteNollning nollning={nollning} />
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

export default NollningAccordionItem;
