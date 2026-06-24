import { useState, useEffect, useMemo } from 'react';
import DateNavigator from './components/DateNavigator';
import TodoInput from './components/TodoInput';
import FilterTabs from './components/FilterTabs';
import TodoList from './components/TodoList';
import WeekView from './components/WeekView';
import { formatDateKey, getStartOfWeek, parseDateKey } from './utils/date';

const TODO_STORAGE_KEY = 'todo-app:todos';
const SELECTED_DATE_STORAGE_KEY = 'todo-app:selectedDate';
const WEEK_START_STORAGE_KEY = 'todo-app:weekStart';

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function createTodoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function App() {
  const [todos, setTodos] = useState(() => {
    const loaded = loadFromStorage(TODO_STORAGE_KEY, []);
    return Array.isArray(loaded) ? loaded : [];
  });

  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const loaded = loadFromStorage(SELECTED_DATE_STORAGE_KEY, null);
    return typeof loaded === 'string' ? loaded : formatDateKey(new Date());
  });

  const [weekStartKey, setWeekStartKey] = useState(() => {
    const loaded = loadFromStorage(WEEK_START_STORAGE_KEY, null);
    return typeof loaded === 'string'
      ? loaded
      : formatDateKey(getStartOfWeek(new Date()));
  });

  const [currentFilter, setCurrentFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(
      SELECTED_DATE_STORAGE_KEY,
      JSON.stringify(selectedDateKey),
    );
  }, [selectedDateKey]);

  useEffect(() => {
    localStorage.setItem(WEEK_START_STORAGE_KEY, JSON.stringify(weekStartKey));
  }, [weekStartKey]);

  const addTodo = (text) => {
    setTodos((prev) => [
      ...prev,
      {
        id: createTodoId(),
        text,
        completed: false,
        date: selectedDateKey,
      },
    ]);
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id, newText) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  };

  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    setWeekStartKey(formatDateKey(getStartOfWeek(parseDateKey(dateKey))));
  };

  const visibleTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (todo.date !== selectedDateKey) return false;
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });
  }, [todos, selectedDateKey, currentFilter]);

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit">
        <h1 className="text-3xl font-bold text-purple-600 mb-5 text-center">
          Todo
        </h1>

        <WeekView
          weekStartKey={weekStartKey}
          selectedDateKey={selectedDateKey}
          todos={todos}
          onSelectDate={handleSelectDate}
          onChangeWeek={setWeekStartKey}
        />

        <DateNavigator
          selectedDateKey={selectedDateKey}
          onChangeDate={handleSelectDate}
        />

        <TodoInput onAdd={addTodo} />

        <FilterTabs
          currentFilter={currentFilter}
          onChangeFilter={setCurrentFilter}
        />

        <TodoList
          todos={visibleTodos}
          currentFilter={currentFilter}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />
      </div>
    </main>
  );
}

export default App;
