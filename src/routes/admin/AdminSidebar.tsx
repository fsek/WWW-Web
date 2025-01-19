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
		title: "Nyheter",
		url: "news",
	},
	{
		title: "Evenemang",
		url: "events",
	},
	{
		title: "Bilbokning",
		url: "car",
	},
];

export function AdminSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>Adminpage</SidebarHeader>
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
													<span>{item.title}</span>
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
