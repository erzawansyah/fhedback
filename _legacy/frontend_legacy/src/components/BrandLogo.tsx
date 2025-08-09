import { FC } from "react";

export const BrandLogo: FC = () => {
    return (
        <div className="flex items-center">
            <h2 className="flex items-center text-xl font-black">
                <span className="px-2 py-1 text-foreground border-2 border-border bg-main rounded-l-sm">
                    FHE
                </span>
                <span className="px-2 py-1 text-foreground bg-secondary-background border-2 border-l-0 border-border rounded-r-sm">
                    SURVEY
                </span>
            </h2>
        </div>
    );
};

