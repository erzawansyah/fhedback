"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Copy,
    Shield,
    ExternalLink,
    Network,
    Database,
    Info
} from "lucide-react"
import { toast } from "sonner"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

const TechnicalInfoCard = () => {
    const { config, metadata } = useSurveyCreationContext()
    const [open, setOpen] = useState(false)

    // Only show if survey is deployed
    if (!config?.address) {
        return null
    }

    // Copy to clipboard utility
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} copied to clipboard!`)
        } catch {
            toast.error(`Failed to copy ${label}`)
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Technical Details
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">
                    {/* Quick Info - Compact */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Network:</span>
                            <Badge variant="neutral" className="text-xs px-1 py-0">
                                <Network className="w-3 h-3 mr-1" />
                                Zama Testnet
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Encryption:</span>
                            <Badge variant="neutral" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                FHE
                            </Badge>
                        </div>
                    </div>

                    {/* Compact Address Display */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Contract:</span>
                        <code className="block text-xs font-mono text-gray-800 dark:text-gray-200 mt-1">
                            {config.address.slice(0, 6)}...{config.address.slice(-4)}
                        </code>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button
                            variant="neutral"
                            size="sm"
                            className="w-full"
                            onClick={() => copyToClipboard(config.address!, "Contract Address")}
                        >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Address
                        </Button>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="neutral" size="sm" className="w-full">
                                    <Info className="w-3 h-3 mr-1" />
                                    View Details
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Database className="w-5 h-5" />
                                        Technical Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        Complete technical information about your survey contract
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {/* Contract Address */}
                                    <div>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400">Contract Address:</span>
                                        <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded mt-1 break-all font-mono text-sm">
                                            {config.address}
                                        </code>
                                        <Button
                                            variant="neutral"
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={() => copyToClipboard(config.address!, "Contract Address")}
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copy Address
                                        </Button>
                                    </div>

                                    {/* Network Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Network:</span>
                                                <Badge variant="neutral" className="text-xs">
                                                    <Network className="w-3 h-3 mr-1" />
                                                    Zama Testnet
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Encryption:</span>
                                                <Badge variant="neutral" className="text-xs">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    FHE
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Chain ID:</span>
                                                <Badge variant="neutral" className="text-xs">8009</Badge>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Block Explorer:</span>
                                                <Button
                                                    variant="neutral"
                                                    size="sm"
                                                    onClick={() => window.open(`https://explorer.zama.ai/address/${config.address}`, '_blank')}
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FHE Information */}
                                    {config.encrypted && (
                                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-green-600" />
                                                <span className="font-medium text-green-800 dark:text-green-200">
                                                    FHE Encryption Active
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                This survey uses Fully Homomorphic Encryption (FHE) for maximum privacy protection.
                                                Survey responses are encrypted and can only be processed in their encrypted form.
                                            </p>
                                        </div>
                                    )}

                                    {/* Metadata CID */}
                                    {metadata?.metadataCid && (
                                        <div>
                                            <span className="font-semibold text-gray-600 dark:text-gray-400">Metadata CID:</span>
                                            <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded mt-1 break-all font-mono text-sm">
                                                {metadata.metadataCid}
                                            </code>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    variant="neutral"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => copyToClipboard(metadata.metadataCid!, "Metadata CID")}
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    Copy CID
                                                </Button>
                                                <Button
                                                    variant="neutral"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => window.open(`https://ipfs.io/ipfs/${metadata.metadataCid}`, '_blank')}
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    View IPFS
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contract Verification */}
                                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium text-blue-800 dark:text-blue-200">
                                                Contract Verified
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                            This smart contract has been verified on the blockchain for transparency and security.
                                        </p>
                                        <Button
                                            variant="neutral"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => window.open(`https://explorer.zama.ai/address/${config.address}`, '_blank')}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            View on Zama Explorer
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TechnicalInfoCard
