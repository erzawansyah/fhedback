import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/survey/stats/$addr')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/survey/stats/$addr"!</div>
}
