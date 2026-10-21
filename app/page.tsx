'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at?: string;
};

type Filter = 'all' | 'active' | 'completed';

const API_URL = '/api/tasks';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Selesai' },
];

function IconLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconInbox({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </svg>
  );
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Permintaan gagal (${response.status})`);
  }

  return data as T;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await apiRequest<Task[]>(API_URL);
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat tugas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiRequest<Task[]>(API_URL)
      .then((data) => {
        if (cancelled) return;
        setTasks(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat tugas.');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    return { total, completed, active: total - completed };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed);
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const filterCounts: Record<Filter, number> = {
    all: stats.total,
    active: stats.active,
    completed: stats.completed,
  };

  const addTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;

    setSubmitting(true);
    try {
      await apiRequest(API_URL, {
        method: 'POST',
        body: JSON.stringify({ title: value }),
      });
      setTitle('');
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  const patchTask = async (id: number, payload: { completed?: boolean; title?: string }) => {
    setBusyId(id);
    try {
      await apiRequest(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui tugas.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleTask = (task: Task) => {
    patchTask(task.id, { completed: !task.completed });
  };

  const startEdit = (task: Task) => {
    setConfirmId(null);
    setEditingId(task.id);
    setDraftTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const saveEdit = async (id: number) => {
    const value = draftTitle.trim();
    if (!value) return;

    setBusyId(id);
    try {
      await apiRequest(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: value }),
      });
      setEditingId(null);
      setDraftTitle('');
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan tugas.');
    } finally {
      setBusyId(null);
    }
  };

  const startDelete = (id: number) => {
    setEditingId(null);
    setConfirmId(id);
  };

  const cancelDelete = () => {
    setConfirmId(null);
  };

  const deleteTask = async (id: number) => {
    setBusyId(id);
    try {
      await apiRequest(`${API_URL}/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus tugas.');
    } finally {
      setBusyId(null);
    }
  };

  const actionButtonClass =
    'grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 disabled:opacity-50';

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(55%_50%_at_50%_0%,rgba(79,70,229,0.10),transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.25)]">
          <header className="border-b border-slate-200 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                <IconLogo className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                  To-Do List
                </h1>
                <p className="text-sm text-slate-500">
                  Catat, rapikan, dan selesaikan tugas harianmu.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Total
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-xl border border-blue-200/80 bg-blue-50 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700/80">
                  Aktif
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-blue-700">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-700/80">
                  Selesai
                </p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-indigo-700">
                  {stats.completed}
                </p>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-100 px-6 py-5">
            <form onSubmit={addTask} className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Apa yang perlu dikerjakan?"
                maxLength={255}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconPlus className="h-4 w-4" />
                Tambah
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div
              role="tablist"
              aria-label="Filter tugas"
              className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"
            >
              {FILTERS.map((option) => {
                const isActive = filter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilter(option.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm shadow-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {option.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      {filterCounts[option.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              Menampilkan {visibleTasks.length} dari {stats.total} tugas
            </p>
          </div>

          <div className="px-6 py-5">
            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
              >
                <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="min-w-0 flex-1 break-words">{error}</p>
                <button
                  type="button"
                  onClick={loadTasks}
                  className="shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  Coba lagi
                </button>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  aria-label="Tutup pesan error"
                  className="shrink-0 rounded-lg p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            {loading ? (
              <ul className="space-y-2.5">
                {[0, 1, 2].map((row) => (
                  <li
                    key={row}
                    className="h-[52px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </ul>
            ) : visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                  <IconInbox className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {tasks.length === 0
                    ? 'Belum ada tugas'
                    : 'Tidak ada tugas pada filter ini'}
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                  {tasks.length === 0
                    ? 'Tambahkan tugas pertamamu lewat form di atas.'
                    : 'Coba ganti filter untuk melihat tugas lainnya.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {visibleTasks.map((task) => {
                  const isEditing = editingId === task.id;
                  const isConfirming = confirmId === task.id;
                  const isBusy = busyId === task.id;

                  return (
                    <li
                      key={task.id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        isEditing
                          ? 'border-indigo-300 bg-indigo-50/40 ring-4 ring-indigo-100'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.completed}
                        aria-label={
                          task.completed
                            ? `Tandai "${task.title}" sebagai aktif`
                            : `Tandai "${task.title}" sebagai selesai`
                        }
                        onClick={() => toggleTask(task)}
                        disabled={isBusy}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          task.completed
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-indigo-500'
                        }`}
                      >
                        <IconCheck className="h-3 w-3" />
                      </button>

                      {isEditing ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={draftTitle}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                saveEdit(task.id);
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault();
                                cancelEdit();
                              }
                            }}
                            maxLength={255}
                            className="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(task.id)}
                            disabled={isBusy || !draftTitle.trim()}
                            aria-label="Simpan perubahan"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IconCheck className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            aria-label="Batal edit"
                            className={`${actionButtonClass} hover:bg-slate-100 hover:text-slate-600`}
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        </div>
                      ) : isConfirming ? (
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm text-slate-500">
                            Hapus tugas ini secara permanen?
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <IconTrash className="h-3.5 w-3.5" />
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`min-w-0 flex-1 break-words text-sm transition ${
                              task.completed
                                ? 'text-slate-400 line-through decoration-slate-300'
                                : 'text-slate-700'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(task)}
                              disabled={isBusy}
                              aria-label={`Edit tugas "${task.title}"`}
                              className={`${actionButtonClass} hover:bg-slate-100 hover:text-indigo-600`}
                            >
                              <IconPencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startDelete(task.id)}
                              disabled={isBusy}
                              aria-label={`Hapus tugas "${task.title}"`}
                              className={`${actionButtonClass} hover:bg-rose-50 hover:text-rose-600`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400">
              Selesai {stats.completed} dari {stats.total} tugas
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
