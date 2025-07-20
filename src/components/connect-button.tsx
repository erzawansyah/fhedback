"use client";
import { ConnectButton as RainbowkitConnectButton } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { UserRoundCog, Wallet } from "lucide-react";

// Connect Wallet Button
const ConnectWalletButton: FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
        onClick={onClick}
        type="button"
        className="font-heading cursor-pointer"
    >
        <Wallet className="inline h-8 w-8 mr-1" />
        Connect Wallet
    </Button>
);

// Wrong Network Button
const WrongNetworkButton: FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button
        onClick={onClick}
        type="button"
        className="font-heading text-red bg-error-bg cursor-pointer"
    >
        Wrong network
    </Button>
);

// Account Info Button
const AccountInfoButton: FC<{
    onClick: () => void;
    displayName: string;
    displayBalance?: string;
    displayAvatar?: string;
}> = ({ onClick, displayName, displayBalance, displayAvatar }) => {
    return (
        <div className="flex gap-2">
            <Button
                onClick={onClick}
                type="button"
                className="font-heading cursor-pointer"
            >
                {displayName}
                {displayBalance ? ` (${displayBalance})` : ''}
            </Button>
            <Button size={"icon"} className="cursor-pointer">
                {displayAvatar ? <Image
                    src={displayAvatar}
                    alt={displayName}
                    width={24}
                    height={24}
                /> : <UserRoundCog
                    className="h-6 w-6"
                    strokeWidth={3}
                />}
            </Button>
        </div>
    )
}

// Main ConnectButton Component
export const ConnectButton: FC = () => {
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
                            style={{
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}
                        />
                    );
                }

                if (!connected) {
                    return <ConnectWalletButton onClick={openConnectModal} />;
                }

                if (chain.unsupported) {
                    return <WrongNetworkButton onClick={openChainModal} />;
                }

                return (
                    <AccountInfoButton
                        onClick={openAccountModal}
                        displayName={account.displayName}
                        displayBalance={account.displayBalance}
                        displayAvatar={account.ensAvatar}
                    />
                );
            }}
        </RainbowkitConnectButton.Custom>
    );
};
