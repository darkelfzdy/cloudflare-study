'use client';

import { useEffect, useState } from 'react';

interface Quote {
  text: string;
  author?: string | null;
}

export default function QuotePage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      // 方案核心：直接请求 Functions 路由
      const res = await fetch('/api/quote');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '获取名言失败');
      }
      const data = await res.json();
      setQuote(data);
    } catch (err: any) {
      setError(err.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 relative">
      <div className="flex flex-col items-center justify-center px-6 py-10 rounded-lg shadow-lg bg-white/80 dark:bg-gray-800/80 max-w-xl w-full">
        {loading ? (
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">加载中…</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : quote ? (
          <>
            <div className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              {quote.text}
            </div>
            {quote.author && (
              <div className="text-lg text-center text-gray-600 dark:text-gray-300 mt-2">
                —— {quote.author}
              </div>
            )}
          </>
        ) : null}
      </div>
      <button
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg"
        onClick={fetchQuote}
        disabled={loading}
        aria-label="Next Quote"
      >
        Next
      </button>
    </div>
  );
}
