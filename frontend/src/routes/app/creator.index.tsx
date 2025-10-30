import { createFileRoute, useNavigate } from '@tanstack/react-router'
import PageLayout from '@/components/layout/PageLayout'
import PageTitle from '@/components/layout/PageTitle'
import { FilePlus, FileTextIcon } from 'lucide-react'
import Section from '@/components/layout/Section'
import { useAccount, useReadContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '@/services/contracts'
import { useMemo } from 'react'
import MySurvey from '@/components/MySurvey'

export const Route = createFileRoute('/app/creator/')({
  component: CreatorPage,
})



function CreatorPage() {
  const navigate = useNavigate();
  const account = useAccount();
  const {
    data, isLoading, isError
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: ABIS.factory,
    functionName: 'getSurveysByOwner',
    args: [account.address],
  });

  const mySurveys: number[] = useMemo(() => {
    return Array.isArray(data) ? data as number[] : [];
  }, [data]);



  return (
    <PageLayout>
      <PageTitle
        title="My Surveys"
        description="Create and manage your surveys."
        titleIcon={<FileTextIcon />}
        actionText='Create New Survey'
        actionIcon={<FilePlus />}
        handleAction={() => {
          // redirect to create new survey page
          navigate({
            to: '/app/creator/new',
            replace: true
          });
        }}
      />
      <Section
        title="My Surveys"
        description="Create and manage your surveys."
      >
        {
          isLoading ? (<p>Loading...</p>) : isError ? (<p>Error loading surveys</p>) : (
            <ul>
              {mySurveys.map((survey) => (
                <li key={survey} className="mb-2">
                  <MySurvey surveyId={survey} />
                </li>
              ))}
            </ul>
          )
        }
      </Section>
    </PageLayout>
  )
}
