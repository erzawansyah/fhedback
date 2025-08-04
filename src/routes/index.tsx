import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    return (
        <div className="p-6">
            {/* TODO: Halaman utama. Berisi:
            - Statistik global
            - Notifikasi/Announcement terbaru
            - Get started guide
            - Link ke halaman lain
            */}
            <h1 className="text-2xl font-bold">Home - Coming Soon</h1>
        </div>
    )
}
