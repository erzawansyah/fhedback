import AppBreadcrumb from "./app-breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";
import { ConnectButton } from "./connect-button";
import { ThemeSwitcher } from "./theme-switcher";

const AppHeader = () => {
    return (
        <header className="w-full sticky top-0 left-0 z-50 ">
            <div className="flex items-center p-6 justify-between bg-secondary-background">
                <div className="flex items-center gap-6">
                    <SidebarTrigger />
                    <AppBreadcrumb />
                </div>
                <div className="flex items-center gap-6">
                    <ThemeSwitcher />
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
