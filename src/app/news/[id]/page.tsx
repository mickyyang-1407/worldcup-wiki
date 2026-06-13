import Link from "next/link";
import newsData from "@/data/news.json";

export function generateStaticParams() {
  return (newsData as any[]).map((item: any) => ({ id: item.id }));
}

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = (newsData as any[]).find((item: any) => item.id === id);

  if (!article) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此文章</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-700">← 返回首頁</Link>
      </div>
    );
  }

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const categoryLabels: Record<string, string> = {
    "match-report": "賽事報導",
    "feature": "專題報導",
    "team-news": "球隊動態",
    "venue": "場館介紹",
  };

  const categoryColors: Record<string, string> = {
    "match-report": "bg-red-100 text-red-700",
    "feature": "bg-purple-100 text-purple-700",
    "team-news": "bg-blue-100 text-blue-700",
    "venue": "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1">
        ← 返回首頁
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[article.category] || "bg-gray-100 text-gray-600"}`}>
              {categoryLabels[article.category] || article.category}
            </span>
            <span className="text-xs text-gray-400">{article.source}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
        </header>

        <div className="prose prose-gray max-w-none">
          {article.content.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-5 text-base md:text-lg">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← 返回首頁
          </Link>
        </div>
      </article>
    </div>
  );
}
