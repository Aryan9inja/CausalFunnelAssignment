"use client";

import { useEffect, useState } from "react";
import { ClickEvent, Session, TrackedEvent } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HeatmapPage() {
  const [knownUrls, setKnownUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scan recent sessions to harvest unique page URLs
  useEffect(() => {
    setLoadingUrls(true);
    fetch(`${API_BASE_URL}/api/sessions`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch sessions");
        }
        return res.json();
      })
      .then(async (sessions: Session[]) => {
        const urlSet = new Set<string>();
        
        // Fetch events from the top 10 most recent sessions to compile URL list
        const promises = sessions.slice(0, 10).map((session) =>
          fetch(`${API_BASE_URL}/api/sessions/${session.session_id}/events`)
            .then((res) => (res.ok ? res.json() : []))
            .then((events: TrackedEvent[]) => {
              events.forEach((event) => {
                if (event.page_url) {
                  urlSet.add(event.page_url);
                }
              });
            })
            .catch(() => {})
        );

        await Promise.all(promises);
        const urls = Array.from(urlSet);
        setKnownUrls(urls);
        if (urls.length > 0) {
          setSelectedUrl(urls[0]);
        }
        setLoadingUrls(false);
      })
      .catch((err) => {
        console.error("Error gathering page URLs:", err);
        setLoadingUrls(false);
      });
  }, []);

  // Fetch click events for the selected URL
  useEffect(() => {
    const urlToFetch = customUrl || selectedUrl;
    if (!urlToFetch) {
      setClicks([]);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/heatmap?page_url=${encodeURIComponent(urlToFetch)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch click heatmap data");
        }
        return res.json();
      })
      .then((data: ClickEvent[]) => {
        setClicks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load heatmap.");
        setLoading(false);
      });
  }, [selectedUrl, customUrl]);

  // Determine viewport canvas dimensions to fit all click points
  const maxX = clicks.reduce((max, c) => (c.x > max ? c.x : max), 1000);
  const maxY = clicks.reduce((max, c) => (c.y > max ? c.y : max), 800);
  
  // Create a canvas boundary that fits standard sizes or the largest click coord
  const canvasWidth = Math.max(1280, maxX + 100);
  const canvasHeight = Math.max(900, maxY + 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Click Heatmap</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Analyze click density and user interactions across specific tracked pages.
        </p>
      </div>

      {/* URL Selector Controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dropdown for known URLs */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Select Page URL (from activity)
            </label>
            <select
              value={selectedUrl}
              onChange={(e) => {
                setSelectedUrl(e.target.value);
                setCustomUrl(""); // Clear custom URL when selecting from dropdown
              }}
              disabled={loadingUrls || knownUrls.length === 0}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            >
              {loadingUrls ? (
                <option>Scanning sessions for URLs...</option>
              ) : knownUrls.length === 0 ? (
                <option>No URLs found. Trigger some tracker clicks first.</option>
              ) : (
                knownUrls.map((url) => (
                  <option key={url} value={url}>
                    {url}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Custom URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Or Paste Custom URL
            </label>
            <input
              type="text"
              placeholder="e.g., http://localhost:3000/demo"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Current URL Selection Indicator */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing data for: <strong className="font-mono text-zinc-800 dark:text-zinc-200">
            {customUrl || selectedUrl || "None selected"}
          </strong>
        </div>
      </div>

      {/* Heatmap Visualizer */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden flex flex-col">
        {/* Canvas Header toolbar */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span className="ml-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              Mock Browser Window ({canvasWidth}px x {canvasHeight}px)
            </span>
          </div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
            {clicks.length} total clicks
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 overflow-auto max-h-150 p-4 bg-zinc-100 dark:bg-zinc-950">
          {loading ? (
            <div className="flex h-96 items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-zinc-500">Loading click data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Error rendering heatmap</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
            </div>
          ) : !selectedUrl && !customUrl ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Select a URL to inspect</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose a page URL from the options above to view click coordinates.
              </p>
            </div>
          ) : clicks.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center gap-2 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
              <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No clicks recorded on this page</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                Open the demo page, click at various spots, then reload this dashboard. Only <strong>click</strong> events are mapped on the heatmap.
              </p>
            </div>
          ) : (
            /* Scalable mockup page viewport */
            <div
              className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            >
              {/* Mock Webpage Wireframe Overlay */}
              <div className="absolute inset-x-0 top-0 h-14 bg-zinc-50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800 flex items-center px-6 gap-4 pointer-events-none">
                <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="ml-auto h-8 w-24 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
              </div>
              
              <div className="absolute top-24 left-12 w-1/3 space-y-4 pointer-events-none">
                <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
              </div>

              {/* Heatmap click dots */}
              {clicks.map((click, idx) => (
                <div
                  key={idx}
                  className="absolute group z-10"
                  style={{
                    left: `${click.x}px`,
                    top: `${click.y}px`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  {/* Outer glow aura */}
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-60 animate-ping"></span>
                  {/* Heatmap center core */}
                  <span className="relative flex h-3.5 w-3.5 rounded-full bg-red-500 border border-white dark:border-zinc-900 shadow"></span>
                  
                  {/* Coordinate hover tooltip */}
                  <div className="absolute hidden group-hover:block bottom-5 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap shadow font-mono z-20 pointer-events-none">
                    X: {click.x}px, Y: {click.y}px
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
