"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTodo } from "@/app/actions";
import { Todo } from "@/lib/types";
import Link from "next/link";

export default function EditTodoPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [text, setText] = useState("");
  const [warning, setWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then(async ({ todoId }) => {
      try {
        const res = await fetch(
          `/api/todos?date=&filter=`
        );
        // 전체 목록에서 찾기
        const allRes = await fetch(`/api/todos`);
        const allTodos: Todo[] = await allRes.json();
        const found = allTodos.find((t) => t.id === Number(todoId));
        if (found) {
          setTodo(found);
          setText(found.text);
        }
      } finally {
        setIsLoading(false);
      }
    });
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setWarning("수정할 내용을 입력해주세요.");
      return;
    }
    setWarning("");
    startTransition(async () => {
      if (!todo) return;
      await updateTodo(todo.id, { text: trimmed });
      router.push("/todos");
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit">
          <p className="text-center text-gray-400">불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (!todo) {
    return (
      <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit text-center">
          <p className="text-red-500 mb-4">Todo를 찾을 수 없습니다.</p>
          <Link href="/todos" className="text-purple-600 hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

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
          <h1 className="text-2xl font-bold text-purple-600">할 일 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할 일
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
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
            {isPending ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </main>
  );
}
