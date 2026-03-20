"use client";

import { useState } from "react";
import { Loader2, Play, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const tables = ["users", "societies", "events", "rsvps", "community_posts", "community_replies", "collab_requests", "collab_responses"];

export default function AdminDatabasePage() {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 20;");
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowCount, setRowCount] = useState(0);

  async function runQuery() {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Query failed");
      } else {
        setResults(data.rows);
        setRowCount(data.rowCount);
        if (data.rows.length > 0) {
          setColumns(Object.keys(data.rows[0]));
        } else {
          setColumns([]);
        }
      }
    } catch {
      setError("Failed to execute query. Server may be unavailable.");
    }
    setLoading(false);
  }

  function loadTable(table: string) {
    setQuery(`SELECT * FROM ${table} LIMIT 50;`);
  }

  return (
    <div>
      <h1
        className="text-4xl font-extrabold text-on-background tracking-tight mb-8"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Database Explorer
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Tables */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-4">
            <h3
              className="text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-3 px-2"
            >
              Tables
            </h3>
            <div className="space-y-1">
              {tables.map((table) => (
                <button
                  key={table}
                  className="w-full text-left text-sm font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-3 py-2.5 transition-colors"
                  onClick={() => loadTable(table)}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main - Query + Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6">
            <div className="flex items-center gap-2 text-sm text-primary mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Only SELECT queries are allowed for safety</span>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-mono text-sm min-h-[100px] resize-y transition-colors"
              placeholder="SELECT * FROM ..."
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={runQuery}
                disabled={loading || !query.trim()}
                className="bg-primary text-white rounded-xl font-semibold px-6 py-2.5 flex items-center gap-2 hover:bg-primary-dim transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run Query
              </button>
              {results && (
                <span className="bg-surface-container-low text-on-surface-variant text-sm font-semibold px-4 py-2 rounded-xl border border-outline-variant/30">
                  {rowCount} rows
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 text-error rounded-xl p-4 text-sm font-semibold">
              {error}
            </div>
          )}

          {results && results.length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low">
                      {columns.map((col) => (
                        <th key={col} className="text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant px-6 py-4 font-mono whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/10">
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-3 text-xs font-mono text-on-surface-variant whitespace-nowrap max-w-[200px] truncate">
                            {row[col] === null ? <span className="text-outline italic">NULL</span> : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && results.length === 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 text-center text-on-surface-variant">
              Query returned no results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
