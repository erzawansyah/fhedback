export default async function StatisticPage({
    params
}: {
    params: Promise<{ surveyId: string }>
}) {
    const { surveyId } = await params;

    return (
        <main className="max-w-xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-2">Statistik Survey #{surveyId}</h1>
            <p className="mb-6 text-gray-600">Deskripsi singkat survey {surveyId}.</p>
            <div className="bg-gray-100 rounded p-6 text-center">
                <p className="mb-2 font-semibold">Statistik Likert (dummy)</p>
                <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((v) => (
                        <div key={v} className="flex flex-col items-center">
                            <span className="text-lg font-bold">{Math.floor(Math.random() * 20 + 5)}</span>
                            <span className="text-xs text-gray-500">Skor {v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
} 
