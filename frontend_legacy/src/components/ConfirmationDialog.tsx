import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (status: boolean) => void
    children: ReactNode;
    title?: string;
    description?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onOpenChange,
    children,
    description,
    title = "Are you sure?",
    ...rest
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...rest}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                    {description && <DialogDescription>
                        {description}
                    </DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationDialog;
