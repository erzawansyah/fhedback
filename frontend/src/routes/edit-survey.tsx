import { createFileRoute } from '@tanstack/react-router'
import { Card } from '../components/ui/card'

export const Route = createFileRoute('/edit-survey')({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      addr: typeof search.addr === `string` ? search.addr : undefined,
    }
  }
})

function RouteComponent() {
  const search = Route.useSearch()
  return (
    <main className='container max-w-6xl mx-auto p-4 pt-8'>
      <Card className='bg-white px-4'>
        <div>Edit Survey </div>
        <pre>{JSON.stringify(search, null, 2)}</pre>
      </Card>
    </main>
  )
}
