import Section from "@/components/Section"

export default async function SurveyPage({
    params,
}: {
    params: Promise<{ address: string }>
}) {
    const { address } = await params
    return <main>
        <Section variant="clean">
            <h1 className="text-2xl font-bold mb-4">Survey Details</h1>
            <p className="mb-4">You are viewing the survey with address: {address}</p>
            {/* Additional survey details can be displayed here */}
        </Section>
    </main>
}
