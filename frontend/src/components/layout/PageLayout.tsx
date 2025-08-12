import { cn } from "../../utils";

const PageLayout = ({ children, className }
    :
    { children: React.ReactNode, className?: string }) => {
    return (
        <main className={cn('container max-w-7xl mx-auto p-8 space-y-8', className)}>
            {children}
        </main>
    );
}

export default PageLayout;
