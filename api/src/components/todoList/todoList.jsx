import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../userProvider';
import styles from './todoList.module.css';
import SingleTodo from '../singleTodo/singleTodo';
import Nav from "../nav/nav";


//Manage the list of all the todos.
const TodoList = () => {
  const { currentUser } = useCurrentUser();
  const [todos, setTodos] = useState([]);
  const [displayedTodos, setDisplayedTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [sortCriteria, setSortCriteria] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("title");

  //fetch all Todos of the current user when the component is load.
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        if (currentUser.id === -1) return;
        const response = await fetch(`http://localhost:3000/todos?userId=${currentUser.id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setTodos(data);
        setDisplayedTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [currentUser.id]);


  //sort the displayed list.
  const sortTodos = (list) => {
    let sortedTodos = [...list];
    if (sortCriteria === "id") {
      sortedTodos.sort((a, b) => (sortDirection === "asc" ? a.id - b.id : b.id - a.id));
    } else if (sortCriteria === "title") {
      sortedTodos.sort((a, b) => (sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
    } else if (sortCriteria === "completed") {
      sortedTodos.sort((a, b) => (sortDirection === "asc" ? a.completed - b.completed : b.completed - a.completed));
    }
    return sortedTodos;
  };


  //search for a certain todo according to its id/title/status.
  useEffect(() => {
    const filtered = todos.filter(todo => {
      if (searchCriteria === "id") {
        return todo.id.toString().includes(searchTerm);
      } else if (searchCriteria === "title") {
        return todo.title.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === "completed") {
        return todo.completed.toString() === searchTerm;
      }
      return true;
    });
    setDisplayedTodos(sortTodos(filtered));//sort the selected todos.
  }, [searchTerm, searchCriteria, todos, sortCriteria, sortDirection]);

  //Add a new todo to the DB.
  const handleAddTodo = async () => {
    if (!newTitle) return;
    try {
      const response = await fetch(`http://localhost:3000/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(currentUser.id),
          title: newTitle,
          completed: false,
        }),
      });
      if (!response.ok)
        throw new Error(`Error: ${response.status}`);
      const addedTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, addedTodo]);
      setIsAdding(false);
      setNewTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div>
      <Nav/>
      <h2 className={styles.header}>Todos for {currentUser.username}</h2>
      <div style={{ marginBottom: '20px' }}>
        {/* search creteria */}
        <label htmlFor="searchCriteria" className={styles.label}>Search by:</label>
        <select
          id="searchCriteria"
          value={searchCriteria}
          onChange={(e) => setSearchCriteria(e.target.value)}
          className={styles.select}
        >
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="completed">Completed</option>
        </select>
        {/* search term */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term"
          className={styles.input}
        />
        <button onClick={() => setSearchTerm("")} className={styles.button}>Reset Search</button>
      </div>

      <div>
        {/* sort creteria */}
        <label htmlFor="sortCriteria" className={styles.label}>Sort by:</label>
        <select
          id="sortCriteria"
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className={styles.select}
        >
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="completed">Completed</option>
        </select>
        {/* asc/ desc sort */}
        <button
          onClick={() => setSortDirection("asc")}
          disabled={sortDirection === "asc"}
          className={styles.button}
        >
          ↑
        </button>
        <button
          onClick={() => setSortDirection("desc")}
          disabled={sortDirection === "desc"}
          className={styles.button}
        >
          ↓
        </button>
        <button
          onClick={() => {
            setSortCriteria("id");
            setSortDirection("asc");
          }}
          className={styles.button}
        >
          Reset Sort
        </button>
      </div>
      {/* the todos list */}
      <ul className={styles.todoList}>
        {(displayedTodos.length > 0) ? displayedTodos.map((todo, index) => (
          <li key={index} className={styles.todoItem}>
            <SingleTodo
              todo={todo}
              setTodos={setTodos}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
            />
          </li>
        )) : <p className={styles.noTodos}>No Todos found 😒</p>}
      </ul>
      {/* small form for the new todo */}
      {isAdding && (
        <div className={styles.addTaskContainer}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new task title"
            className={styles.input}
          />
          <button onClick={handleAddTodo} className={styles.button}>Add Task</button>
          <button onClick={() => setIsAdding(false)} className={styles.button}>Cancel</button>
        </div>
      )}
      {!isAdding &&
        <button onClick={() => setIsAdding(true)} className={styles.button}>Add New Task</button>}
    </div>
  );
};

export default TodoList;
