'use client'
import { ConnectButton as RainbowkitConnectButton } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { Button } from "./ui/button";

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
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button onClick={openConnectModal} type="button" className="font-heading">
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button variant={"neutral"} onClick={openChainModal} type="button">
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button variant={"neutral"} onClick={openAccountModal} type="button" className="font-heading">
                                        {account.displayName}
                                        {account.displayBalance
                                            ? ` (${account.displayBalance})`
                                            : ''}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowkitConnectButton.Custom>
    );
}
