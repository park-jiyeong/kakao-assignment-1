"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateKey } from "@/lib/date";
import { createTodo } from "@/app/actions";
import Link from "next/link";

export default function NewTodoPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [warning, setWarning] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setWarning("할 일을 입력해주세요.");
      return;
    }
    setWarning("");
    startTransition(async () => {
      await createTodo(trimmed, date);
      router.push("/todos");
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/todos"
            className="text-purple-600 hover:text-purple-800 transition text-xl"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold text-purple-600">새 할 일 추가</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-purple-600 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할 일
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="할 일을 입력하세요"
              autoComplete="off"
              autoFocus
              className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-purple-600 transition"
            />
            {warning && (
              <p className="text-[13px] text-red-500 mt-1 pl-1">{warning}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-purple-600 text-white rounded-lg text-[15px] font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isPending ? "추가 중..." : "추가"}
          </button>
        </form>
      </div>
    </main>
  );
}
