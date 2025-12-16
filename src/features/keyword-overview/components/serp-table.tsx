"use client"

import { ExternalLink } from "lucide-react"
import { getDAColorClass, getTypeBadgeClasses } from "../utils/overview-utils"
import type { SERPResult } from "../types"

interface SERPTableProps {
  results: SERPResult[]
}

export function SERPTable({ results }: SERPTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              URL
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Authority
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Backlinks
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Word Count
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr
              key={result.rank}
              className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                result.isWeak ? "bg-emerald-500/5" : ""
              }`}
            >
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    result.rank <= 3
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {result.rank}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium truncate max-w-xs">
                    {result.title}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    {result.domain}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`text-sm font-medium ${getDAColorClass(result.da)}`}>
                  {result.da}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-slate-300">{result.backlinks}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-slate-300">{result.wordCount.toLocaleString()}</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeClasses(result.type, result.isWeak)}`}
                >
                  {result.type}
                  {result.isWeak && " ✓ Weak"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
