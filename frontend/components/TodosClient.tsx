"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import WeekView from "./WeekView";
import DateNavigator from "./DateNavigator";
import TodoList from "./TodoList";
import { TodoRefreshContext } from "./TodoRefreshContext";
import { formatDateKey, getStartOfWeek, parseDateKey } from "@/lib/date";
import { Todo, FilterType } from "@/lib/types";
import { createTodo } from "@/app/actions";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

export default function TodosClient() {
  const todayKey = formatDateKey(new Date());

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [weekStartKey, setWeekStartKey] = useState(
    formatDateKey(getStartOfWeek(new Date()))
  );
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [warning, setWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchTodos = useCallback(
    async (date: string, filter: FilterType) => {
      setIsLoading(true);
      try {
        const url = new URL(`${API_URL}/todos`);
        url.searchParams.set("date", date);
        if (filter !== "all") url.searchParams.set("filter", filter);
        const res = await fetch(url.toString());
        const data: Todo[] = await res.json();
        setTodos(data);
      } catch {
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    },
    [API_URL]
  );

  const fetchAllTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      const data: Todo[] = await res.json();
      setAllTodos(data);
    } catch {
      setAllTodos([]);
    }
  }, [API_URL]);

  const refresh = useCallback(() => {
    fetchTodos(selectedDateKey, currentFilter);
    fetchAllTodos();
  }, [fetchTodos, fetchAllTodos, selectedDateKey, currentFilter]);

  useEffect(() => {
    fetchTodos(selectedDateKey, currentFilter);
    fetchAllTodos();
  }, [selectedDateKey, currentFilter]);

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setWeekStartKey(formatDateKey(getStartOfWeek(parseDateKey(dateKey))));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setWarning("할 일을 입력해주세요.");
      return;
    }
    setWarning("");
    startTransition(async () => {
      await createTodo(trimmed, selectedDateKey);
      setInputText("");
      await fetchTodos(selectedDateKey, currentFilter);
      await fetchAllTodos();
    });
  };

  return (
    <TodoRefreshContext.Provider value={refresh}>
      <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit">
          <h1 className="text-3xl font-bold text-purple-600 mb-5 text-center">
            Todo
          </h1>

          <WeekView
            weekStartKey={weekStartKey}
            selectedDateKey={selectedDateKey}
            todos={allTodos}
            onSelectDate={handleSelectDate}
            onChangeWeek={setWeekStartKey}
          />

          <DateNavigator
            selectedDateKey={selectedDateKey}
            onChangeDate={handleSelectDate}
          />

          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="할 일을 입력하세요"
              autoComplete="off"
              className="flex-1 px-3.5 py-3 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-purple-600 transition"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-5 bg-purple-600 text-white rounded-lg text-[15px] font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              추가
            </button>
          </form>
          <p className="min-h-5 text-[13px] text-red-500 mb-2 pl-1">
            {warning}
          </p>

          <div className="flex gap-1 mb-4 p-1 bg-purple-50 rounded-lg">
            {FILTERS.map((f) => {
              const isActive = currentFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setCurrentFilter(f.key)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-600 text-white shadow"
                      : "bg-transparent text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-gray-400 py-6">
              불러오는 중...
            </p>
          ) : (
            <TodoList todos={todos} filter={currentFilter} />
          )}
        </div>
      </main>
    </TodoRefreshContext.Provider>
  );
}
