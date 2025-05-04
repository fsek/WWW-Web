"use client";

import { Calendar, ChevronDown, Newspaper, FileText, Car } from "lucide-react";

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
		</Sidebar>
	);
}
