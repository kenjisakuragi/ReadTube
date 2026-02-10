import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#1a1a1a] font-serif">
      {/* Header */}
      <header className="py-6 border-b border-gray-300 px-4 md:px-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">ReadTube</h1>
        <nav>
          <Link href="/channels" className="text-sm font-sans font-medium hover:underline">
            CATALOG
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
          The World's Intellect,<br />
          <span className="italic font-light">Deeply Digested.</span>
        </h2>
        <p className="max-w-xl text-lg md:text-xl text-gray-600 font-sans mb-12">
          ReadTube transforms global top-tier YouTube channels into
          comprehensive study guides. Expert analysis, Japanese translation,
          and deep insights delivered to your inbox.
        </p>
        <div className="flex gap-4">
          <Link href="/channels" className="bg-[#1a1a1a] text-white px-8 py-4 text-sm font-sans font-bold tracking-wider hover:bg-gray-800 transition">
            BROWSE CHANNELS
          </Link>
          <Link href="#features" className="border border-[#1a1a1a] px-8 py-4 text-sm font-sans font-bold tracking-wider hover:bg-gray-100 transition">
            READ SAMPLE
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-12 py-20 border-t border-gray-300">
        <div className="p-8 border border-gray-200 bg-white">
          <h3 className="text-xl font-bold mb-4">No Noise, Just Signal.</h3>
          <p className="font-sans text-gray-600">
            We skip the fluff. Our AI experts extract only the core arguments and actionable insights from hour-long videos.
          </p>
        </div>
        <div className="p-8 border border-gray-200 bg-white">
          <h3 className="text-xl font-bold mb-4">Expert Commentary.</h3>
          <p className="font-sans text-gray-600">
            Don't just watch. Learn. We provide historical context, market comparisons, and critical analysis.
          </p>
        </div>
        <div className="p-8 border border-gray-200 bg-white">
          <h3 className="text-xl font-bold mb-4">Japanese Precision.</h3>
          <p className="font-sans text-gray-600">
            Translated and adapted for the Japanese market, ensuring you grasp the nuances of global trends.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-300 text-center font-sans text-xs text-gray-500">
        &copy; 2026 ReadTube. All rights reserved.
      </footer>
    </div>
  );
}
