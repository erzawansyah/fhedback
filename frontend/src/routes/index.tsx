import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    return (
        <main className="min-h-[92vh] flex flex-col">
            <section className='flex flex-col justify-center items-center py-48 bg-main'>
                <h1 className="font-black text-5xl p-4 bg-secondary-background border-4 border-border mx-auto text-center transform -rotate-2 w-fit">
                    Create Fully Confidential Onchain Surveys
                </h1>
                <p className="text-xl font-heading mt-12 mx-auto text-center w-3/4">
                    Build surveys where every response stays encrypted end-to-end. No identities, no tracking, no data exposure — not even the survey owner can access individual answers.
                </p>
                <div className="w-fit mx-auto mt-12 flex flex-col gap-2">
                    <Button variant={"neutral"} size={"lg"} className="font-heading text-lg transform transition-transform hover:-translate-y-1.5 hover:-rotate-2">
                        <Link to="/survey/create" className="inline-flex items-center gap-2">
                            Launch a Confidential Survey
                            <ArrowRight size={36} />
                        </Link>
                    </Button>
                    <Button asChild variant={"noShadow"} size={"lg"} className="font-heading text-lg border-none transform transition-transform hover:translate-y-1.5 hover:rotate-2">
                        <Link to="/surveys/explore" className="flex items-center gap-2">
                            Answer Anonymously
                            <ChevronDown size={36} />
                        </Link>
                    </Button>
                </div>

            </section>
            <section className="bg-background border-t-4 py-24">
                <h2 className="text-3xl font-bold text-center">How It Works</h2>
                <p className="mt-3 text-center text-muted-foreground">
                    Private by design from creation to analysis. No identities, no raw data exposure.
                </p>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="font-semibold text-lg">1. Create</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Define questions and privacy rules. The survey schema is published onchain while answers remain encrypted off-chain compatible.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="font-semibold text-lg">2. Collect</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Respondents submit encrypted answers. No account, no email, no tracking pixels.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-card">
                        <h3 className="font-semibold text-lg">3. Analyze</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Only aggregated results are computed and revealed. Individual answers stay mathematically private.
                        </p>
                    </div>
                </div>
            </section>
            <section className="bg-main border-t-4 py-24">
                <h2 className="text-3xl font-bold text-center">Key Privacy Guarantees</h2>
                <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">End-to-end encryption</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Answers are encrypted at the client and remain encrypted through processing.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">No identity collection</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            No emails, no wallet linkage requirements, no IP-based profiling.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">Aggregation only</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The system reveals summaries, not rows. Raw answers never leave encryption.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">Tamper-evident control</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Onchain configuration makes policy changes visible and auditable.
                        </p>
                    </div>
                </div>
            </section>
            <section className="bg-background border-t-4 py-24">
                <h2 className="text-3xl font-bold text-center">Who Is This For</h2>
                <div className="mt-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">Academic researchers</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Collect sensitive responses while meeting strict ethics requirements.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">UX and product teams</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Get honest feedback without tracking or profiling users.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">Healthcare and NGOs</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enable reporting on sensitive topics while protecting identities.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">Enterprises</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Run internal climate surveys under strict confidentiality.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">Governments</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Gather citizen input on policies without exposing individuals.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="font-semibold">Security teams</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Anonymous incident reporting with verifiable handling rules.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-main border-t-4 py-24">
                <h2 className="text-3xl font-bold text-center">FAQ</h2>
                <div className="mt-10 max-w-3xl mx-auto space-y-6 px-4">
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">Can anyone read individual answers</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            No. Individual answers are never revealed. The system only exposes aggregated statistics.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">Do I need an account to answer</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            No. We avoid identifiers such as emails and device fingerprints.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">What does onchain add</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Onchain records make survey policies and lifecycle events verifiable and tamper-evident.
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg bg-secondary-background">
                        <h3 className="font-semibold">Where are computations done</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Computations operate on encrypted data and result in aggregates only. Plaintext rows are never produced.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
