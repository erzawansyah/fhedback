"use client"

import { useState } from "react"
import { ChevronRight, Book, Code, Zap, Shield, Users, FileText, ExternalLink, Search } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DocsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("getting-started")

    const categories = [
        {
            id: "getting-started",
            title: "Getting Started",
            icon: Zap,
            description: "Quick start guide and basic concepts"
        },
        {
            id: "survey-creation",
            title: "Survey Creation",
            icon: FileText,
            description: "Creating and managing surveys"
        },
        {
            id: "privacy-security",
            title: "Privacy & Security",
            icon: Shield,
            description: "FHE technology and data protection"
        },
        {
            id: "api-reference",
            title: "API Reference",
            icon: Code,
            description: "Developer documentation and APIs"
        },
        {
            id: "community",
            title: "Community",
            icon: Users,
            description: "Community guidelines and support"
        }
    ]

    const docs = {
        "getting-started": [
            {
                title: "Welcome to FHEDback",
                description: "Introduction to the platform and its core concepts",
                level: "Beginner",
                readTime: "5 min",
                link: "#welcome"
            },
            {
                title: "Setting Up Your Account",
                description: "Creating an account and connecting your wallet",
                level: "Beginner",
                readTime: "3 min",
                link: "#setup"
            },
            {
                title: "Understanding FHE Technology",
                description: "Learn about Fully Homomorphic Encryption",
                level: "Intermediate",
                readTime: "10 min",
                link: "#fhe-basics"
            },
            {
                title: "Platform Overview",
                description: "Navigate through different sections of the platform",
                level: "Beginner",
                readTime: "7 min",
                link: "#overview"
            }
        ],
        "survey-creation": [
            {
                title: "Creating Your First Survey",
                description: "Step-by-step guide to survey creation",
                level: "Beginner",
                readTime: "8 min",
                link: "#first-survey"
            },
            {
                title: "Survey Settings and Configuration",
                description: "Advanced settings for survey customization",
                level: "Intermediate",
                readTime: "12 min",
                link: "#survey-config"
            },
            {
                title: "Question Types and Best Practices",
                description: "Understanding different question types",
                level: "Intermediate",
                readTime: "15 min",
                link: "#question-types"
            },
            {
                title: "Managing Survey Responses",
                description: "Analyzing and exporting survey data",
                level: "Advanced",
                readTime: "10 min",
                link: "#manage-responses"
            }
        ],
        "privacy-security": [
            {
                title: "How FHE Protects Your Data",
                description: "Technical overview of our privacy implementation",
                level: "Advanced",
                readTime: "20 min",
                link: "#fhe-protection"
            },
            {
                title: "Smart Contract Security",
                description: "Security measures in our blockchain integration",
                level: "Advanced",
                readTime: "15 min",
                link: "#smart-contracts"
            },
            {
                title: "Data Encryption and Storage",
                description: "How we handle and store encrypted data",
                level: "Intermediate",
                readTime: "12 min",
                link: "#data-encryption"
            },
            {
                title: "Privacy Best Practices",
                description: "Guidelines for maintaining privacy",
                level: "Beginner",
                readTime: "8 min",
                link: "#privacy-practices"
            }
        ],
        "api-reference": [
            {
                title: "API Authentication",
                description: "How to authenticate with our API",
                level: "Advanced",
                readTime: "10 min",
                link: "#api-auth"
            },
            {
                title: "Survey API Endpoints",
                description: "REST API for survey operations",
                level: "Advanced",
                readTime: "25 min",
                link: "#survey-api"
            },
            {
                title: "Webhook Integration",
                description: "Setting up webhooks for real-time updates",
                level: "Advanced",
                readTime: "15 min",
                link: "#webhooks"
            },
            {
                title: "SDK and Libraries",
                description: "Official SDKs and community libraries",
                level: "Intermediate",
                readTime: "12 min",
                link: "#sdk"
            }
        ],
        "community": [
            {
                title: "Community Guidelines",
                description: "Rules and guidelines for community participation",
                level: "Beginner",
                readTime: "5 min",
                link: "#guidelines"
            },
            {
                title: "Getting Help and Support",
                description: "How to get help when you need it",
                level: "Beginner",
                readTime: "3 min",
                link: "#support"
            },
            {
                title: "Contributing to FHEDback",
                description: "Ways to contribute to the platform",
                level: "Intermediate",
                readTime: "10 min",
                link: "#contributing"
            },
            {
                title: "Bug Reports and Feature Requests",
                description: "How to report bugs and request features",
                level: "Beginner",
                readTime: "5 min",
                link: "#bug-reports"
            }
        ]
    }

    const filteredDocs = docs[selectedCategory as keyof typeof docs]?.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner": return "text-green-600 bg-green-100"
            case "Intermediate": return "text-orange-600 bg-orange-100"
            case "Advanced": return "text-red-600 bg-red-100"
            default: return "text-gray-600 bg-gray-100"
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Book className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Documentation</h1>
                </div>
                <p className="text-gray-600 text-lg">
                    Everything you need to know about using FHEDback, from basic concepts to advanced features.
                </p>
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search documentation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <h3 className="font-semibold mb-4">Categories</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedCategory === category.id
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : "hover:bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <category.icon className="w-5 h-5" />
                                        <div>
                                            <div className="font-medium text-sm">{category.title}</div>
                                            <div className="text-xs text-gray-500">{category.description}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="mt-8">
                            <h3 className="font-semibold mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Button variant="neutral" size="sm" className="w-full justify-between">
                                    <span>API Reference</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button variant="neutral" size="sm" className="w-full justify-between">
                                    <span>Community Discord</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button variant="neutral" size="sm" className="w-full justify-between">
                                    <span>GitHub Repository</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {categories.find(cat => cat.id === selectedCategory)?.title}
                        </h2>
                        <p className="text-gray-600">
                            {categories.find(cat => cat.id === selectedCategory)?.description}
                        </p>
                    </div>

                    {/* Documentation Cards */}
                    <div className="space-y-4">
                        {filteredDocs.length === 0 ? (
                            <Card>
                                <CardContent className="pt-8 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <Search className="w-12 h-12 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documentation found</h3>
                                    <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredDocs.map((doc, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <Badge
                                                        variant="neutral"
                                                        className={`text-xs ${getLevelColor(doc.level)}`}
                                                    >
                                                        {doc.level}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 mb-3">{doc.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>📖 {doc.readTime} read</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Help Section */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Need More Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Can&apos;t find what you&apos;re looking for? Our community and support team are here to help.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="neutral">Join Discord Community</Button>
                                <Button variant="neutral">Contact Support</Button>
                                <Button variant="neutral">Report an Issue</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DocsPage
