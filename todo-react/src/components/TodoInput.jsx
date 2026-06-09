import { useState } from 'react';

function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  const [warning, setWarning] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed === '') {
      setWarning('할 일을 입력해주세요.');
      return;
    }
    onAdd(trimmed);
    setText('');
    setWarning('');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일을 입력하세요"
          autoComplete="off"
          className="flex-1 px-3.5 py-3 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-purple-600 transition"
        />
        <button
          type="submit"
          className="px-5 bg-purple-600 text-white rounded-lg text-[15px] font-semibold hover:bg-purple-700 transition"
        >
          추가
        </button>
      </form>
      <p className="min-h-5 text-[13px] text-red-500 mb-2 pl-1">{warning}</p>
    </>
  );
}

export default TodoInput;
