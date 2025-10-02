import React, { useState, useEffect } from 'react';

function TaskScheduler() {
    const [tasks, setTasks] = useState([]);

    async function fetchTasks() {
        // This is a placeholder for fetching tasks from the MCP backend.
        // In a real application, you would use the MCP client to call the "get-tasks" tool.
        const mockTasks = [
            { id: 'task_1', description: 'Finish MCP integration', deadline: '2025-09-15T10:00:00Z' },
            { id: 'task_2', description: 'Write documentation', deadline: '2025-09-20T15:00:00Z' },
            { id: 'task_3', description: 'Deploy to production', deadline: '2025-09-12T18:00:00Z' },
        ];
        // Sort by deadline
        mockTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTasks(mockTasks);
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Task Scheduler</h1>
            <button
                onClick={fetchTasks}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Refresh Tasks
            </button>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Deadline</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td className="py-2 px-4 border-b">{task.description}</td>
                            <td className="py-2 px-4 border-b">{new Date(task.deadline).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TaskScheduler;
