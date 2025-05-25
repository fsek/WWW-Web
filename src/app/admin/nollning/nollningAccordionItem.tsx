import type { NollningRead } from "@/api";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import EditNollning from "./editNollning";
import DeleteNollning from "./deleteNollning";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
	nollning: NollningRead;
}

const NollningAccordionItem = ({ nollning }: Props) => {
	const router = useRouter();
	function administreraNollning() {
		router.push(`/admin/nollning/admin-nollning?id=${nollning.id}`);
	}

	return (
		<AccordionItem
			className="border-b transition duration-200 hover:bg-gray-50"
			value={nollning.name}
		>
			<AccordionTrigger>{nollning.name}</AccordionTrigger>
			<AccordionContent>
				{nollning.description}
				<div className="space-x-3 lg:col-span-3 lg:grid-cols-subgrid">
					<EditNollning nollning={nollning} />
					<DeleteNollning nollning={nollning} />
					<Button onClick={administreraNollning}>Administrera</Button>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

export default NollningAccordionItem;
