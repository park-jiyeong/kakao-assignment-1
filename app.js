// =============================================
// Todo 앱 - 상태 관리 및 DOM 조작
// =============================================

// 로컬스토리지에 Todo 목록을 저장할 때 사용할 key
const TODO_STORAGE_KEY = 'todo-app:todoList';

// Todo 상태를 저장하는 배열.
// 각 항목은 { id, text, completed, date } 형태이며 date는 'YYYY-MM-DD' 문자열.
let todoList = [];

// 각 Todo에 부여할 고유 ID 생성용 카운터.
// 로컬스토리지에서 불러올 때 기존 id들과 충돌하지 않도록 max(id) + 1로 재계산한다.
let nextTodoId = 1;

// 현재 선택된 필터 상태. 'all' | 'active' | 'completed'
let currentFilter = 'all';

// 현재 선택된 날짜 (일간 뷰의 기준 날짜).
// 시간 부분을 제거하여 날짜 단위로만 비교한다.
let currentSelectedDate = createDateWithoutTime(new Date());

// ---------- DOM 요소 참조 ----------
const todoInputForm = document.getElementById('todoInputForm');
const todoInputElement = document.getElementById('todoInput');
const todoListElement = document.getElementById('todoList');
const inputWarningElement = document.getElementById('inputWarning');
const filterTabsElement = document.getElementById('filterTabs');
const currentDateDisplayElement = document.getElementById('currentDateDisplay');
const prevDateButton = document.getElementById('prevDateButton');
const nextDateButton = document.getElementById('nextDateButton');

// ---------- 이벤트 등록 ----------
// 폼 제출 시 새로운 Todo 추가 (Enter 키와 추가 버튼 모두 처리됨)
todoInputForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

// 필터 탭 영역에 이벤트 위임 방식으로 클릭 핸들러를 등록한다.
filterTabsElement.addEventListener('click', (event) => {
  const clickedTab = event.target.closest('.filter-tab');
  if (!clickedTab) return;

  const nextFilter = clickedTab.dataset.filter;
  changeFilter(nextFilter);
});

// 날짜 이동 버튼
prevDateButton.addEventListener('click', () => moveSelectedDate(-1));
nextDateButton.addEventListener('click', () => moveSelectedDate(1));

// =============================================
// 로컬스토리지 연동
// =============================================

/**
 * 현재 todoList 상태를 JSON 문자열로 변환해 로컬스토리지에 저장한다.
 * 추가/수정/삭제/완료 토글 등 상태가 바뀔 때마다 호출한다.
 */
function saveTodoListToStorage() {
  const serialized = JSON.stringify(todoList);
  localStorage.setItem(TODO_STORAGE_KEY, serialized);
}

/**
 * 로컬스토리지에서 Todo 목록을 읽어와 메모리 상태(todoList, nextTodoId)를 복원한다.
 * 저장된 데이터가 없거나 파싱에 실패하면 빈 목록으로 초기화한다.
 */
function loadTodoListFromStorage() {
  const serialized = localStorage.getItem(TODO_STORAGE_KEY);

  if (serialized === null) {
    todoList = [];
    nextTodoId = 1;
    return;
  }

  try {
    const parsed = JSON.parse(serialized);

    if (!Array.isArray(parsed)) {
      todoList = [];
      nextTodoId = 1;
      return;
    }

    todoList = parsed;

    // 기존 id들과 충돌하지 않도록 다음 id를 max(id) + 1로 설정
    const maxExistingId = todoList.reduce(
      (maxId, todo) => (todo.id > maxId ? todo.id : maxId),
      0,
    );
    nextTodoId = maxExistingId + 1;
  } catch (error) {
    console.error('로컬스토리지에서 Todo 데이터를 불러오지 못했습니다.', error);
    todoList = [];
    nextTodoId = 1;
  }
}

// =============================================
// 유틸리티 함수
// =============================================

