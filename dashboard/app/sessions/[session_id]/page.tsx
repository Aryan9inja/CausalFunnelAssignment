"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrackedEvent } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SessionJourneyPage() {
  const params = useParams();
  const sessionId = params.session_id as string;

  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`${API_BASE_URL}/api/sessions/${sessionId}/events`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch events for this session");
        }
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load events.");
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back navigation & Header */}
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
        >
          &larr; Back to Sessions
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">User Journey</h1>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 select-all bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit">
            Session: {sessionId}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-zinc-500">Loading user journey timeline...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-4 text-center p-6">
            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Error fetching journey</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{error}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No events found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              There are no events recorded for this session ID.
            </p>
          </div>
        ) : (
          <div className="flow-root mt-4">
            <ul role="list" className="-mb-8">
              {events.map((event, eventIdx) => {
                const isPageView = event.event_type === "page_view";
                const eventTime = new Date(event.timestamp);

                // Calculate time difference from previous event
                let timeDiffStr = "";
                if (eventIdx > 0) {
                  const prevTime = new Date(events[eventIdx - 1].timestamp);
                  const diffMs = eventTime.getTime() - prevTime.getTime();
                  const diffSec = Math.floor(diffMs / 1000);
                  if (diffSec < 60) {
                    timeDiffStr = `+${diffSec}s`;
                  } else {
                    const diffMin = Math.floor(diffSec / 60);
                    timeDiffStr = `+${diffMin}m ${diffSec % 60}s`;
                  }
                }

                return (
                  <li key={event._id}>
                    <div className="relative pb-8">
                      {/* Timeline connecting line */}
                      {eventIdx !== events.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800"
                          aria-hidden="true"
                        />
                      ) : null}

                      <div className="relative flex space-x-3 items-start">
                        {/* Event icon badge */}
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-zinc-900 ${
                              isPageView
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            }`}
                          >
                            {isPageView ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                            )}
                          </span>
                        </div>

                        {/* Event details content */}
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <span>{isPageView ? "Page View" : "Mouse Click"}</span>
                              {timeDiffStr && (
                                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {timeDiffStr}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 break-all">
                              URL: <span className="font-mono bg-zinc-50 dark:bg-zinc-800/40 px-1 py-0.5 rounded">{event.page_url}</span>
                            </div>
                            {!isPageView && (event.x !== undefined && event.y !== undefined) && (
                              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded w-fit">
                                Coordinates: X = {event.x}px, Y = {event.y}px
                              </div>
                            )}
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-zinc-400 dark:text-zinc-500">
                            <div>{eventTime.toLocaleTimeString()}</div>
                            <div className="text-[10px]">{eventTime.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
