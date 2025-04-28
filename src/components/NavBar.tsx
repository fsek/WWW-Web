"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import FLogga from "@/assets/f-logga";
import { LogIn, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LoginWall from "./LoginWall";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

type NavItem = {
	self: string;
	desc: string;
	href?: string;
};

type NavSection = {
	self: string;
} & Record<string, NavItem>;

export function NavBar() {
	return (
		<div className="flex justify-between">
			<FLogga className="mt-2 ml-2" />
			<NavBarMenu />
			<LoginAndLang />
		</div>
	);
}

function LoginAndLang() {
	const { t } = useTranslation();
	const [showLoginWall, setShowLoginWall] = useState(false);

	function handleLoginClick() {
		setShowLoginWall(true);
	}

	return (
		<>
			<ThemeToggle />
			<LanguageSwitcher />
			<Button className="mt-6 mr-2" onClick={handleLoginClick}>
				<LogInIcon />
				<span> {t("login.login")}</span>
			</Button>
			{showLoginWall && <LoginWall />}
		</>
	);
}

export function NavBarMenu() {
	const { t } = useTranslation();
	const navbarData = t("navbar", { returnObjects: true }) as Record<
		string,
		NavSection
	>;

	const sections = Object.entries(navbarData).filter(
		([, value]) =>
			typeof value === "object" && value !== null && !Array.isArray(value),
	);

	function onNavChange() {
		setTimeout(() => {
			const triggers = document.querySelectorAll(
				'[data-slot="navigation-menu-trigger"][data-state="open"]',
			);
			const dropdowns = document.querySelectorAll(
				'[data-slot="navigation-menu-viewport"][data-state="open"]',
			);

			if (!triggers.length || !dropdowns.length) return;

			const padding = 16;
			const { x, width } = (triggers[0] as HTMLElement).getBoundingClientRect();
			const dropdown = dropdowns[0] as HTMLElement;
			const menuWidth = dropdown.children[0].clientWidth;
			const parentLeft =
				dropdown.offsetParent?.getBoundingClientRect().left || 0;

			let viewportLeft = x + width / 2 - menuWidth / 2;
			if (viewportLeft < padding) {
				viewportLeft = padding;
			} else if (viewportLeft + menuWidth > window.innerWidth - padding) {
				viewportLeft = window.innerWidth - menuWidth - padding;
			}

			document.documentElement.style.setProperty(
				"--menu-left-position",
				`${viewportLeft - parentLeft}px`,
			);
		});
	}

	return (
		<div>
			<NavigationMenu
				onValueChange={onNavChange}
				className="w-full max-w-full py-2 mt-4"
			>
				{sections.map(([sectionKey, section]) => {
					const items = Object.entries(section).filter(
						([key]) => key !== "self",
					) as [string, NavItem][];
					return (
						<NavigationMenuList key={sectionKey}>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="submenu-trigger">
									{section.self}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										{items.map(([itemKey, item]) => (
											<ListItem
												key={itemKey}
												title={item.self}
												href={item.href || "#"}
											>
												{item.desc}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					);
				})}
				<NavigationMenuList>
					<NavigationMenuItem>
						<Link href="/docs" legacyBehavior passHref>
							<NavigationMenuLink className={navigationMenuTriggerStyle()}>
								Documentation
							</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
