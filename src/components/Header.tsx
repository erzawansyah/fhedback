"use client"
import { ComponentType, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { Blocks, House, Menu, X } from "lucide-react";
import { ConnectButton } from "./ConnectButton";


interface menuItemsType {
  label: string;
  path: string;
  icon: ComponentType;
}

export const menuItems: menuItemsType[] = [
  {
    label: "Home",
    path: "/",
    icon: House,
  },
  {
    label: "How to",
    path: "/how-to",
    icon: Blocks,
  },
];


export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b-4 border-border bg-secondary-background">
      <div className="container max-w-6xl flex justify-between items-center px-4 py-4 mx-auto h-20">
        {/* Menu kiri */}
        <div className="flex flex-1 flex-row gap-2 items-center h-full">
          <Link href={"/"}>
            <BrandLogo />
          </Link>
          {/* Desktop menu */}
          <ol className="hidden md:flex flex-row items-center ml-4 mb-0 mt-1 gap-8">
            {menuItems.map((item, i) => (
              <li
                key={i}
                className="font-bold uppercase flex gap-1 group"
              >
                <Link
                  href={item.path}
                  className="flex content-center gap-1"
                >
                  <span
                    className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-3d"
                  >
                    <item.icon />
                  </span>
                  <span
                    className="transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-3d"
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* Kanan */}
        <div className="flex gap-2 items-center h-full">
          <div className="hidden md:flex gap-2 items-center">
            <ConnectButton />
            <ThemeSwitcher />
          </div>
          {/* Hamburger menu button */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-border"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-secondary-background border-t-2 border-border px-4 py-4">
          <ol className="flex flex-col gap-4 mb-4">
            {menuItems.map((item, i) => (
              <li
                key={i}
                className="font-bold uppercase flex gap-2 items-center group"
              >
                <Link
                  href={item.path}
                  className="flex content-center gap-2 w-full"
                  onClick={() => setOpen(false)}
                >
                  <span
                    className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-3d"
                  >
                    <item.icon />
                  </span>
                  <span
                    className="transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-3d"
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2">
            <ConnectButton />
            <div className="flex justify-end">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
