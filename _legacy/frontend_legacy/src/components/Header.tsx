"use client";

import { useState } from "react";
import Link from "next/link";
import { Blocks, House, Menu, X } from "lucide-react";

import ThemeSwitcher from "./ThemeSwitcher";
import { BrandLogo } from "./BrandLogo";
import { ConnectButton } from "./ConnectButton";
import { ROUTES } from "@/lib/constants";
import { NavigationItem } from "@/lib/types";

export const menuItems: NavigationItem[] = [
  {
    label: "Home",
    path: ROUTES.HOME,
    icon: House,
  },
  {
    label: "How to",
    path: ROUTES.HOW_TO,
    icon: Blocks,
  },
];


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="border-b-4 border-border bg-secondary-background">
      <div className="container max-w-6xl flex justify-between items-center px-4 py-4 mx-auto h-20">
        {/* Left section */}
        <div className="flex flex-1 flex-row gap-2 items-center h-full">
          <Link href={"/"} onClick={closeMenu}>
            <BrandLogo />
          </Link>
          {/* Desktop menu */}
          <nav className="hidden md:flex flex-row items-center ml-4 mb-0 mt-1 gap-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
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
            <ThemeSwitcher />
          </div>
          {/* Hamburger menu button */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-border hover:bg-hover transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-secondary-background border-t-2 border-border px-4 py-4">
          <ul className="flex flex-col gap-4 mb-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.path}
                  className="font-bold uppercase flex gap-2 items-center group w-full py-2 hover:bg-hover rounded-md px-2 transition-colors"
                  onClick={closeMenu}
                >
                  <span className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
                    <item.icon />
                  </span>
                  <span className="transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-105">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <ConnectButton />
            <div className="flex justify-end">
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
