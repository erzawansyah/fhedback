import { createFileRoute } from '@tanstack/react-router'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { NewspaperIcon } from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'

export const Route = createFileRoute('/creator/new/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PageLayout>
            <PageTitle
                title="Create New Item"
                description="Fill out the form below to create a new item."
                titleIcon={<NewspaperIcon />}
                hideAction={true}
            />

            <Section
                title="Item Details"
                description="Provide the necessary details for the new item."
                className="mt-4"
                variant='plain'
            >
                <p className="text-foreground/70">
                    Here you can specify the details of the item you want to create.
                </p>
            </Section>
        </PageLayout>
    )
}
