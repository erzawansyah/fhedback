import { createFileRoute } from '@tanstack/react-router'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { HomeIcon } from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    return (
        <PageLayout>
            <PageTitle
                title="Dashboard"
                description="Welcome to your dashboard! Here you can manage your settings and view your data."
                titleIcon={<HomeIcon />}
                hideAction
            />

            <Section
                title="Getting Started"
                description="This section will help you get started with the dashboard."
                className="mt-4"
                variant='plain'
            >
                <p className="text-foreground/70 h-screen">
                    Explore the features of the dashboard, customize your settings, and manage your data efficiently.
                </p>
            </Section>
        </PageLayout>
    )
}
