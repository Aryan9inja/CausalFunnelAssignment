"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Session } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/sessions`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch sessions");
        }
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load sessions. Make sure the server is running.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalEvents = sessions.reduce((acc, curr) => acc + curr.eventCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Monitor real-time user activity, tracking sessions and user journeys.
          </p>
        </div>
        <button
          onClick={fetchSessions}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Sessions</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{sessions.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Tracked Events</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{totalEvents}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-2 lg:col-span-1">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Avg. Events per Session</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {sessions.length > 0 ? (totalEvents / sessions.length).toFixed(1) : 0}
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-zinc-500">Fetching session data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-4 text-center p-6">
            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Unable to load sessions</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1">{error}</p>
            </div>
            <button
              onClick={fetchSessions}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center p-6">
            <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No sessions recorded yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Open the static demo page <code>demo/index.html</code> in a browser and click around to capture events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-sm font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <th className="px-6 py-4">Session ID</th>
                  <th className="px-6 py-4">Event Count</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-xs tracking-tight">
                      {session.session_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400">
                        {session.eventCount} events
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {new Date(session.lastActive).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/sessions/${session.session_id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        View Journey &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
