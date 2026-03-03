'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.access_token, data.user);
      toast.success(`Welcome to TaskFlow, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0d14 0%, #12121c 100%)' }}>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6d28d9, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>TaskFlow</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
            Start organizing smarter today
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join hundreds of teams who use TaskFlow to manage work, deadlines, and priorities with clarity.
          </p>
          <div className="space-y-3">
            {['Role-based access control', 'Real-time task updates', 'Priority & deadline tracking', 'Clean, fast interface'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }}>
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm italic mb-3" style={{ color: 'var(--text-secondary)' }}>
            "TaskFlow transformed how our team tracks work. It's fast, clean, and exactly what we needed."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>S</div>
            <div>
              <div className="text-xs font-medium" style={{ color: '#f1f0ff' }}>Sarah Chen</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Engineering Lead</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>TaskFlow</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>Create account</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have one?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#a78bfa' }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                  placeholder="John Doe" required minLength={2} className="input-base" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com" required className="input-base" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 6 characters" required minLength={6} className="input-base"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Account type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'member', label: 'Member', desc: 'Manage your tasks' },
                  { value: 'admin', label: 'Admin', desc: 'Full team access' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => update('role', opt.value)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: form.role === opt.value ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.role === opt.value ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <div className="text-sm font-semibold" style={{ color: form.role === opt.value ? '#a78bfa' : '#f1f0ff' }}>{opt.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3" style={{ fontSize: '0.95rem' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
