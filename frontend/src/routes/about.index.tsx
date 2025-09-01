import { createFileRoute } from '@tanstack/react-router'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { Megaphone, Shield, Users, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export const Route = createFileRoute('/about/')({
    component: AboutPage,
})

function AboutPage() {
    return (
        <PageLayout>
            <PageTitle
                title="About FHEdback"
                description="Privacy-first survey platform powered by Fully Homomorphic Encryption"
                titleIcon={<Megaphone />}
                hideAction
            />

            <Section title="What is FHEdback?" description="The future of confidential data collection">
                <div className="prose prose-gray max-w-none">
                    <p className="text-lg">
                        FHEdback is a revolutionary survey platform that ensures complete privacy and confidentiality
                        using Fully Homomorphic Encryption (FHE). Built on blockchain technology, it allows
                        organizations to collect sensitive data while guaranteeing respondent anonymity.
                    </p>
                </div>
            </Section>

            <Section title="Key Features">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Complete Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Responses are encrypted using FHE, ensuring individual responses remain private
                                while allowing statistical analysis.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Decentralized
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Built on blockchain technology for transparency, immutability, and trustless operation.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Real-time Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Get instant insights and analytics without compromising individual privacy.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Easy to Use
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Simple interface for creating surveys and participating, with wallet integration.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            <Section title="Technology Stack">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">Zama FHEVM</Badge>
                    <Badge variant="neutral">Sepolia Testnet</Badge>
                    <Badge variant="neutral">React + TypeScript</Badge>
                    <Badge variant="neutral">Wagmi</Badge>
                    <Badge variant="neutral">RainbowKit</Badge>
                    <Badge variant="neutral">Solidity</Badge>
                    <Badge variant="neutral">IPFS</Badge>
                    <Badge variant="neutral">Firebase</Badge>
                </div>
            </Section>
        </PageLayout>
    )
}
