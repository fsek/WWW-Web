"use client";

import { Calendar, ChevronDown, Newspaper, FileText } from "lucide-react";

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
import { usePermissions } from "@/lib/auth";
import type { PermissionRead } from "@/api";
import { useMemo } from "react";

interface SidebarItem {
	title: string;
	url: string;
	icon: React.ComponentType;
	permissions: [
		{ target: PermissionRead["target"]; action: PermissionRead["action"] },
	];
}

const groups: { title: string; content: SidebarItem[] }[] = [
	{
		title: "admin:general",
		content: [
			{
				title: "admin:news.self",
				url: "/admin/news",
				icon: Newspaper,
				permissions: [{ target: "News", action: "manage" }],
			},
			{
				title: "admin:events.self",
				url: "/admin/events",
				icon: Calendar,
				permissions: [{ target: "Event", action: "manage" }],
			},
			{
				title: "admin:documents.self",
				url: "/admin/documents",
				icon: FileText,
				permissions: [{ target: "Document", action: "manage" }],
			},
		],
	},
];

export function AdminSidebar() {
	const { t } = useTranslation();
	const permissions = usePermissions();
	const filteredGroups = useMemo(() => {
		return groups.reduce(
			(acc, group) => {
				const filteredItems = group.content.filter((item) =>
					item.permissions.every(
						(permission) =>
							permissions.get(permission.target) === permission.action,
					),
				);
				if (filteredItems.length > 0) {
					acc[group.title] = filteredItems;
				}
				return acc;
			},
			{} as Record<string, SidebarItem[]>,
		);
	}, [permissions]);
	return (
		<Sidebar>
			<SidebarHeader>{t("admin:title")}</SidebarHeader>
			<SidebarContent>
				{Object.entries(filteredGroups).map(([group, items]) => (
					<Collapsible defaultOpen className="group/collapsible" key={group}>
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger>
									{t(group)}
									<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroup>
									<SidebarGroupContent>
										<SidebarMenu>
											{items.map((item) => {
												if (
													item.permissions.every(
														(permission) =>
															permissions.get(permission.target) ===
															permission.action,
													)
												) {
													return (
														<SidebarMenuItem key={item.title}>
															<SidebarMenuButton asChild>
																<Link href={item.url}>
																	{<item.icon />}
																	<span>{t(item.title)}</span>
																</Link>
															</SidebarMenuButton>
														</SidebarMenuItem>
													);
												}
											})}
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
