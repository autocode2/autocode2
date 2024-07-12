import { useState } from 'react'
import './App.css'
import TodoList from './TodoList'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }])
      setNewTodo('')
    }
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const updateTodo = (id, newText) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, text: newText } : todo))
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const completedCount = todos.filter(todo => todo.completed).length
  const incompleteCount = todos.length - completedCount

  return (
    <div className="App">
      <h1>Todo App</h1>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      <TodoList
        todos={filteredTodos}
        deleteTodo={deleteTodo}
        updateTodo={updateTodo}
        toggleTodo={toggleTodo}
      />
      <div>
        <p>Completed: {completedCount}</p>
        <p>Incomplete: {incompleteCount}</p>
      </div>
    </div>
  )
}

export default App