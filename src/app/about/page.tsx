"use client"

import { Shield, Users, Award, Globe, Target, Zap } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const AboutPage = () => {
    const features = [
        {
            icon: Shield,
            title: "Privacy-First",
            description: "Built on Zama's FHE technology, ensuring your survey responses remain completely private and encrypted."
        },
        {
            icon: Users,
            title: "Decentralized Community",
            description: "Connect with a global community of researchers, businesses, and individuals sharing valuable insights."
        },
        {
            icon: Award,
            title: "Token Rewards",
            description: "Earn tokens for participating in surveys and contribute to meaningful research while being compensated."
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Access surveys from around the world and share your perspectives with a diverse audience."
        },
        {
            icon: Target,
            title: "Quality Research",
            description: "High-quality surveys designed by researchers and businesses to gather meaningful insights."
        },
        {
            icon: Zap,
            title: "Instant Results",
            description: "Real-time survey results and analytics powered by blockchain technology."
        }
    ]

    const stats = [
        { label: "Total Surveys", value: "10,000+", description: "Created by our community" },
        { label: "Active Users", value: "50,000+", description: "Researchers and participants" },
        { label: "Tokens Distributed", value: "1M+", description: "Rewards for participation" },
        { label: "Countries", value: "150+", description: "Global reach and diversity" }
    ]

    const team = [
        {
            name: "Research Team",
            role: "Privacy & Cryptography",
            description: "Experts in FHE and privacy-preserving technologies"
        },
        {
            name: "Product Team",
            role: "User Experience",
            description: "Designing intuitive interfaces for researchers and participants"
        },
        {
            name: "Community Team",
            role: "Global Outreach",
            description: "Building and supporting our worldwide community"
        }
    ]

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <Badge variant="neutral" className="mb-4">About FHEDback</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Privacy-First Survey Platform
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    FHEDback revolutionizes data collection by combining fully homomorphic encryption (FHE)
                    with blockchain technology to create a secure, private, and rewarding survey ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg">Start Creating Surveys</Button>
                    <Button variant="neutral" size="lg">Explore Surveys</Button>
                </div>
            </div>

            {/* Mission Statement */}
            <Card className="mb-16">
                <CardContent className="pt-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                            To democratize data collection while preserving privacy. We believe that valuable insights
                            should be accessible to everyone without compromising individual privacy or data security.
                            Our platform empowers researchers, businesses, and individuals to gather and share knowledge
                            in a secure, transparent, and rewarding environment.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose FHEDback?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <feature.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center">
                            <CardContent className="pt-8">
                                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                                <div className="text-sm text-gray-600">{stat.description}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Technology Section */}
            <Card className="mb-16">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Built on Cutting-Edge Technology</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Zama FHE Technology</h3>
                            <p className="text-gray-600 mb-4">
                                Fully Homomorphic Encryption allows computations on encrypted data without
                                decryption, ensuring complete privacy of survey responses while enabling
                                meaningful analysis.
                            </p>
                            <Badge variant="neutral">Privacy-Preserving</Badge>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Blockchain Integration</h3>
                            <p className="text-gray-600 mb-4">
                                Smart contracts handle survey creation, response validation, and token
                                distribution automatically, ensuring transparency and trust in the ecosystem.
                            </p>
                            <Badge variant="neutral">Decentralized</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {team.map((member, index) => (
                        <Card key={index} className="text-center">
                            <CardContent className="pt-8">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                                <p className="text-sm text-gray-600">{member.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <Card className="text-center">
                <CardContent className="pt-8">
                    <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                    <p className="text-gray-600 mb-6">
                        Have questions about FHEDback? Want to collaborate or provide feedback?
                        We&apos;d love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="neutral">Join Our Discord</Button>
                        <Button variant="neutral">Follow on Twitter</Button>
                        <Button variant="neutral">Contact Support</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AboutPage
