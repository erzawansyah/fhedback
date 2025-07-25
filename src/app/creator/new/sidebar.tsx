"use client"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useSurveyCreation } from "@/context/SurveyCreationContext"

const NewSurveySidebar = () => {
    const { config, metadata } = useSurveyCreation()

    return (
        <div className="space-y-6">
            {/* Survey Configuration Summary */}
            <Card>
                <CardContent className="pt-6">
                    {config.address ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Survey Created Successfully!</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Your survey has been deployed on-chain. You can view it{" "}
                                    <a
                                        href={`/view/${config.address}`}
                                        className="text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        here
                                    </a>.
                                </p>
                            </div>

                            {/* Survey Configuration Details */}
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="font-semibold">Contract Address:</span>
                                    <code className="block text-xs bg-gray-100 p-1 rounded mt-1 break-all">
                                        {config.address}
                                    </code>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Title:</span> {config.title || 'Not set'}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Questions:</span> {config.totalQuestions}
                                    {config.status === "initialized" && (
                                        <span className="text-xs text-gray-500 ml-1">(configured)</span>
                                    )}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Respondents:</span> {config.respondentLimit}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Scale:</span> 1-{config.limitScale}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Privacy:</span> {config.isFhe ? "FHE Enabled" : "Public"}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`capitalize ml-1 ${config.status === 'published' ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                        {config.status || 'Unknown'} {config.status === 'published' && '🎉'}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Metadata:</span>
                                    <span className={`ml-1 ${metadata ? 'text-green-600' : 'text-orange-500'}`}>
                                        {metadata ? '✓ Set' : '⚠ Not set'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Getting Started</h3>
                            <p className="text-sm text-gray-600">
                                Fill out the survey settings in Step 1 to create your survey on the blockchain.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Metadata Information Card */}
            {metadata && config.metadataCid && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Metadata Information</h3>
                                <p className="text-xs text-gray-600 mb-2">
                                    Metadata CID:
                                    <code className="block bg-gray-100 p-1 rounded mt-1 break-all">
                                        {config.metadataCid}
                                    </code>
                                </p>
                            </div>

                            <div className="text-xs space-y-1">
                                <div><span className="font-semibold">Display Title:</span> {metadata.title || 'Not set'}</div>
                                <div><span className="font-semibold">Description:</span> {metadata.description || 'Not set'}</div>
                                <div><span className="font-semibold">Category:</span> {metadata.categories || 'Not set'}</div>
                                <div><span className="font-semibold">Scale Labels:</span> {metadata.minLabel} - {metadata.maxLabel}</div>
                                <div><span className="font-semibold">Tags:</span> {metadata.tags?.length ? metadata.tags.join(', ') : 'None'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default NewSurveySidebar
