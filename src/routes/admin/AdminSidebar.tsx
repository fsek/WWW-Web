import {
	Calendar,
	ChevronDown,
	Home,
	Inbox,
	Newspaper,
	Rss,
	Search,
	Settings,
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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const groups = {
	Allmänt: [
		{
			title: "admin:news.self",
			url: "news",
			icon: Newspaper,
		},
		{
			title: "admin:events.self",
			url: "events",
			icon: Calendar,
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
					<Collapsible defaultOpen className="group/collapsible">
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
														<Link to={item.url}>
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
