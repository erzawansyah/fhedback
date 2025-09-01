import { createFileRoute } from '@tanstack/react-router'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { BarChart2 } from 'lucide-react'

export const Route = createFileRoute('/creator/analytics/')({
    component: AnalyticsPage,
})

function AnalyticsPage() {
    return (
        <PageLayout>
            <PageTitle
                title="Results & Analytics"
                description="View detailed analytics and insights from your surveys"
                titleIcon={<BarChart2 />}
                hideAction
            />

            <Section title="Coming Soon" description="Analytics features are currently in development">
                <div className="text-center py-12">
                    <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">
                        Advanced analytics and reporting features are coming soon. You'll be able to view detailed insights,
                        export data, and create custom reports for your surveys.
                    </p>
                </div>
            </Section>
        </PageLayout>
    )
}
