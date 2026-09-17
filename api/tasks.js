let tasks = [];
let initialized = false;

function initTasks() {
  if (initialized) return;
  initialized = true;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  initTasks();

  if (req.method === 'GET') {
    const { status, priority, search } = req.query;
    let filtered = [...tasks];

    if (status) filtered = filtered.filter(t => t.status === status);
    if (priority) filtered = filtered.filter(t => t.priority === priority);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(s) ||
        (t.description && t.description.toLowerCase().includes(s))
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json(filtered);
  }

  if (req.method === 'POST') {
    const { title, description, status, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tasks.push(task);
    return res.status(201).json(task);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
