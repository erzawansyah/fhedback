import { ComingSoon } from "@/components/ui/coming-soon"

const AnalyticsPage = () => {
    return (
        <ComingSoon
            title="Advanced Analytics Dashboard"
            description="Get deep insights into your survey performance with comprehensive analytics, real-time metrics, and detailed response analysis."
            expectedDate="Q2 2025"
            features={[
                "Real-time response tracking",
                "Demographic breakdowns",
                "Response quality metrics",
                "Export capabilities",
                "Custom date ranges",
                "Comparison tools",
                "Heat maps and visualizations",
                "Performance benchmarks"
            ]}
        />
    )
}

export default AnalyticsPage
