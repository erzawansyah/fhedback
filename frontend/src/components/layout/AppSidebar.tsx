import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
    Home,
    Search,
    ClipboardList,
    Plus,
    BarChart2,
    Ticket,
    History,
    BookOpen,
    Megaphone,
} from "lucide-react";
import { Link } from "@tanstack/react-router"
import AppSettings from "@/components/AppSettings";
import { BrandLogo } from "@/components/BrandLogo";

const sidebarMenuItems = [
    {
        section: null,
        items: [
            { label: "Dashboard", icon: Home, href: "/app/" },
            { label: "Browse Surveys", icon: Search, href: "/app/surveys" },

        ],
    },
    {
        section: "Creator Menu",
        items: [
            { label: "My Surveys", icon: ClipboardList, href: "/app/creator" },
            { label: "Create Survey", icon: Plus, href: "/app/creator/new" },
            { label: "Results & Analytics", icon: BarChart2, href: "/app/creator/analytics" },
        ],
    },
    {
        section: "Respondent Menu",
        items: [
            { label: "Survey History", icon: History, href: "/app/respondent" },
            { label: "My Rewards", icon: Ticket, href: "/app/respondent/rewards" },
        ],
    },
    {
        section: null,
        items: [
            { label: "Documentation", icon: BookOpen, href: "/docs" },
            { label: "About FHEdback", icon: Megaphone, href: "/about" },
        ],
    },
];




const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <BrandLogo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarMenuItems.map((section, idx) => (
                        <SidebarGroup key={idx}>
                            {section.section && (
                                <SidebarGroupLabel asChild>
                                    <h5 className="capitalize mb-1.5">
                                        {section.section}
                                    </h5>
                                </SidebarGroupLabel>
                            )}
                            {section.items.map((item, itemIdx) => (
                                <SidebarMenuItem
                                    key={itemIdx}
                                >
                                    <SidebarMenuButton tooltip={item.label} asChild>
                                        <Link to={item.href}>
                                            {item.icon && <item.icon />}
                                            {item.label}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <AppSettings />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar;
