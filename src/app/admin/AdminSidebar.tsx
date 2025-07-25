"use client";

import {
	Calendar,
	ChevronDown,
	Newspaper,
	FileText,
	Car,
	Briefcase,
	FolderLock,
	User,
	Gauge,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const groups = {
	Allmänt: [
		{
			title: "admin:news.self",
			url: "/admin/news",
			icon: Newspaper,
		},
		{
			title: "admin:events.self",
			url: "/admin/events",
			icon: Calendar,
		},
		{ title: "admin:documents.self", url: "/admin/documents", icon: FileText },
		{
			title: "admin:car.self",
			url: "/admin/car",
			icon: Car,
		},
		{
			title: "admin:councils.self",
			url: "/admin/councils",
			icon: Briefcase,
		},
		{ title: "admin:posts.self", url: "/admin/posts", icon: Briefcase },
		{
			title: "admin:permissions.self",
			url: "/admin/permissions",
			icon: FolderLock,
		},
		{
			title: "admin:member.self",
			url: "/admin/members",
			icon: User,
		},
		{
			title: "admin:nollning.self",
			url: "/admin/nollning",
			icon: Gauge,
		},
		{
			title: "admin:user-posts.self",
			url: "/admin/user-posts",
			icon: User,
		},
	],
};

export function AdminSidebar() {
	const { t } = useTranslation();

	return (
		<Sidebar>
			<SidebarHeader>{t("admin:title")}</SidebarHeader>
			<SidebarContent>
				{Object.entries(groups).map(([group, items]) => (
					<Collapsible defaultOpen className="group/collapsible" key={group}>
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger>
									{group}
									<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroup>
									<SidebarGroupContent>
										<SidebarMenu>
											{items.map((item) => (
												<SidebarMenuItem key={item.title}>
													<SidebarMenuButton asChild>
														<Link href={item.url}>
															{<item.icon />}
															<span>{t(item.title)}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				))}
			</SidebarContent>
			<div className="absolute bottom-0 left-0 w-full flex flex-row items-center justify-end gap-2 px-4 py-3 border-t border-sidebar-border bg-sidebar z-10">
				<LanguageSwitcher />
				<ThemeToggle />
			</div>
		</Sidebar>
	);
}
