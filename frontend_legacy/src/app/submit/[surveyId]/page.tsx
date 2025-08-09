export default async function SubmitResponsePage({ params }: { params: Promise<{ surveyId: string }> }) {
    const { surveyId } = await params;
    return (
        <main className="max-w-xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-2">Isi Survey #{surveyId}</h1>
            <p className="mb-6 text-gray-600">Deskripsi singkat survey {surveyId}.</p>
            <form className="space-y-8">
                {[1, 2, 3].map((q) => (
                    <div key={q}>
                        <p className="mb-2 font-medium">Pertanyaan Likert {q}</p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((v) => (
                                <label key={v} className="flex flex-col items-center">
                                    <input type="radio" name={`q${q}`} value={v} className="mb-1" />
                                    <span className="text-xs">{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Kirim Jawaban</button>
            </form>
        </main>
    );
} 
