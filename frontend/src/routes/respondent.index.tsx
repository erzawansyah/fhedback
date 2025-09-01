import { createFileRoute } from '@tanstack/react-router'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { History } from 'lucide-react'

export const Route = createFileRoute('/respondent/')({
    component: RespondentHistoryPage,
})

function RespondentHistoryPage() {
    return (
        <PageLayout>
            <PageTitle
                title="Survey History"
                description="View surveys you have participated in"
                titleIcon={<History />}
                hideAction
            />

            <Section title="Your Survey Responses" description="Track your participation in confidential surveys">
                <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Survey History</h3>
                    <p className="text-muted-foreground">
                        You haven't participated in any surveys yet. Browse available surveys to get started.
                    </p>
                </div>
            </Section>
        </PageLayout>
    )
}
