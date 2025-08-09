import { cn } from "@/lib/shadcn/utils";

interface PlainBoxProps {
    children?: React.ReactNode;
    className?: string;
}



const PlainBox = ({ children, className, ...props }: PlainBoxProps) => {
    return (
        <div className={cn(
            "bg-secondary-background rounded-base border-2 border-subtle p-4",
            className
        )} {...props}>
            {children}
        </div>
    );
}

export default PlainBox;
