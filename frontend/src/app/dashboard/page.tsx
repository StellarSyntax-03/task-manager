'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Task, TaskStats, TaskFilters } from '@/types';
import {
  Zap, LogOut, Plus, CheckCircle, Clock, AlertCircle, BarChart3,
  Filter, ChevronDown, Search, Trash2, Pencil, Calendar, User,
  ArrowUpDown, LayoutGrid, List, X, Shield, ChevronUp,
} from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';
import { format, isValid, parseISO, isPast } from 'date-fns';
import clsx from 'clsx';

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', icon: Clock },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: AlertCircle },
  done: { label: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [modalState, setModalState] = useState<{ open: boolean; task?: Task }>({ open: false });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, tasks]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setDeleting(id);
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
      fetchStats();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = () => {
    setModalState({ open: false });
    fetchTasks();
    fetchStats();
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Signed out successfully');
  };

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key] === value ? undefined : value,
    }));
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )} style={{ width: '260px', background: 'var(--bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 15px rgba(124,58,237,0.35)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>TaskFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#f1f0ff' }}>{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user?.role === 'admin' && <Shield className="w-3 h-3" style={{ color: '#a78bfa' }} />}
                  <span className="text-xs capitalize" style={{ color: '#a78bfa' }}>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Overview</p>
          {stats && [
            { label: 'Total Tasks', value: stats.total, color: '#a78bfa' },
            { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
            { label: 'Completed', value: stats.done, color: '#10b981' },
            { label: 'High Priority', value: stats.highPriority, color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
              <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {stats && stats.total > 0 && (
          <div className="px-4 mt-4">
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Overall Progress</span>
              <span style={{ color: '#10b981' }}>{Math.round((stats.done / stats.total) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(stats.done / stats.total) * 100}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                }} />
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-auto p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10"
            style={{ color: 'var(--text-secondary)', border: '1px solid transparent' }}>
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4"
          style={{ background: 'rgba(6,6,10,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <List className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
              {filters.status === 'todo' ? 'To Do' : filters.status === 'in_progress' ? 'In Progress' : filters.status === 'done' ? 'Completed' : 'All Tasks'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="input-base h-9 text-sm"
                style={{ paddingLeft: '2.25rem', width: '220px', paddingTop: '0', paddingBottom: '0' }} />
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'var(--bg-secondary)' }}>
              {[
                { mode: 'list' as const, icon: List },
                { mode: 'grid' as const, icon: LayoutGrid },
              ].map(({ mode, icon: Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-2 transition-all"
                  style={{
                    background: viewMode === mode ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: viewMode === mode ? '#a78bfa' : 'var(--text-muted)',
                  }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: showFilters ? 'rgba(124,58,237,0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${showFilters ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: showFilters ? '#a78bfa' : 'var(--text-secondary)',
              }}>
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {(filters.status || filters.priority) && (
                <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ background: '#7c3aed', fontSize: '10px' }}>
                  {[filters.status, filters.priority].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* New task */}
            <button onClick={() => setModalState({ open: true })}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Filter bar */}
        {showFilters && (
          <div className="px-6 py-3 flex flex-wrap items-center gap-3 animate-fade-in"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(13,13,20,0.5)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Status:</span>
            {['todo', 'in_progress', 'done'].map((s) => {
              const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
              return (
                <button key={s} onClick={() => updateFilter('status', s)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filters.status === s ? cfg.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${filters.status === s ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                    color: filters.status === s ? cfg.color : 'var(--text-secondary)',
                  }}>
                  {cfg.label}
                </button>
              );
            })}
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Priority:</span>
            {['low', 'medium', 'high'].map((p) => {
              const cfg = PRIORITY_CONFIG[p as keyof typeof PRIORITY_CONFIG];
              return (
                <button key={p} onClick={() => updateFilter('priority', p)}
                  className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: filters.priority === p ? cfg.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${filters.priority === p ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                    color: filters.priority === p ? cfg.color : 'var(--text-secondary)',
                  }}>
                  {cfg.label}
                </button>
              );
            })}
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sort:</span>
            {[
              { key: 'createdAt', label: 'Created' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'priority', label: 'Priority' },
            ].map((s) => (
              <button key={s.key}
                onClick={() => {
                  if (filters.sortBy === s.key) {
                    setFilters((f) => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }));
                  } else {
                    setFilters((f) => ({ ...f, sortBy: s.key, sortOrder: 'desc' }));
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filters.sortBy === s.key ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filters.sortBy === s.key ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  color: filters.sortBy === s.key ? '#a78bfa' : 'var(--text-secondary)',
                }}>
                {s.label}
                {filters.sortBy === s.key && (
                  filters.sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            ))}
            {(filters.status || filters.priority) && (
              <button onClick={() => setFilters({ sortBy: 'createdAt', sortOrder: 'desc' })}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-transparent border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#7c3aed' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
                {search ? 'No tasks match your search' : 'No tasks yet'}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {search ? 'Try a different search term' : 'Create your first task to get started'}
              </p>
              {!search && (
                <button onClick={() => setModalState({ open: true })} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Task
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTasks.map((task, i) => (
                <TaskCard key={task._id} task={task} index={i}
                  onEdit={() => setModalState({ open: true, task })}
                  onDelete={() => handleDelete(task._id)}
                  deleting={deleting === task._id}
                  isAdmin={user?.role === 'admin'} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, i) => (
                <TaskRow key={task._id} task={task} index={i}
                  onEdit={() => setModalState({ open: true, task })}
                  onDelete={() => handleDelete(task._id)}
                  deleting={deleting === task._id}
                  isAdmin={user?.role === 'admin'} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      {modalState.open && (
        <TaskModal
          task={modalState.task}
          onClose={() => setModalState({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaskCard({ task, index, onEdit, onDelete, deleting, isAdmin }: {
  task: Task; index: number; onEdit: () => void; onDelete: () => void; deleting: boolean; isAdmin: boolean;
}) {
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const StatusIcon = statusCfg.icon;
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';

  return (
    <div className="glass-card glass-card-hover p-5 flex flex-col gap-3 animate-slide-up"
      style={{ animationDelay: `${index * 40}ms` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug" style={{ color: '#f1f0ff', fontFamily: 'Syne, sans-serif' }}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: priorityCfg.bg, border: `1px solid ${priorityCfg.border}`, color: priorityCfg.color }}>
          {priorityCfg.label}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
          {task.dueDate && (
            <>
              <Calendar className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'MMM d')}
              {isOverdue && <span className="font-medium">· Overdue</span>}
            </>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-1 ml-2">
              <User className="w-3 h-3" />
              {task.assignedTo.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg transition-all hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {(isAdmin || true) && (
            <button onClick={onDelete} disabled={deleting}
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: deleting ? 'var(--text-muted)' : '#ef4444' }}>
              {deleting ? <div className="w-3.5 h-3.5 border border-red-500/50 border-t-transparent rounded-full animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, index, onEdit, onDelete, deleting, isAdmin }: {
  task: Task; index: number; onEdit: () => void; onDelete: () => void; deleting: boolean; isAdmin: boolean;
}) {
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const StatusIcon = statusCfg.icon;
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';

  return (
    <div className="glass-card glass-card-hover px-5 py-4 flex items-center gap-4 animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}>
      {/* Status dot */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusCfg.color }} />

      {/* Title & description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold" style={{ color: '#f1f0ff' }}>{task.title}</h3>
          {isOverdue && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              Overdue
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              {task.assignedTo.name.charAt(0)}
            </div>
            {task.assignedTo.name.split(' ')[0]}
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs" style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
            <Calendar className="w-3 h-3" />
            {format(parseISO(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: priorityCfg.bg, border: `1px solid ${priorityCfg.border}`, color: priorityCfg.color }}>
          {priorityCfg.label}
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-2 rounded-lg transition-all hover:bg-white/5"
          title="Edit" style={{ color: 'var(--text-muted)' }}>
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} disabled={deleting}
          className="p-2 rounded-lg transition-all hover:bg-red-500/10"
          title="Delete" style={{ color: '#ef4444' }}>
          {deleting ? <div className="w-4 h-4 border border-red-500/50 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
