// API utility for tasks

// Normalizer for task objects from API
export function normalizeTask(task: any) {
  return {
    ...task,
    createdAt: task.created_at ? new Date(task.created_at) : undefined,
    updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
  };
}

export async function fetchTasks() {
  const response = await fetch('http://localhost:3001/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  const data = await response.json();
  return data.map(normalizeTask);
}

export async function createTask(task: { title: string; description?: string }) {
  const response = await fetch('http://localhost:3001/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  const data = await response.json();
  return normalizeTask(data);
}

export async function updateTaskStatus(id: string, status: string) {
  const response = await fetch(`http://localhost:3001/api/tasks/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task status');
  }
  const data = await response.json();
  return normalizeTask(data);
} 