import TodoItem from './TodoItem';

function getEmptyMessage(filter) {
  if (filter === 'active') return '진행 중인 할 일이 없습니다.';
  if (filter === 'completed') return '완료된 할 일이 없습니다.';
  return '이 날짜에는 할 일이 없습니다. 새로운 Todo를 추가해보세요!';
}

function TodoList({ todos, currentFilter, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return (
      <ul className="list-none">
        <li className="text-center text-sm text-gray-400 py-6">
          {getEmptyMessage(currentFilter)}
        </li>
      </ul>
    );
  }

  return (
    <ul className="list-none flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

export default TodoList;
