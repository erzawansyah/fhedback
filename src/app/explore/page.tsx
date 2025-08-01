"use client";
import PageSection from "@/components/layout/page-section";
import PageTitle from "@/components/layout/page-title"
import PlainBox from "@/components/layout/plain-box";
import { SurveyExplorer } from "@/components/survey-explore"
import { factoryContract } from "@/lib/contracts";
import { cn } from "@/lib/shadcn/utils";
import { ArrowLeftRight, BookLock, Fuel, Globe, RefreshCcw, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

interface SurveyStat {
    id: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    number: number;
    unit?: string;
    color?: string;
}

interface ExplorerStatsResponse {
    transactions_count: number;
    token_transfer_count: number;
    gas_usage_count: number;
    validations_count: number;
}

const defaultStats: SurveyStat[] = [
    {
        id: 1,
        icon: BookLock,
        title: "Surveys Created",
        number: 0,
    },
    {
        id: 2,
        icon: Users,
        title: "Created Surveys",
        number: 0,
        unit: "Addresses",
    },
    {
        id: 3,
        icon: ArrowLeftRight,
        title: "Transactions Made",
        number: 0,
    },
    {
        id: 4,
        icon: Fuel,
        title: "Gas Fees Spent",
        number: 0,
        unit: "ETH",
    }
]



const ExplorePage = () => {
    const [stats, setStats] = useState<SurveyStat[]>(defaultStats);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastFetch, setLastFetch] = useState<number>(0);
    const data = useReadContracts({
        contracts: [
            {
                ...factoryContract,
                address: factoryContract.address as Address,
                functionName: "getQuestionnaireCount",
            },
            {
                ...factoryContract,
                address: factoryContract.address as Address,
                functionName: "uniqueUserCount",
            }
        ],
        query: {
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        }
    })

    const fetchStats = useCallback(async () => {
        const explorerApiUrl = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_URL!;
        try {
            const response = await fetch(`${explorerApiUrl}/addresses/${factoryContract.address}/counters`, {
                cache: 'force-cache',
                next: { revalidate: 300 } // Cache for 5 minutes
            });
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("Rate limit exceeded for explorer API. Using cached data.");
                    return null;
                }
                throw new Error(`HTTP ${response.status}: Failed to fetch stats`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error fetching stats:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (data.isSuccess && data.data) {
            const [surveyCount, userCount] = data.data;

            // Check for rate limiting errors
            if (surveyCount.error || userCount.error) {
                const error = surveyCount.error || userCount.error;
                if (error?.message.includes('429') || error?.message.includes('Too Many Requests')) {
                    console.warn("Rate limit exceeded for contract calls. Retrying later...");
                    return;
                }
            }

            setStats(prevStats => prevStats.map(stat => {
                if (stat.id === 1) {
                    return { ...stat, number: surveyCount.status === "success" ? Number(surveyCount.result) : 0 };
                }
                if (stat.id === 2) {
                    return { ...stat, number: userCount.status === "success" ? Number(userCount.result) : 0 };
                }
                return stat;
            }));
            console.log("Survey Count:", surveyCount.result);
            console.log("User Count:", userCount.result);
        }

        // Handle loading errors
        if (data.isError) {
            console.error("Contract data loading error:", data.error);
            if (data.error?.message.includes('429') || data.error?.message.includes('Too Many Requests')) {
                console.warn("Rate limit exceeded. Please wait before refreshing.");
            }
        }
    }, [data.isSuccess, data.data, data.isError, data.error]);

    useEffect(() => {
        const now = Date.now();
        // Prevent too frequent fetches (minimum 30 seconds between fetches)
        if (now - lastFetch < 30000) {
            return;
        }

        const timer = setTimeout(() => {
            fetchStats().then((res: ExplorerStatsResponse | null) => {
                if (!res) return;
                setStats(prevStats => prevStats.map(stat => {
                    if (stat.id === 4) {
                        const gasUsageEth = Number(res.gas_usage_count) / 1e18;
                        // Format to max 4 significant digits, remove trailing zeros
                        const formattedGas = parseFloat(gasUsageEth.toPrecision(2));
                        return { ...stat, number: formattedGas };
                    }
                    return stat;
                }));
                setLastFetch(now);
            });
        }, 1000); // Delay 1 second to avoid immediate fetch

        return () => clearTimeout(timer);
    }, [fetchStats, lastFetch]);



    const handleRefresh = () => {
        const now = Date.now();
        // Prevent too frequent refreshes (minimum 10 seconds between refreshes)
        if (now - lastFetch < 10000) {
            console.warn("Please wait before refreshing again to avoid rate limiting.");
            return;
        }

        setIsRefreshing(true);

        // Force refetch contract data
        data.refetch?.();

        // Refetch explorer stats
        fetchStats().then((res: ExplorerStatsResponse | null) => {
            if (res) {
                setStats(prevStats => prevStats.map(stat => {
                    if (stat.id === 4) {
                        const gasUsageEth = Number(res.gas_usage_count) / 1e18;
                        const formattedGas = parseFloat(gasUsageEth.toPrecision(2));
                        return { ...stat, number: formattedGas };
                    }
                    return stat;
                }));
            }
            setLastFetch(now);
            setIsRefreshing(false);
        }).catch(() => {
            setIsRefreshing(false);
        });

        console.log("Refreshing surveys...");
    }


    return (
        <div className="space-y-12">
            {/* Page Title */}
            <PageTitle
                title="Explore Surveys"
                description="Discover and participate in surveys from the community. Earn tokens while sharing your opinions."
                titleIcon={<Globe size={32} className="text-main" />}
                handleAction={handleRefresh}
                actionIcon={<RefreshCcw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />}
                actionText={isRefreshing ? "Refreshing..." : "Refresh Page"}
            />

            {/* Statistics & Insights */}
            <PageSection
                title="Global Statistics"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <PlainBox key={index} className="flex gap-4 items-center">
                            <div className="flex-1">
                                <h4 className="text-4xl text-foreground">
                                    {stat.number}
                                    {stat.unit ? <span className="text-sm text-subtle font-semibold italic"> {stat.unit}</span> : ""}
                                </h4>
                                <p className="text-subtle">
                                    {stat.title}
                                </p>
                            </div>
                            <div className={cn(
                                "p-2 text-foreground shadow-shadow rounded-base border-2 border-border",
                                stat.color ? stat.color : "bg-main"
                            )}>
                                <stat.icon size={52} className="text-secondary-background" />
                            </div>
                        </PlainBox>
                    ))}
                </div>
            </PageSection>
            <div className="mt-6">
                <SurveyExplorer />
            </div>
        </div>
    )
}

export default ExplorePage
