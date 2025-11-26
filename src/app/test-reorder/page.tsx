"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import TaskItem, { TaskItemData } from "@/components/TaskItem";

const initialTodos: TaskItemData[] = [
    {
        id: "1",
        text: "Buy groceries",
        completed: false,
        time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    },
    {
        id: "2",
        text: "Walk the dog",
        completed: true,
        time: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    },
    {
        id: "3",
        text: "Finish project report",
        completed: false,
        time: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    },
    {
        id: "4",
        text: "Call dentist",
        completed: false,
        time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    },
    {
        id: "5",
        text: "Read a book",
        completed: true,
        time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    },
    {
        id: "6",
        text: "Exercise for 30 minutes",
        completed: false,
        time: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
    },
];

export default function TestReorderPage() {
    const [todos, setTodos] = useState(initialTodos);

    const toggleTodo = (id: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo,
            ),
        );
    };

    const updateText = (id: string, newText: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, text: newText } : todo,
            ),
        );
    };

    const updateTime = (id: string, newTime: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, time: newTime } : todo,
            ),
        );
    };

    return (
        <div className="bg-background min-h-screen p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-8 text-3xl font-bold">
                    Framer Motion Reorder Test
                </h1>

                <div className="bg-card rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">Todo List</h2>

                    <Reorder.Group
                        axis="y"
                        values={todos}
                        onReorder={setTodos}
                        className="space-y-2"
                    >
                        {todos.map((todo) => (
                            <TaskItem
                                key={todo.id}
                                task={todo}
                                onToggleComplete={() => toggleTodo(todo.id)}
                                onUpdateText={(newText) =>
                                    updateText(todo.id, newText)
                                }
                                onUpdateTime={(newTime) =>
                                    updateTime(todo.id, newTime)
                                }
                            />
                        ))}
                    </Reorder.Group>
                </div>

                <div className="bg-muted mt-8 rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Current Order:</h3>
                    <ol className="list-decimal pl-6">
                        {todos.map((todo) => (
                            <li key={todo.id}>{todo.text}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
