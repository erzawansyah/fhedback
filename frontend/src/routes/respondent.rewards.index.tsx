import { createFileRoute } from '@tanstack/react-router'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { Ticket } from 'lucide-react'

export const Route = createFileRoute('/respondent/rewards/')({
    component: RewardsPage,
})

function RewardsPage() {
    return (
        <PageLayout>
            <PageTitle
                title="My Rewards"
                description="Track your rewards and incentives"
                titleIcon={<Ticket />}
                hideAction
            />

            <Section title="Reward System" description="Coming soon - earn rewards for survey participation">
                <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Rewards Coming Soon</h3>
                    <p className="text-muted-foreground">
                        We're working on a reward system that will allow you to earn tokens and other incentives
                        for participating in confidential surveys.
                    </p>
                </div>
            </Section>
        </PageLayout>
    )
}
