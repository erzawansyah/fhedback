import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ConnectButton } from './ConnectButton'
import { Wallet } from 'lucide-react'

/**
 * Component to protect routes that require wallet connection
 * If wallet is not connected, shows a message asking user to connect
 */
export function WalletGuard({ children }: { children: React.ReactNode }) {
    const { isConnected } = useAccount()

    if (!isConnected) {
        return (
            <main className="container mx-auto py-16">
                <div className="max-w-2xl mx-auto">
                    <Card className="bg-white">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-3xl">Wallet Connection Required</CardTitle>
                            <CardDescription className="text-base mt-2">
                                You need to connect your wallet to access this page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                This page requires a connected wallet to ensure secure and authenticated interactions with the blockchain.
                            </p>
                            <div className="flex flex-col gap-3 items-center">
                                <ConnectButton />
                                <Button variant="neutral" asChild>
                                    <a href="/">Back to Home</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    return <>{children}</>
}
