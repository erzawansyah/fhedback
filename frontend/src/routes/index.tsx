import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { ArrowRight, ChevronDown, Shield, Lock, BarChart3, Users, FileCheck, Eye } from 'lucide-react'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    return (
        <main className="min-h-[92vh] flex flex-col">
            {/* Hero Section */}
            <section className='flex flex-col justify-center items-center py-48 bg-main'>
                <h1 className="font-black text-5xl p-4 bg-secondary-background border-4 border-border mx-auto text-center transform -rotate-2 w-fit">
                    Create Fully Confidential Onchain Surveys
                </h1>
                <p className="text-xl font-heading mt-12 mx-auto text-center w-3/4">
                    Build surveys where every response stays encrypted end-to-end. No identities, no tracking, no data exposure — not even the survey owner can access individual answers.
                </p>
                <div className="w-fit mx-auto mt-12 flex flex-col gap-2">
                    <Button variant={"neutral"} size={"lg"} className="font-heading text-lg transform transition-transform hover:-translate-y-1.5 hover:-rotate-2">
                        <Link to="/survey/create" className="inline-flex items-center gap-2">
                            Launch a Confidential Survey
                            <ArrowRight size={36} />
                        </Link>
                    </Button>
                    <Button asChild variant={"noShadow"} size={"lg"} className="font-heading text-lg border-none transform transition-transform hover:translate-y-1.5 hover:rotate-2">
                        <Link to="/surveys/explore" className="flex items-center gap-2">
                            Answer Anonymously
                            <ChevronDown size={36} />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Problems Section */}
            <section className='py-20 px-8 bg-secondary-background'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-4xl font-black mb-4 text-center'>
                        <span className='bg-main border-4 border-border px-6 py-2 inline-block transform rotate-1'>
                            ❌ Traditional Survey Problems
                        </span>
                    </h2>
                    <div className='grid md:grid-cols-2 gap-6 mt-12'>
                        <div className='bg-main border-4 border-border p-6 transform -rotate-1 hover:rotate-0 transition-transform'>
                            <div className='flex items-start gap-4'>
                                <Eye className='w-8 h-8 shrink-0 mt-1' />
                                <div>
                                    <h3 className='font-bold text-xl mb-2'>Unrestricted Access</h3>
                                    <p className='font-heading'>Individual responses can be accessed by survey creators or third parties</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform rotate-1 hover:rotate-0 transition-transform'>
                            <div className='flex items-start gap-4'>
                                <Shield className='w-8 h-8 shrink-0 mt-1' />
                                <div>
                                    <h3 className='font-bold text-xl mb-2'>Data Breach Risks</h3>
                                    <p className='font-heading'>Data stored in plain text or with simple encryption</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform rotate-1 hover:rotate-0 transition-transform'>
                            <div className='flex items-start gap-4'>
                                <Users className='w-8 h-8 shrink-0 mt-1' />
                                <div>
                                    <h3 className='font-bold text-xl mb-2'>Imperfect Anonymization</h3>
                                    <p className='font-heading'>Individual data can still be linked back to respondents</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform -rotate-1 hover:rotate-0 transition-transform'>
                            <div className='flex items-start gap-4'>
                                <FileCheck className='w-8 h-8 shrink-0 mt-1' />
                                <div>
                                    <h3 className='font-bold text-xl mb-2'>Centralized Trust</h3>
                                    <p className='font-heading'>Reliance on administrators to maintain privacy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FHE Solution Section */}
            <section className='py-20 px-8 bg-main'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-4xl font-black mb-8 text-center'>
                        <span className='bg-secondary-background border-4 border-border px-6 py-2 inline-block transform -rotate-1'>
                            ✅ The FHEdback Solution
                        </span>
                    </h2>
                    <div className='bg-secondary-background border-4 border-border p-8 transform rotate-1 max-w-4xl mx-auto'>
                        <h3 className='font-bold text-2xl mb-6 text-center'>Fully Homomorphic Encryption (FHE)</h3>
                        <div className='space-y-4 font-heading text-lg'>
                            <div className='flex items-start gap-3'>
                                <Lock className='w-6 h-6 shrink-0 mt-1' />
                                <p>Responses are <strong>encrypted on the client-side</strong> before sending</p>
                            </div>
                            <div className='flex items-start gap-3'>
                                <Shield className='w-6 h-6 shrink-0 mt-1' />
                                <p>Data <strong>remains encrypted</strong> at all times on the blockchain</p>
                            </div>
                            <div className='flex items-start gap-3'>
                                <BarChart3 className='w-6 h-6 shrink-0 mt-1' />
                                <p>Mathematical operations are performed <strong>directly on encrypted data</strong></p>
                            </div>
                            <div className='flex items-start gap-3'>
                                <FileCheck className='w-6 h-6 shrink-0 mt-1' />
                                <p>Aggregate results can be <strong>decrypted without accessing individual data</strong></p>
                            </div>
                        </div>
                        <div className='mt-8 p-4 bg-main border-2 border-border text-center'>
                            <p className='font-bold text-xl'>Result:</p>
                            <p className='font-heading text-lg mt-2'>Survey creators get accurate statistical insights without ever being able to view individual respondent answers.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section className='py-20 px-8 bg-secondary-background'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-4xl font-black mb-12 text-center'>
                        <span className='bg-main border-4 border-border px-6 py-2 inline-block transform rotate-1'>
                            🎯 FHEdback Advantages
                        </span>
                    </h2>
                    <div className='grid md:grid-cols-3 gap-6'>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>🔒</div>
                            <h3 className='font-bold text-xl mb-3'>Absolute Privacy</h3>
                            <p className='font-heading'>Individual answers can never be accessed in plain text</p>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>🛡️</div>
                            <h3 className='font-bold text-xl mb-3'>High Security</h3>
                            <p className='font-heading'>Data is always end-to-end encrypted, reducing data breach risks</p>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>📊</div>
                            <h3 className='font-bold text-xl mb-3'>Statistical Analysis</h3>
                            <p className='font-heading'>Supports various operations on encrypted data (sum, average, min, max, frequency)</p>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>🌐</div>
                            <h3 className='font-bold text-xl mb-3'>Decentralization</h3>
                            <p className='font-heading'>Data stored on-chain, no single point of failure</p>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>🔍</div>
                            <h3 className='font-bold text-xl mb-3'>Transparency</h3>
                            <p className='font-heading'>Open source smart contracts enable independent audits</p>
                        </div>
                        <div className='bg-main border-4 border-border p-6 transform hover:-translate-y-2 transition-transform'>
                            <div className='text-4xl mb-4'>⚡</div>
                            <h3 className='font-bold text-xl mb-3'>Zero-Knowledge Proofs</h3>
                            <p className='font-heading'>Response validation without revealing actual values</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className='py-20 px-8 bg-main'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-4xl font-black mb-12 text-center'>
                        <span className='bg-secondary-background border-4 border-border px-6 py-2 inline-block transform -rotate-1'>
                            🔄 How It Works
                        </span>
                    </h2>
                    <div className='space-y-6 max-w-4xl mx-auto'>
                        {[
                            { step: '1. CREATE', desc: 'Survey creator defines questions and metadata. Survey contract deployed to blockchain.' },
                            { step: '2. PUBLISH', desc: 'Survey published and accessible to respondents. FHE statistics initialized.' },
                            { step: '3. RESPOND', desc: 'Respondents fill out survey. Answers encrypted with FHE on client-side.' },
                            { step: '4. STORE', desc: 'Encrypted answers stored on-chain. Statistics updated homomorphically.' },
                            { step: '5. CLOSE', desc: 'Survey closed after reaching target respondents or manually by creator.' },
                            { step: '6. ANALYZE', desc: 'Creator accesses aggregate statistics. Decryption only for aggregates, not individuals.' }
                        ].map((item, idx) => (
                            <div key={idx} className='bg-secondary-background border-4 border-border p-6 transform hover:translate-x-2 transition-transform'>
                                <h3 className='font-bold text-xl mb-2'>{item.step}</h3>
                                <p className='font-heading text-lg'>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who Needs Section */}
            <section className='py-20 px-8 bg-secondary-background'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-4xl font-black mb-4 text-center'>
                        <span className='bg-main border-4 border-border px-6 py-2 inline-block transform rotate-1'>
                            👥 Who Needs FHEdback?
                        </span>
                    </h2>
                    <p className='text-center font-heading text-xl italic mt-8 mb-12'>
                        "Anyone who cares about their data privacy can leverage FHEdback to gather insights without compromising privacy."
                    </p>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {[
                            { emoji: '🔬', title: 'Research Organizations', desc: 'Sensitive surveys with guaranteed respondent privacy' },
                            { emoji: '🏢', title: 'Corporations', desc: 'Employee feedback without risk of individual identification' },
                            { emoji: '🎓', title: 'Educational Institutions', desc: 'Safe and private learning evaluations' },
                            { emoji: '🏥', title: 'Healthcare', desc: 'Health surveys with HIPAA/GDPR compliance' },
                            { emoji: '🏛️', title: 'Government', desc: 'Public polling with guaranteed privacy' }
                        ].map((item, idx) => (
                            <div key={idx} className='bg-main border-4 border-border p-6 transform hover:scale-105 transition-transform'>
                                <div className='text-5xl mb-4'>{item.emoji}</div>
                                <h3 className='font-bold text-xl mb-2'>{item.title}</h3>
                                <p className='font-heading'>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Demo Section */}
            <section className='py-20 px-8 bg-main'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h2 className='text-4xl font-black mb-8'>
                        <span className='bg-secondary-background border-4 border-border px-6 py-2 inline-block transform -rotate-1'>
                            🌐 Live on Sepolia Testnet
                        </span>
                    </h2>
                    <div className='bg-secondary-background border-4 border-border p-8 transform rotate-1'>
                        <h3 className='font-bold text-2xl mb-4'>Factory Contract</h3>
                        <p className='font-mono text-sm bg-main border-2 border-border p-3 break-all mb-6'>
                            0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
                        </p>
                        <a
                            href="https://eth-sepolia.blockscout.com/address/0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15"
                            target="_blank"
                            rel="noopener noreferrer"
                            className='inline-block'
                        >
                            <Button variant="neutral" className='font-heading text-lg'>
                                View on Blockscout →
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 px-8 bg-secondary-background'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h2 className='text-4xl font-black mb-8'>Ready to Create Your Confidential Survey?</h2>
                    <div className="w-fit mx-auto flex flex-col gap-4">
                        <Button variant={"neutral"} size={"lg"} className="font-heading text-xl transform transition-transform hover:-translate-y-1.5 hover:-rotate-2">
                            <Link to="/survey/create" className="inline-flex items-center gap-2">
                                Get Started Now
                                <ArrowRight size={36} />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}
