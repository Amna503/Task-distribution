const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_CYCLE = ['pending', 'in_progress', 'completed'];

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const nextStatus = () => {
    const idx = STATUS_CYCLE.indexOf(task.status);
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  };

  return (
    <div className={`task-card priority-${task.priority} status-${task.status}`}>
      <div className="task-header">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">
            ✎
          </button>
          <button className="icon-btn delete" onClick={() => onDelete(task.id)} title="Delete">
            ✕
          </button>
        </div>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-footer">
        <button
          className={`status-btn status-${task.status}`}
          onClick={() => onStatusChange(task.id, nextStatus())}
          title="Click to change status"
        >
          {STATUS_LABELS[task.status]}
        </button>
        <span className="task-date">
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
