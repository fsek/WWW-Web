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
			className="w-full border-b transition duration-200 hover:bg-gray-50"
			value={nollning.id.toString()}
		>
			<AccordionTrigger className="flex w-full px-4">
				<p className="text-base">{nollning.year} - {nollning.name}</p>
			</AccordionTrigger>
			<AccordionContent className="w-full px-4 space-y-4">
				<div>
					<p className="w-full whitespace-pre-wrap">{nollning.description}</p>
				</div>
				<div className="space-x-3 lg:col-span-3 flex">
					<EditNollning nollning={nollning} />
					<DeleteNollning nollning={nollning} />
					<Button onClick={administreraNollning}>Administrera</Button>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

export default NollningAccordionItem;
