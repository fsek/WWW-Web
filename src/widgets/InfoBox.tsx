import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface InfoBoxDisplay {
	label: string;
	value: string;
}

interface InfoBoxProps {
	open: boolean;
	onClose: () => void;
	displayData: InfoBoxDisplay[];
	lg_columns: number;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
	open,
	onClose,
	displayData,
	lg_columns,
}) => {
	const { t } = useTranslation("main");

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("info_box.title", "Info")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Card>
					<CardContent>
						<div className={`py-4 grid lg:grid-cols-${lg_columns} gap-4`}>
							{displayData.map((item) => (
								<div className="space-y-1" key={item.label}>
									<p className="font-semibold text-sm text-muted-foreground">
										{item.label}:
									</p>
									<p className="text-base">{item.value}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
};

export default InfoBox;
