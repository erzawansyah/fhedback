import { ConnectButton } from "@/components/ConnectButton";
import { Link } from '@tanstack/react-router'
import { Compass, House, LayoutDashboard } from "lucide-react";

const menuItems = [
    { label: "Home", path: "/", icon: House },
    { label: "Explore", path: "/surveys/explore", icon: Compass },
    { label: "My Surveys", path: "/surveys/me", icon: LayoutDashboard },
]

const Header = () => {
    return (
        <header className="border-b-4 border-border bg-secondary-background sticky top-0 z-50">
            <div className="container flex justify-between items-center px-4 py-4 mx-auto h-20">
                {/* Left section */}
                <div className="flex flex-row gap-2 items-center h-full">
                    <Link to={"/"}>
                        <Logo />
                    </Link>
                </div>

                {/* Center section */}
                {/* Desktop menu */}
                <div className="flex-1">
                    <nav className="flex justify-center mx-auto mb-0 mt-1 gap-8">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className="font-bold uppercase flex gap-1 group"
                            >
                                <span className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
                                    <item.icon />
                                </span>
                                <span className="transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-105">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right section */}
                <div className="flex gap-2 items-center h-full">
                    <div className="hidden md:flex gap-2 items-center">
                        <ConnectButton />
                    </div>
                    {/* Hamburger menu button */}
                </div>
            </div>
        </header>
    )
}

const Logo = () => (
    <div
        className="w-full flex items-center"
        data-slot="brand-logo"
    >
        <img
            src="/fhedback-logo.png"
            alt="Fhedback Logo"
            width={48}
            height={48}
            className="shrink-0"
        />
        <div className="ml-2 min-w-0">
            <h2 className="text-2xl font-heading text-foreground uppercase">FHEdback</h2>
            <p className="text-sm font-mono text-foreground/70">Confidential Survey</p>
        </div>
    </div>
);


export default Header;
