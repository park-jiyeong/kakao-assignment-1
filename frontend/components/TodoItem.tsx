"use client";

import { useState, useTransition } from "react";
import { Todo } from "@/lib/types";
import { updateTodo, deleteTodo } from "@/app/actions";
import { useTodoRefresh } from "./TodoRefreshContext";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const [editWarning, setEditWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const refresh = useTodoRefresh();

  const startEdit = () => {
    setDraftText(todo.text);
    setEditWarning("");
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmed = draftText.trim();
    if (trimmed === "") {
      setEditWarning("수정할 내용을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      await updateTodo(todo.id, { text: trimmed });
      setIsEditing(false);
      refresh();
    });
  };

  const cancelEdit = () => {
    setDraftText(todo.text);
    setEditWarning("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    else if (e.key === "Escape") cancelEdit();
  };

  const handleToggle = () => {
    startTransition(async () => {
      await updateTodo(todo.id, { completed: !todo.completed });
      refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTodo(todo.id);
      refresh();
    });
  };

  if (isEditing) {
    return (
      <li className="flex flex-col gap-1.5 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2.5 py-1.5 border border-purple-200 rounded text-[15px] outline-none focus:border-purple-600"
          />
          <button
            type="button"
            onClick={saveEdit}
            disabled={isPending}
            className="px-2.5 py-1.5 bg-purple-600 text-white rounded text-[13px] font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            저장
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="px-2.5 py-1.5 border border-gray-300 rounded text-[13px] text-gray-600 hover:border-purple-600 hover:text-purple-600 transition"
          >
            취소
          </button>
        </div>
        {editWarning && (
          <p className="text-[12px] text-red-500 pl-1">{editWarning}</p>
        )}
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-1.5 px-3.5 py-3 bg-gray-50 rounded-lg border border-gray-200 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <span
        className={`flex-1 text-[15px] break-all ${
          todo.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {todo.text}
      </span>
      <button
        type="button"
        onClick={startEdit}
        disabled={isPending}
        className="px-2.5 py-1.5 bg-transparent border border-gray-300 rounded text-[13px] text-gray-600 hover:border-purple-600 hover:text-purple-600 transition disabled:opacity-50"
      >
        수정
      </button>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`px-2.5 py-1.5 rounded text-[13px] transition disabled:opacity-50 ${
          todo.completed
            ? "bg-purple-600 text-white border border-purple-600"
            : "bg-transparent border border-gray-300 text-gray-600 hover:border-purple-600 hover:text-purple-600"
        }`}
      >
        {todo.completed ? "완료됨" : "완료"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="px-2.5 py-1.5 bg-transparent border border-gray-300 rounded text-[13px] text-gray-600 hover:border-purple-600 hover:text-purple-600 transition disabled:opacity-50"
      >
        삭제
      </button>
    </li>
  );
}
