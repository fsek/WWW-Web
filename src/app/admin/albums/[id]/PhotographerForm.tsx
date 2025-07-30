import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PhotographerForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");
	return (
		<div className="p-3">
			<Button>
				<UserPlus /> {t("album.add_photographer")}
			</Button>
		</div>
	);
}
