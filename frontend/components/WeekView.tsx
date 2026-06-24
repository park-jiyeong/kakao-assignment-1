"use client";

import {
  formatDateKey,
  parseDateKey,
  addDays,
  getStartOfWeek,
  getWeekdayKr,
} from "@/lib/date";
import { Todo } from "@/lib/types";

interface WeekViewProps {
  weekStartKey: string;
  selectedDateKey: string;
  todos: Todo[];
  onSelectDate: (dateKey: string) => void;
  onChangeWeek: (dateKey: string) => void;
}

export default function WeekView({
  weekStartKey,
  selectedDateKey,
  todos,
  onSelectDate,
  onChangeWeek,
}: WeekViewProps) {
  const weekStart = parseDateKey(weekStartKey);
  const todayKey = formatDateKey(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return { date, key: formatDateKey(date) };
  });

  const countByDateKey = todos.reduce<Record<string, number>>((acc, todo) => {
    acc[todo.date] = (acc[todo.date] || 0) + 1;
    return acc;
  }, {});

  const goPrevWeek = () =>
    onChangeWeek(formatDateKey(addDays(weekStart, -7)));
  const goNextWeek = () =>
    onChangeWeek(formatDateKey(addDays(weekStart, 7)));
  const goCurrentWeek = () =>
    onChangeWeek(formatDateKey(getStartOfWeek(new Date())));

  const weekEndKey = formatDateKey(addDays(weekStart, 6));

  return (
    <div className="mb-5 p-3 bg-white border border-purple-100 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrevWeek}
          aria-label="이전 주"
          className="w-7 h-7 bg-white border border-purple-100 rounded text-purple-600 text-sm font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goCurrentWeek}
          title="이번 주로 이동"
          className="text-[13px] text-gray-700 font-medium hover:text-purple-600 transition"
        >
          {weekStartKey} ~ {weekEndKey}
        </button>
        <button
          type="button"
          onClick={goNextWeek}
          aria-label="다음 주"
          className="w-7 h-7 bg-white border border-purple-100 rounded text-purple-600 text-sm font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, key }) => {
          const isSelected = key === selectedDateKey;
          const isToday = key === todayKey;
          const count = countByDateKey[key] || 0;

          let buttonClass = "bg-transparent text-gray-700 hover:bg-purple-50";
          if (isSelected) {
            buttonClass = "bg-purple-600 text-white";
          } else if (isToday) {
            buttonClass =
              "bg-purple-50 text-purple-700 border border-purple-200";
          }

          let countClass = "text-purple-600";
          if (count === 0) countClass = "opacity-0";
          else if (isSelected) countClass = "text-white";

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded text-center transition ${buttonClass}`}
            >
              <span className="text-[11px] font-medium">
                {getWeekdayKr(date)}
              </span>
              <span className="text-sm font-semibold">{date.getDate()}</span>
              <span className={`text-[10px] mt-0.5 ${countClass}`}>
                {count}개
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
