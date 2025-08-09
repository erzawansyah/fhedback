"use client";
import { ConnectButton as RainbowkitConnectButton } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserRoundCog, Wallet, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

// Connect Wallet Button Component
const ConnectWalletButton: FC<{ onClick: () => void; className?: string }> = ({
    onClick,
    className
}) => (
    <Button
        onClick={onClick}
        type="button"
        className={cn("font-mono cursor-pointer", className)}
        data-slot="connect-wallet-button"
    >
        <Wallet className="inline h-4 w-4" />
        Connect Wallet
    </Button>
);

// Wrong Network Button Component
const WrongNetworkButton: FC<{ onClick: () => void; className?: string }> = ({
    onClick,
    className
}) => (
    <Button
        onClick={onClick}
        type="button"
        variant="neutral"
        className={cn("font-mono cursor-pointer text-danger", className)}
        data-slot="wrong-network-button"
    >
        <AlertTriangle className="inline h-4 w-4" />
        Wrong network
    </Button>
);

// Account Info Button Component
const AccountInfoButton: FC<{
    onClick: () => void;
    displayName: string;
    displayBalance?: string;
    displayAvatar?: string;
    className?: string;
}> = ({ onClick, displayName, displayBalance, displayAvatar, className }) => {
    return (
        <div className={cn("flex gap-2", className)} data-slot="account-info-button">
            <Button
                onClick={onClick}
                type="button"
                variant="neutral"
                className="font-mono cursor-pointer"
            >
                <span className="truncate">
                    {displayName}
                    {displayBalance ? ` (${displayBalance})` : ''}
                </span>
            </Button>
            <Button
                size="icon"
                variant="neutral"
                className="cursor-pointer shrink-0"
                onClick={onClick}
            >
                {displayAvatar ? (
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={displayAvatar} alt={displayName} />
                        <AvatarFallback>
                            <UserRoundCog className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <UserRoundCog className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
};

// Main ConnectButton Component
export const ConnectButton: FC<{ className?: string }> = ({ className }) => {
    return (
        <RainbowkitConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                if (!ready) {
                    return (
                        <div
                            aria-hidden="true"
                            className="opacity-0 pointer-events-none select-none"
                            data-slot="connect-button-loading"
                        />
                    );
                }

                if (!connected) {
                    return <ConnectWalletButton onClick={openConnectModal} className={className} />;
                }

                if (chain.unsupported) {
                    return <WrongNetworkButton onClick={openChainModal} className={className} />;
                }

                return (
                    <AccountInfoButton
                        onClick={openAccountModal}
                        displayName={account.displayName}
                        displayBalance={account.displayBalance}
                        displayAvatar={account.ensAvatar}
                        className={className}
                    />
                );
            }}
        </RainbowkitConnectButton.Custom>
    );
};
