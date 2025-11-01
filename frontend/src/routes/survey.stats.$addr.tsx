import { createFileRoute } from '@tanstack/react-router'
import type { Address } from 'viem'

// UI Components
import { Card, CardContent } from '../components/ui/card'
import { QuestionStatCard } from '../components/survey-stats'

// Hooks
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { WalletGuard } from '../components/WalletGuard'

export const Route = createFileRoute('/survey/stats/$addr')({
  component: RouteComponent,
})

/**
 * Main route component for displaying survey statistics
 */
function RouteComponent() {
  return (
    <WalletGuard>
      <SurveyStatsPage />
    </WalletGuard>
  )
}

function SurveyStatsPage() {
  const addr = Route.useParams().addr as Address
  const { questions } = useSurveyDataByAddress(addr)

  return (
    <>
      <div className="h-64 bg-main" />
      <main className="container mx-auto -mt-32 pb-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="bg-white">
            <CardContent>
              <h4 className="text-2xl">Survey Insights & Trends</h4>
              <p className="mt-2 text-sm text-gray-700">
                Dive into responses by respondent, by question, or view the big-picture summary — reveal
                individual answers, spot trends per question, and get a clear snapshot of overall
                results.
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Tip: Grant decryption access in your survey settings to unlock detailed insights.
              </p>
            </CardContent>
          </Card>

          {questions?.map((q, i) => (
            <QuestionStatCard
              key={i}
              index={i}
              text={q.text}
              helperText={q.helperText}
              contractAddress={addr}
            />
          ))}
        </div>
      </main>
    </>
  )
}


