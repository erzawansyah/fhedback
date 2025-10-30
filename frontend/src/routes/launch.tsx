import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/launch')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/create"!</div>
}
