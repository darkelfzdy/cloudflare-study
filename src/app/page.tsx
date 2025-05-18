// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Quote {
  text: string;
  author?: string | null;
}

export default function HomePage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bgImageUrl, setBgImageUrl] = useState<string>('');
  const [loadingBg, setLoadingBg] = useState<boolean>(true);

  const fetchQuote = async () => {
    setLoadingQuote(true);
    setError(null);
    try {
      const res = await fetch('/api/quote');

      if (!res.ok) {
         let errorMessage = 'Failed to fetch quote';
         try {
             const errorData = await res.json();
             errorMessage = errorData.error || errorMessage;
         } catch (parseError) {
             errorMessage = `${res.status} ${res.statusText}`;
         }
         throw new Error(errorMessage);
      }

      const data: Quote = await res.json();
      setQuote(data);
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      setError(err.message || 'Failed to load quote.');
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchRandomBackground = async () => {
    setLoadingBg(true);
    try {
      // --- 修改这里：在 URL 后添加一个时间戳参数 ---
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/background?timestamp=${timestamp}`); // 添加时间戳作为查询参数

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch background: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const imageBlob = await res.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      if (bgImageUrl) {
        URL.revokeObjectURL(bgImageUrl);
      }

      setBgImageUrl(imageUrl);

    } catch (err: any) {
      console.error('Error fetching background:', err);
      setBgImageUrl('');
    } finally {
      setLoadingBg(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchRandomBackground();

    return () => {
      if (bgImageUrl) {
        URL.revokeObjectURL(bgImageUrl);
      }
    };
  }, []); // 依赖数组为空，只在挂载时运行一次

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
        backgroundColor: bgImageUrl ? 'transparent' : 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 rounded-lg shadow-lg bg-white/80 dark:bg-gray-800/80 max-w-xl w-full">
        {loadingQuote ? (
          <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">加载中…</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : quote ? (
          <>
            <div className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              "{quote.text}"
            </div>
            {quote.author && (
              <div className="text-lg text-center text-gray-600 dark:text-gray-300 mt-2">
                —— {quote.author}
              </div>
            )}
          </>
        ) : null}
      </div>

      <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end space-y-4">
         <button
            onClick={fetchRandomBackground}
            disabled={loadingBg}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Switch Background"
         >
           {loadingBg ? '切换中...' : '切换背景'}
         </button>

         <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={fetchQuote}
            disabled={loadingQuote}
            aria-label="Next Quote"
         >
           {loadingQuote ? '加载中...' : '下一句'}
         </button>
      </div>
    </div>
  );
}