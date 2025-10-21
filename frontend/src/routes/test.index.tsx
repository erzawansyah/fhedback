import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { createDb } from '../services/firebase/dbStore'
import mockup from "@/assets/json/questions-example.json"
import { useState } from 'react'
import { logger } from '../utils/logger'

export const Route = createFileRoute('/test/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            const cid = await createDb("questions", mockup)
            logger.info('Test document created successfully', { cid })
        } catch (error) {
            logger.error('Failed to create test document', { error })
        } finally {
            setLoading(false)
        }
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
