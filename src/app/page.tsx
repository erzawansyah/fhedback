"use client";
import React from "react";
import { useAccount } from "wagmi";
import { AlertOctagon, ArrowRight, CheckSquare, Rocket } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const DashboardCardContent = [
  {
    title: "Create a Confidential Survey",
    description: "Design secure surveys and collect honest responses. Every answer is encrypted and only visible as statistics. Your respondents' data always stays private.",
    icon: <Rocket className="h-12 w-12 text-yellow-400" />,
    link: "/creator/new",
    actionText: "Start Your Encrypted Survey",
    listItems: [
      "Privacy-first for all participants",
      "Encrypted answers, no access to raw data",
      "Easily share and manage your survey",
      "Gain real insights with total confidentiality",
    ],
  },
  {
    title: "Give Feedback Anonymously",
    description: "Share your opinions with complete confidence. Your answers are encrypted from end to end and your identity is never revealed. Only aggregated results are shown.",
    icon: <CheckSquare className="h-12 w-12 text-green-400" />,
    link: "/explore",
    actionText: "Join a Secure Survey",
    listItems: [
      "True anonymity, no personal info needed",
      "End-to-end encryption for every response",
      "Private by design with FHE technology",
      "Your privacy is always protected",
    ],
  },

]



export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <Card className="py-8 bg-main">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <h1>Welcome to FHEdback</h1>
          </CardTitle>
          <CardDescription className="text-sm font-mono">
            FHEdback leverages Fully Homomorphic Encryption (FHE) by Zama to revolutionize encrypted surveys. Every response is instantly encrypted, ensuring complete privacy—no one, not even the survey owner, can access your data. Experience secure, privacy-preserving surveys powered by advanced encryption.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Choose Journey */}
      <Card className="bg-secondary-background mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertOctagon className="h-8 w-8 text-red-600" />
            <h3 className="text-2xl">Choose Your Journey</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 font-mono">
            Whether you want to create a survey or share your feedback, FHEdback ensures your privacy is protected at every step. Select your path below and experience secure, encrypted interactions powered by Zama’s cutting-edge technology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {
              DashboardCardContent.map((item, index) => (
                <Card key={index} className="bg-background">
                  <CardHeader className="flex flex-row items-start gap-3">
                    {item.icon}
                    <div>
                      <CardTitle className="text-xl font-bold mb-1">
                        <h4>{item.title}</h4>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="ml-8">
                    <ul className="list-disc pl-6 mb-4 text-sm">
                      {item.listItems.map((li, liIndex) => (
                        <li key={liIndex}>{li}</li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {
                      isConnected ? (
                        <Button asChild className="w-full" variant="reverse">
                          <Link href={item.link} className="no-underline group">
                            {item.actionText}
                            <ArrowRight className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full" variant="reverse">
                          Connect Wallet to Start
                        </Button>
                      )
                    }

                  </CardFooter>
                </Card>
              ))
            }

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
