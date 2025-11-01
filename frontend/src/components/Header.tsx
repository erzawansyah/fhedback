import { ConnectButton } from "@/components/ConnectButton";
import { Link } from '@tanstack/react-router'
import { Compass, House, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const menuItems = [
    { label: "Home", path: "/", icon: House },
    { label: "Explore", path: "/surveys/explore", icon: Compass },
    { label: "My Surveys", path: "/surveys/me", icon: LayoutDashboard },
]

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b-4 border-border bg-secondary-background sticky top-0 z-50">
            <div className="container flex justify-between items-center px-4 py-4 mx-auto h-20">
                {/* Left section */}
                <div className="flex flex-row gap-2 items-center h-full">
                    <Link to={"/"} onClick={() => setMobileMenuOpen(false)}>
                        <Logo />
                    </Link>
                </div>

                {/* Center section */}
                {/* Desktop menu */}
                <div className="hidden md:flex flex-1">
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
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t-4 border-border bg-secondary-background">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className="font-bold uppercase flex gap-2 items-center py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        <div className="pt-2 border-t-2 border-border">
                            <ConnectButton />
                        </div>
                    </nav>
                </div>
            )}
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
            className="shrink-0 w-10 h-10 md:w-12 md:h-12"
        />
        <div className="ml-2 min-w-0">
            <h2 className="text-xl md:text-2xl font-heading text-foreground uppercase">FHEdback</h2>
            <p className="text-xs md:text-sm font-mono text-foreground/70">Confidential Survey</p>
        </div>
    </div>
);


export default Header;
