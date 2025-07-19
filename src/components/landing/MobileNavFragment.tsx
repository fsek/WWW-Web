"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, UserIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type NavItem = {
	label: string;
	href: string;
	className?: string;
};

export const MobileNavFragment = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { t } = useTranslation("landingpage");
	const navbarData = t("navbar.items", { returnObjects: true }) as Record<
		string,
		NavItem
	>;

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger className="px-2">
				<Menu
					className="flex md:hidden h-10 w-10"
					onClick={() => setIsOpen(true)}
				>
					{/* <span className="sr-only">Menu Icon</span> */}
				</Menu>
			</SheetTrigger>

			<SheetContent side={"right"} className="w-80">
				<SheetHeader className="pb-6">
					<SheetTitle className="font-bold text-2xl text-left">
						{t("f-guild")}
					</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-3">
					{Object.entries(navbarData).map(([key, item]) => (
						<Link
							key={key}
							href={item.href}
							onClick={() => setIsOpen(false)}
							className={`text-lg justify-start ${buttonVariants({ variant: "ghost" })}`}
						>
							<span className={`${item.className || ""}`}>{item.label}</span>
						</Link>
					))}
					<div className="pt-4">
						<Link
							href="/login?next=/home"
							onClick={() => setIsOpen(false)}
							className={`w-full justify-start text-lg ${buttonVariants({ variant: "default" })}`}
						>
							<UserIcon className="w-5 h-5 mr-2" />
							{t("navbar.login")}
						</Link>
					</div>
				</nav>
			</SheetContent>
		</Sheet>
	);
};
