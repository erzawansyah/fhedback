import { TestWatchEvent } from "./TestWatchEvent";

export default function Home() {
    return (
        <main className="p-24">
            <div className="mx-auto w-full min-h-128 bg-main">
                <TestWatchEvent />
            </div>
        </main>
    );
}
