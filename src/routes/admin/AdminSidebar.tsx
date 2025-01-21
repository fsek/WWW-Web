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
} from "@radix-ui/react-collapsible";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const nollning = [
	{
		title: "Pirat",
		year: 2018,
	},
	{
		title: "Häst",
		year: 2015,
	},
];

const allmänt = [
	{
		title: "admin:news.self",
		url: "news",
	},
	{
		title: "admin:events.self",
		url: "events",
	},
];

export function AdminSidebar() {
	const { t } = useTranslation();
	return (
		<Sidebar>
			<SidebarHeader>{t("admin:title")}</SidebarHeader>
			<SidebarContent>
				<Collapsible>
					<SidebarGroup>
						<SidebarGroupLabel>
							<CollapsibleTrigger>Nollning</CollapsibleTrigger>
						</SidebarGroupLabel>
						<CollapsibleContent>
							<SidebarGroupContent>
								<SidebarMenu>
									{nollning.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<span>{item.title}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
				<Collapsible>
					<SidebarGroup>
						<SidebarGroupLabel>
							<CollapsibleTrigger>Allmänt</CollapsibleTrigger>
						</SidebarGroupLabel>
						<CollapsibleContent>
							<SidebarGroupContent>
								<SidebarMenu>
									{allmänt.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link to={item.url}>
<<<<<<< HEAD
													<span>{t(item.title)}</span>
=======
													<span>{item.title}</span>
>>>>>>> main
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
			</SidebarContent>
		</Sidebar>
	);
}
