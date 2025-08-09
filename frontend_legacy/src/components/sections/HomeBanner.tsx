import { FC } from "react";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

export const HomeBanner: FC = () => {
    return (
        <Section variant="main" fullWidth>
            <h1 className="font-black text-5xl p-4 bg-secondary-background border-4 border-border mx-auto text-center transform -rotate-2 w-fit">
                Create Surveys, Earn Onchain, Stay Private
            </h1>
            <p className="text-xl font-heading mt-12 mx-auto text-center w-3/4">
                Launch surveys with total privacy and onchain incentives. Every response is confidential, every reward is distributed automatically, and your data stays protected by FHEVM.
            </p>
            <div className="w-fit mx-auto mt-12 flex flex-col gap-2">
                <Button variant={"neutral"} size={"lg"} className="font-heading text-lg transform transition-transform hover:-translate-y-1.5 hover:-rotate-2">
                    <Link href="/survey/create" className="inline-flex items-center gap-2">
                        Launch a Private Survey
                        <ArrowRight size={36} />
                    </Link>
                </Button>
                <Button asChild variant={"noShadow"} size={"lg"} className="font-heading text-lg border-none transform transition-transform hover:translate-y-1.5 hover:rotate-2">
                    <Link href="#featured-survey" className="flex items-center gap-2">
                        Answer Privately & Earn
                        <ChevronDown size={36} />
                    </Link>
                </Button>
            </div>
        </Section>
    );
}
