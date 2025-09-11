
import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const snapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by deadline, soonest first
      tasksData.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setTasks(tasksData);
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.description}</td>
              <td>{new Date(task.deadline).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tasks;
