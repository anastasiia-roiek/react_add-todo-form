import './App.scss';
import 'bulma/css/bulma.css';
import { FormEvent, useState } from 'react';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';

import { User } from './types/User';
import { Todo } from './types/Todo';

import { TodoList } from './components/TodoList';

// function getUserByName(userName: string): User | null {
//   return usersFromServer.find(user => (user.name === userName)) || null;
// }

function getUserById(userId: number): User | null {
  const foundUser = usersFromServer.find(user => user.id === userId);

  return foundUser || null;
}

const prepTodos: Todo[] = todosFromServer.map(todo => {
  return {
    ...todo,
    user: getUserById(todo.userId),
  };
});

export const App = () => {
  const [title, setTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState(0);
  const [todos, setTodos] = useState(prepTodos);

  const [shouldErrorOnUserSelect, setErrorOnUserSelect] = useState(false);
  const [shouldErrorOnTitleInput, setErrorOnTitleInput] = useState(false);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.currentTarget.value);
    if (shouldErrorOnTitleInput === true) {
      setErrorOnTitleInput(false);
    }
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(+event.currentTarget.value);
    if (shouldErrorOnUserSelect === true) {
      setErrorOnUserSelect(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setErrorOnTitleInput(!title.trim());
    setErrorOnUserSelect(!selectedUser);

    if (title.trim() === '' || selectedUser === 0) {
      setErrorOnTitleInput(title.trim() === '');
      setErrorOnUserSelect(selectedUser === 0);

      return;
    }

    // const userToAdd = getUserById(selectedUser);

    setTodos(current => {
      const maxTodoId = Math.max(...current.map(todo => todo.id));

      return [
        ...current,
        {
          id: maxTodoId + 1,
          title,
          completed: false,
          userId: selectedUser,
          user: getUserById(selectedUser),
        },
      ];
    });

    setTitle('');
    setSelectedUser(0);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form
        action="/api/users"
        method="POST"
        onSubmit={handleSubmit}
      >
        <div className="field">
          <label htmlFor="title"> Write down your task:</label>

          <input
            type="text"
            data-cy="titleInput"
            placeholder="Enter title of task"
            value={title}
            onChange={handleTitleChange}
          />
          {shouldErrorOnTitleInput && (
            <span className="error">Please enter a title</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="title">Choose a user:</label>

          <select
            data-cy="userSelect"
            id="userSelect"
            name="userSelect"
            value={selectedUser}
            onChange={handleUserChange}
          >
            <option value="" disabled>Choose a user</option>

            {usersFromServer.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          {shouldErrorOnUserSelect && (
            <span className="error">Please choose a user</span>
          )}
        </div>

        <button
          type="submit"
          data-cy="submitButton"
        >
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
