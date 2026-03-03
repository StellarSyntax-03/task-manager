'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Task, User } from '@/types';
import { X, Calendar, Flag, AlignLeft, Type, User as UserIcon, CheckCircle } from 'lucide-react';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSave: () => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: '#64748b' },
  { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#10b981' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#06b6d4' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assignedTo: task?.assignedTo?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users for assignment (admin only)
    api.get('/auth/me').then(({ data }) => {
      if (data.role === 'admin') {
        // We can't directly list users without an endpoint, so we skip here
        // In a real app you'd have GET /users endpoint
      }
    }).catch(() => {});
  }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
      };
      if (form.dueDate) payload.dueDate = form.dueDate;
      if (form.assignedTo) payload.assignedTo = form.assignedTo;

      if (isEdit) {
        await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      onSave();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg animate-scale-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {isEdit ? 'Update task details below' : 'Fill in the details to create a task'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <Type className="w-3.5 h-3.5" /> Title
            </label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)}
              placeholder="What needs to be done?" required className="input-base"
              style={{ fontSize: '0.95rem', fontWeight: 500 }} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Add more context or details..." rows={3}
              className="input-base resize-none leading-relaxed"
              style={{ paddingTop: '10px', paddingBottom: '10px' }} />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}>
                <CheckCircle className="w-3.5 h-3.5" /> Status
              </label>
              <div className="space-y-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => update('status', opt.value)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: form.status === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.status === opt.value ? `${opt.color}40` : 'rgba(255,255,255,0.06)'}`,
                      color: form.status === opt.value ? opt.color : 'var(--text-secondary)',
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}>
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              <div className="space-y-1.5">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => update('priority', opt.value)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: form.priority === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.priority === opt.value ? `${opt.color}40` : 'rgba(255,255,255,0.06)'}`,
                      color: form.priority === opt.value ? opt.color : 'var(--text-secondary)',
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" /> Due Date <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)}
              className="input-base"
              style={{
                colorScheme: 'dark',
              }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isEdit ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
