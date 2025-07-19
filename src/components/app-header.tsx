import AppBreadcrumb from "./app-breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";
import { ConnectButton } from "./connect-button";

const AppHeader = () => {
    return (
        <header className="w-full sticky top-0 left-0 z-50 ">
            <div className="flex items-center p-4 justify-between bg-secondary-background">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <AppBreadcrumb />
                </div>
                <ConnectButton />
            </div>
        </header>
    );
}

export default AppHeader;
