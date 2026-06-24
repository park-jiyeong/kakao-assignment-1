const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'completed', label: '완료' },
];

function FilterTabs({ currentFilter, onChangeFilter }) {
  return (
    <div className="flex gap-1 mb-4 p-1 bg-purple-50 rounded-lg">
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChangeFilter(filter.key)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              isActive
                ? 'bg-purple-600 text-white shadow'
                : 'bg-transparent text-gray-500 hover:text-purple-600'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
