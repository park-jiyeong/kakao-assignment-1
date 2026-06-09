import {
  parseDateKey,
  formatDateKey,
  formatDateForDisplay,
  addDays,
} from '../utils/date';

function DateNavigator({ selectedDateKey, onChangeDate }) {
  const date = parseDateKey(selectedDateKey);
  const todayKey = formatDateKey(new Date());
  const isToday = selectedDateKey === todayKey;

  const goPrev = () => onChangeDate(formatDateKey(addDays(date, -1)));
  const goNext = () => onChangeDate(formatDateKey(addDays(date, 1)));

  return (
    <div className="flex items-center justify-between gap-2 mb-5 px-3 py-2.5 bg-purple-50 rounded-lg">
      <button
        type="button"
        onClick={goPrev}
        aria-label="이전 날짜"
        className="w-8 h-8 bg-white border border-purple-100 rounded-lg text-purple-600 text-lg font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
      >
        ‹
      </button>
      <span className="flex-1 text-center text-[15px] font-semibold text-gray-700">
        {formatDateForDisplay(date)}
        {isToday && (
          <span className="ml-1.5 px-2 py-0.5 bg-purple-600 text-white text-[11px] font-semibold rounded-full align-middle">
            오늘
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={goNext}
        aria-label="다음 날짜"
        className="w-8 h-8 bg-white border border-purple-100 rounded-lg text-purple-600 text-lg font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
      >
        ›
      </button>
    </div>
  );
}

export default DateNavigator;
