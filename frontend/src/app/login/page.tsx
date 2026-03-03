'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'alice' | 'bob') => {
    const creds = {
      admin: { email: 'admin@taskflow.com', password: 'admin123' },
      alice: { email: 'alice@taskflow.com', password: 'member123' },
      bob: { email: 'bob@taskflow.com', password: 'member123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0d14 0%, #12121c 100%)' }}>
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', filter: 'blur(60px)' }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
              TaskFlow
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Full-stack task management
          </div>
          <h1 className="text-5xl font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
            Take control of your workflow
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Manage tasks, track priorities, collaborate with your team — all in one elegant interface.
          </p>
        </div>

        <div className="relative z-10 flex gap-4">
          {[
            { label: 'Tasks managed', value: '12,000+' },
            { label: 'Teams using', value: '450+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#a78bfa' }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>TaskFlow</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f0ff' }}>
              Sign in
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link href="/register" className="font-medium hover:underline" style={{ color: '#a78bfa' }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#a78bfa' }}>Quick demo login:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin', key: 'admin' as const, desc: 'Full access' },
                { label: 'Alice', key: 'alice' as const, desc: 'Member' },
                { label: 'Bob', key: 'bob' as const, desc: 'Member' },
              ].map((d) => (
                <button key={d.key} onClick={() => fillDemo(d.key)}
                  className="p-2 rounded-lg text-left transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xs font-semibold" style={{ color: '#f1f0ff' }}>{d.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-base"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              style={{ fontSize: '0.95rem' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