/**
 * 전달된 Date 객체의 시간을 0으로 초기화한 새 Date를 반환한다.
 * 날짜 단위 비교를 단순화하기 위함.
 */
function createDateWithoutTime(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Date 객체를 'YYYY-MM-DD' 형태의 문자열로 변환한다.
 */
function formatDateAsKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 화면에 표시할 한국어 날짜 문자열을 만든다. (예: '2026년 5월 31일 (일)')
 */
function formatDateForDisplay(date) {
  const weekdayKr = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdayKr[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// =============================================
// 날짜 네비게이션
// =============================================

function moveSelectedDate(dayDelta) {
  const nextDate = new Date(currentSelectedDate);
  nextDate.setDate(nextDate.getDate() + dayDelta);
  currentSelectedDate = createDateWithoutTime(nextDate);
  renderDateDisplay();
  renderTodoList();
}

function renderDateDisplay() {
  const dateText = formatDateForDisplay(currentSelectedDate);
  const today = createDateWithoutTime(new Date());
  const isToday = formatDateAsKey(currentSelectedDate) === formatDateAsKey(today);

  currentDateDisplayElement.innerHTML = '';
  currentDateDisplayElement.append(dateText);

  if (isToday) {
    const todayBadge = document.createElement('span');
    todayBadge.className = 'today-badge';
    todayBadge.textContent = '오늘';
    currentDateDisplayElement.appendChild(todayBadge);
  }
}

// =============================================
// Todo CRUD (각 변경 후 saveTodoListToStorage 호출)
// =============================================

/**
 * 입력창에 입력된 값을 읽어 새로운 Todo를 생성한다.
 * 입력값이 비어있으면 안내 메시지만 표시하고 종료한다.
 * 생성되는 Todo에는 현재 선택된 날짜가 함께 저장된다.
 */
function addTodo() {
  const inputValue = todoInputElement.value.trim();

  if (inputValue === '') {
    showInputWarning('할 일을 입력해주세요.');
    return;
  }

  todoList.push({
    id: nextTodoId++,
    text: inputValue,
    completed: false,
    date: formatDateAsKey(currentSelectedDate),
  });

  saveTodoListToStorage();

  todoInputElement.value = '';
  clearInputWarning();
  renderTodoList();
}

/**
 * 특정 Todo의 완료 상태를 반전시킨다.
 */
function toggleCompleteTodo(todoId) {
  const targetTodo = todoList.find((todo) => todo.id === todoId);
  if (!targetTodo) return;

  targetTodo.completed = !targetTodo.completed;
  saveTodoListToStorage();
  renderTodoList();
}

/**
 * 특정 Todo를 목록에서 삭제한다.
 */
function deleteTodo(todoId) {
  const targetIndex = todoList.findIndex((todo) => todo.id === todoId);
  if (targetIndex === -1) return;

  todoList.splice(targetIndex, 1);
  saveTodoListToStorage();
  renderTodoList();
}

/**
 * 수정 버튼 클릭 시 호출.
 * window.prompt() 다이얼로그를 띄워 새 내용을 입력받는다.
 *  - 사용자가 '취소'를 누르면 prompt가 null을 반환 → 아무것도 하지 않음
 *  - 빈 값을 입력하면 안내 메시지를 표시하고 저장하지 않음
 *  - 그 외에는 trim한 값으로 Todo의 text를 갱신
 */
function editTodo(todoId) {
  const targetTodo = todoList.find((todo) => todo.id === todoId);
  if (!targetTodo) return;

  // 기존 텍스트를 기본값으로 채워 prompt를 띄운다
  const promptResult = window.prompt('할 일을 수정하세요', targetTodo.text);

  // 사용자가 취소(엑스/Esc) → null. 아무것도 하지 않는다.
  if (promptResult === null) return;

  const trimmedText = promptResult.trim();

  // 공백만 입력했을 경우: 저장하지 않고 안내 메시지 표시
  if (trimmedText === '') {
    showInputWarning('수정할 내용을 입력해주세요.');
    return;
  }

  targetTodo.text = trimmedText;
  saveTodoListToStorage();
  clearInputWarning();
  renderTodoList();
}

// =============================================
// 안내 메시지
// =============================================

function showInputWarning(message) {
  inputWarningElement.textContent = message;
}

function clearInputWarning() {
  inputWarningElement.textContent = '';
}

// =============================================
// 필터링 / 렌더링
// =============================================

function changeFilter(nextFilter) {
  currentFilter = nextFilter;

  const allTabs = filterTabsElement.querySelectorAll('.filter-tab');
  allTabs.forEach((tab) => {
    if (tab.dataset.filter === currentFilter) {
      tab.classList.add('is-active');
    } else {
      tab.classList.remove('is-active');
    }
  });

  renderTodoList();
}

function getFilteredTodoList() {
  const selectedDateKey = formatDateAsKey(currentSelectedDate);

  // 1) 선택된 날짜에 속한 Todo만 추린다
  const todosOnSelectedDate = todoList.filter((todo) => todo.date === selectedDateKey);

  // 2) 상태 필터 적용
  if (currentFilter === 'active') {
    return todosOnSelectedDate.filter((todo) => !todo.completed);
  }
  if (currentFilter === 'completed') {
    return todosOnSelectedDate.filter((todo) => todo.completed);
  }
  return todosOnSelectedDate;
}

function renderTodoList() {
  todoListElement.innerHTML = '';

  const visibleTodoList = getFilteredTodoList();

  if (visibleTodoList.length === 0) {
    const emptyMessageElement = document.createElement('li');
    emptyMessageElement.className = 'empty-message';
    emptyMessageElement.textContent = getEmptyMessageByFilter(currentFilter);
    todoListElement.appendChild(emptyMessageElement);
    return;
  }

  visibleTodoList.forEach((todo) => {
    const todoItemElement = document.createElement('li');
    todoItemElement.className = 'todo-item';
    if (todo.completed) {
      todoItemElement.classList.add('completed');
    }

    // Todo 텍스트 표시 영역
    const todoTextElement = document.createElement('span');
    todoTextElement.className = 'todo-text';
    todoTextElement.textContent = todo.text;

    // 수정 버튼: 클릭 시 prompt 다이얼로그로 수정
    const editButton = document.createElement('button');
    editButton.className = 'todo-button edit-button';
    editButton.textContent = '수정';
    editButton.addEventListener('click', () => {
      editTodo(todo.id);
    });

    // 완료 버튼: 클릭 시 완료 여부 토글
    const completeButton = document.createElement('button');
    completeButton.className = 'todo-button complete-button';
    if (todo.completed) completeButton.classList.add('is-active');
    completeButton.textContent = todo.completed ? '완료됨' : '완료';
    completeButton.addEventListener('click', () => {
      toggleCompleteTodo(todo.id);
    });

    // 삭제 버튼: 클릭 시 해당 Todo 제거
    const deleteButton = document.createElement('button');
    deleteButton.className = 'todo-button delete-button';
    deleteButton.textContent = '삭제';
    deleteButton.addEventListener('click', () => {
      deleteTodo(todo.id);
    });

    todoItemElement.appendChild(todoTextElement);
    todoItemElement.appendChild(editButton);
    todoItemElement.appendChild(completeButton);
    todoItemElement.appendChild(deleteButton);

    todoListElement.appendChild(todoItemElement);
  });
}

function getEmptyMessageByFilter(filter) {
  if (filter === 'active') return '진행 중인 할 일이 없습니다.';
  if (filter === 'completed') return '완료된 할 일이 없습니다.';
  return '이 날짜에는 할 일이 없습니다. 새로운 Todo를 추가해보세요!';
}

// =============================================
// 초기화: 페이지 진입 시 로컬스토리지에서 데이터 복원 후 렌더링
// =============================================
loadTodoListFromStorage();
renderDateDisplay();
renderTodoList();
