import { FC } from "react";

export const BrandLogo: FC = () => {
    return (
        <div>
            <h2>
                <span className="px-2 py-1 text-xl font-black text-black border-2 border-r border-foreground bg-main">FHE</span>
                <span className="px-2 py-1 text-xl font-black bg-white border-2 border-l border-foreground dark:bg-background">SURVEY</span>
            </h2>
        </div>
    );
}

