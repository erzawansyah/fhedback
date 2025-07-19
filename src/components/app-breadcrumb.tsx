"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

export default function AppBreadcrumb() {
    const [pathname, setPathname] = useState<string[]>([]);
    const path = usePathname();


    useEffect(() => {
        if (path) {
            const segments = path.split("/").filter(Boolean);
            setPathname(segments);
        }
    }, [path]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center">
                        <Home className="w-4 h-4 mr-1 font-bold" />
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname.map((segment, index) => (
                    <Fragment key={index}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem key={index}>
                            <BreadcrumbLink asChild>
                                <Link
                                    href={`/${pathname.slice(0, index + 1).join("/")}`}
                                    className="font-light">{segment.charAt(0).toUpperCase() + segment.slice(1)}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
