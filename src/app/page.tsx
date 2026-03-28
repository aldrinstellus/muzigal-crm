import Link from "next/link";
import { getAllDocs } from "@/lib/docs";

const AUDIENCE_COLORS: Record<string, string> = {
  "Owners / Decision Makers": "bg-blue-50 text-blue-700 border-blue-200",
  Everyone: "bg-green-50 text-green-700 border-green-200",
  "Staff / Operations": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Home() {
  const docs = getAllDocs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-sm font-medium tracking-wider text-gray-400 uppercase mb-3">
            Documentation
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Muzigal
          </h1>
          <p className="text-lg text-gray-300 font-light">
            CRM + WhatsApp Notification Platform
          </p>
          <div className="flex gap-6 mt-8 text-sm text-gray-400">
            <span>
              <strong className="text-white">5</strong> Documents
            </span>
            <span>
              <strong className="text-white">6,729</strong> Lines of Code
            </span>
            <span>
              <strong className="text-white">109</strong> Tests
            </span>
            <span>
              <strong className="text-white">Rs. 0</strong> Infrastructure
            </span>
          </div>
        </div>
      </header>

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-wrap gap-4 text-sm">
          <a
            href="https://zoo-crm.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Live CRM &rarr;
          </a>
          <a
            href="https://zoo-crm.pages.dev/enroll"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Enrollment Form &rarr;
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            Demo login: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">demo@zoo.crm</code> / <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">demo</code>
          </span>
        </div>
      </div>

      {/* Doc List */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-6">
          Recommended Reading Order
        </h2>

        <div className="space-y-4">
          {docs.map((doc, i) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-5 group"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        AUDIENCE_COLORS[doc.audience] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {doc.audience}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {doc.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{doc.readTime} read</p>
                </div>
                <span className="flex-shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors text-lg">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          Built by Aldrin Stellus for Muzigal, Bangalore &middot; March 2026
        </div>
      </footer>
    </div>
  );
}
