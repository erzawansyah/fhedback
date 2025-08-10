import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { createQuestions } from '../services/firebase/create_questions'
import mockup from "@/assets/json/questions-example.json"
import { useState } from 'react'

export const Route = createFileRoute('/test/')({
    component: RouteComponent,
})



function RouteComponent() {
    const [loading, setLoading] = useState(false)


    const handleClick = async () => {
        setLoading(true)
        const cid = await createQuestions(mockup)
        setLoading(false)
        console.log("Document CID:", cid)
    }

    return (
        <div className='min-h-dvh'>
            <div className='mx-auto max-w-3xl px-4 py-8'>
                <Button
                    onClick={handleClick}
                    variant='default'
                    disabled={loading}
                >
                    {
                        loading ? "Loading..." : "Submit"
                    }
                </Button>
            </div>
        </div>
    )
}
