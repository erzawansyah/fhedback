"use client"
import { FC } from "react";
import Section from "@/components/Section";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { SurveyCard } from "../SurveyCard";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useSurvey } from "@/hooks/useSurvey";
import Link from "next/link";

export const FeaturedSurveysSection: FC<{ id?: string }> = ({ id }) => {
    const { surveys, loading } = useSurvey(6)
    return (
        <Section variant="secondary" id={id}>
            <div className="w-full flex-col items-center gap-4 flex px-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Featured Surveys</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover and participate in the latest private surveys. Each survey offers unique rewards while maintaining complete privacy through FHEVM technology.
                    </p>
                </div>
                <Carousel className="w-full">
                    <CarouselContent>
                        {!loading && surveys.map((survey, index) => (
                            <CarouselItem key={index} className="md:basis-2/4 lg:basis-1/3 pb-1 pr-1">
                                <SurveyCard survey={survey} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="cursor-pointer" />
                    <CarouselNext className="cursor-pointer" />
                </Carousel>
            </div>
            <div className="mt-12 text-center">
                <Button>
                    <Link href="/public-survey" className="flex gap-2 items-center">
                        View All Survey <ArrowRight size={36} />
                    </Link>
                </Button>
            </div>
        </Section>
    );
}
