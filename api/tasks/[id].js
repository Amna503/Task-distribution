let tasks = [];

function initTasks() {}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  initTasks();

  const { id } = req.query;

  if (req.method === 'GET') {
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.status(200).json(task);
  }

  if (req.method === 'PUT') {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority } = req.body;
    tasks[idx] = {
      ...tasks[idx],
      title: title ?? tasks[idx].title,
      description: description ?? tasks[idx].description,
      status: status ?? tasks[idx].status,
      priority: priority ?? tasks[idx].priority,
      updated_at: new Date().toISOString(),
    };
    return res.status(200).json(tasks[idx]);
  }

  if (req.method === 'DELETE') {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    tasks.splice(idx, 1);
    return res.status(200).json({ message: 'Task deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
