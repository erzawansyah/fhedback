"use client"

import { Clock, Zap, Bell, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ComingSoonProps {
    title: string
    description: string
    expectedDate?: string
    features?: string[]
    notifyEmail?: boolean
}

export const ComingSoon = ({
    title,
    description,
    expectedDate = "Q2 2025",
    features = [],
    notifyEmail = true
}: ComingSoonProps) => {
    const handleNotifyMe = () => {
        // Mock notification signup
        console.log("User signed up for notifications")
        alert("Thanks! We'll notify you when this feature is ready.")
    }

    const handleBackToDashboard = () => {
        window.history.back()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardContent className="pt-12 pb-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-blue-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

                    {/* Expected Date Badge */}
                    <Badge variant="neutral" className="mb-6">
                        <Zap className="w-3 h-3 mr-1" />
                        Coming {expectedDate}
                    </Badge>

                    {/* Description */}
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                        {description}
                    </p>

                    {/* Features Preview */}
                    {features.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-semibold mb-4 text-left">What to expect:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-sm text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-4">
                        {notifyEmail && (
                            <Button
                                onClick={handleNotifyMe}
                                className="w-full md:w-auto flex items-center gap-2"
                            >
                                <Bell className="w-4 h-4" />
                                Notify Me When Ready
                            </Button>
                        )}

                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                            <Button
                                variant="neutral"
                                onClick={handleBackToDashboard}
                                className="flex items-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Want to be the first to know? Follow us on social media for updates and announcements.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
