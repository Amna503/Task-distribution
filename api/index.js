let tasks = [];

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method;

  if (pathname === '/api/stats' && method === 'GET') {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return res.status(200).json({ total, pending, inProgress, completed });
  }

  if (pathname === '/api/tasks' && method === 'GET') {
    const status = urlObj.searchParams.get('status');
    const priority = urlObj.searchParams.get('priority');
    const search = urlObj.searchParams.get('search');
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

  if (pathname === '/api/tasks' && method === 'POST') {
    const body = await parseBody(req);
    const { title, description, status, priority } = body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
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

  const taskMatch = pathname.match(/^\/api\/tasks\/([a-zA-Z0-9-]+)/);
  if (taskMatch) {
    const id = taskMatch[1];

    if (method === 'GET') {
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      return res.status(200).json(task);
    }

    if (method === 'PUT') {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Task not found' });
      const body = await parseBody(req);
      const { title, description, status, priority } = body;
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

    if (method === 'DELETE') {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Task not found' });
      tasks.splice(idx, 1);
      return res.status(200).json({ message: 'Task deleted' });
    }
  }

  return res.status(404).json({ error: 'Not found' });
};
