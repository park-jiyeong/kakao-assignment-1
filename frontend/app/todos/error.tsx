"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit text-center">
        <h1 className="text-3xl font-bold text-purple-600 mb-5">Todo</h1>
        <div className="py-8">
          <p className="text-red-500 font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-gray-500 text-sm mb-6">{error.message}</p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    </main>
  );
}
