import { createFileRoute } from '@tanstack/react-router'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export const Route = createFileRoute('/docs/')({
    component: DocumentationPage,
})

function DocumentationPage() {
    return (
        <PageLayout>
            <PageTitle
                title="Documentation"
                description="Learn about FHEdback and how to use confidential surveys"
                titleIcon={<BookOpen />}
                hideAction
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Learn how to create and participate in confidential surveys using Fully Homomorphic Encryption (FHE).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy & Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Understand how FHE ensures your survey responses remain completely private and confidential.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Creator Guide</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Step-by-step guide to creating effective confidential surveys and analyzing results.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Deep dive into the technical implementation, smart contracts, and FHE integration.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    )
}
