// Shown on every page: the demo targets FHEVM v0.9 / relayer-sdk 0.3.0-5 on Sepolia,
// and Zama's testnet relayer has since changed, so encryption/decryption no longer work live.
export default function ArchiveBanner() {
  return (
    <div
      role="status"
      className="w-full border-b-2 border-black bg-black px-4 py-2 text-center text-sm font-bold text-yellow-300"
    >
      Archived demo: FHEdback was built for FHEVM v0.9 (Zama Developer Program, Oct 2025). Zama&apos;s
      Sepolia relayer has since changed, so creating and answering surveys no longer works here.{" "}
      <a
        href="https://github.com/erzawansyah/fhedback#-project-status"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2"
      >
        Read more
      </a>
    </div>
  )
}
