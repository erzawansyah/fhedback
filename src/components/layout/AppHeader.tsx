import { SidebarTrigger } from "../ui/sidebar"

const AppHeader = () => {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-200">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">FhedBack Dashboard</h1>
            </div>
        </header>
    )
}

export default AppHeader;
