"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminLanding() {
	const { t } = useTranslation("admin");
	const [textHidden, setTextHidden] = useState(true);
	return (
		<div className="flex flex-col items-center h-screen w-[80%] mx-auto">
			<h1 className="text-5xl font-extrabold text-primary mb-4 tracking-tight">
				{t("welcome.title")}
			</h1>
			<p className="text-lg text-muted-foreground mb-2">
				{t("welcome.message")}
			</p>
			<Button
				type="button"
				variant="link"
				className="text-xs text-transparent mt-[20vh] items-center"
				onClick={() => setTextHidden(!textHidden)}
			>
				<span className="text-transparent decoration-transparent">klicka</span>
			</Button>
			{!textHidden && (
				<a
					href="https://www.youtube.com/watch?v=xMHJGd3wwZk"
					target="_blank"
					rel="noopener noreferrer"
				>
					Hej :)
				</a>
			)}
		</div>
	);
}
