"use server";

import { revalidatePath } from "next/cache";
import { Todo } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function getTodos(params?: {
  date?: string;
  filter?: string;
  search?: string;
}): Promise<Todo[]> {
  const url = new URL(`${BACKEND_URL}/todos`);
  if (params?.date) url.searchParams.set("date", params.date);
  if (params?.filter && params.filter !== "all")
    url.searchParams.set("filter", params.filter);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Todo 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function getTodo(id: number): Promise<Todo> {
  const res = await fetch(`${BACKEND_URL}/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Todo를 불러오지 못했습니다.");
  const todos: Todo[] = await res.json();
  const todo = todos.find((t) => t.id === id);
  if (!todo) throw new Error("Todo를 찾을 수 없습니다.");
  return todo;
}

export async function createTodo(
  text: string,
  date: string
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date, completed: false }),
  });
  if (!res.ok) throw new Error("Todo 생성에 실패했습니다.");
  revalidatePath("/todos");
}

export async function updateTodo(
  id: number,
  data: { text?: string; completed?: boolean; date?: string }
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Todo 수정에 실패했습니다.");
  revalidatePath("/todos");
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Todo 삭제에 실패했습니다.");
  revalidatePath("/todos");
}
