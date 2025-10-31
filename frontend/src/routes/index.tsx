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
                    Create Surveys, Earn Onchain, Stay Private
                </h1>
                <p className="text-xl font-heading mt-12 mx-auto text-center w-3/4">
                    Launch surveys with total privacy and onchain incentives. Every response is confidential, every reward is distributed automatically, and your data stays protected by FHEVM.
                </p>
                <div className="w-fit mx-auto mt-12 flex flex-col gap-2">
                    <Button variant={"neutral"} size={"lg"} className="font-heading text-lg transform transition-transform hover:-translate-y-1.5 hover:-rotate-2">
                        <Link to="/survey/create" className="inline-flex items-center gap-2">
                            Launch a Private Survey
                            <ArrowRight size={36} />
                        </Link>
                    </Button>
                    <Button asChild variant={"noShadow"} size={"lg"} className="font-heading text-lg border-none transform transition-transform hover:translate-y-1.5 hover:rotate-2">
                        <Link to="/surveys/explore" className="flex items-center gap-2">
                            Answer Privately & Earn
                            <ChevronDown size={36} />
                        </Link>
                    </Button>
                </div>
            </section>
            <section className='bg-background border-t-4 py-48'>
                {/* section title */}
                <h2 className='text-2xl font-bold text-center pt-4'>Latest Surveys</h2>
                <div className='flex flex-col gap-4 mt-4'>
                    {/* survey items */}
                    <div className='px-4'>
                        {/* Replace with dynamic survey list */}
                        <p className='text-center text-muted-foreground'>No surveys available at the moment. Check back later!</p>
                    </div>
                </div>
            </section>
        </main>
    )
}
