import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, getAllDocs } from "@/lib/docs";
import { LogoutButton } from "@/components/logout-button";

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.title} — Muzigal Docs`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) notFound();

  const allDocs = getAllDocs();
  const currentIndex = allDocs.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <span>&larr;</span>
            <span className="font-medium">All Docs</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {prevDoc && (
              <Link
                href={`/docs/${prevDoc.slug}`}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                &larr; {prevDoc.title}
              </Link>
            )}
            {prevDoc && nextDoc && <span className="text-gray-200">|</span>}
            {nextDoc && (
              <Link
                href={`/docs/${nextDoc.slug}`}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                {nextDoc.title} &rarr;
              </Link>
            )}
            <span className="text-gray-200">|</span>
            <LogoutButton className="text-sm text-gray-400 hover:text-gray-700 transition-colors" />
          </div>
        </div>
      </header>

      {/* Doc header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
            Document {currentIndex + 1} of {allDocs.length}
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">{doc.title}</h1>
          <p className="text-gray-500">{doc.description}</p>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span>{doc.readTime} read</span>
            <span>{doc.audience}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </main>

      {/* Prev / Next nav */}
      <div className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between">
          {prevDoc ? (
            <Link
              href={`/docs/${prevDoc.slug}`}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              &larr; {prevDoc.title}
            </Link>
          ) : (
            <span />
          )}
          {nextDoc ? (
            <Link
              href={`/docs/${nextDoc.slug}`}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {nextDoc.title} &rarr;
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Back to all docs &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
          Built by Aldrin Stellus for Muzigal, Bangalore &middot; March 2026
        </div>
      </footer>
    </div>
  );
}
