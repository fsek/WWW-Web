import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";

export default function EncodedGridHelpDialog() {
	const { t } = useTranslation("admin");
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="outline"
				onClick={(e) => {
					e.preventDefault();
					setOpen(true);
				}}
			>
				<HelpCircle />
				{t("enclose_moose.edit_help.button")}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-semibold">
							{t("enclose_moose.edit_help.title")}
						</DialogTitle>
					</DialogHeader>
					<Trans
						components={{
							editor: (
								<Link
									className="underline text-primary hover:text-foreground transition-colors"
									href="https://enclose.horse/edit"
									target="_blank"
								/>
							),
							command: (
								<div className="bg-muted border border-input rounded-md px-3 py-2 font-mono text-sm cursor-edit hover:bg-muted/80 transition-colors" />
							),
						}}
					>
						<ol className="list-decimal ml-5 space-y-2">
							{(
								t("enclose_moose.edit_help.steps", {
									returnObjects: true,
								}) as string[]
							).map((text) => (
								<li key={text}>{text}</li>
							))}
						</ol>
					</Trans>
				</DialogContent>
			</Dialog>
		</>
	);
}
