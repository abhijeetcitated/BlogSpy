"use client"

import { useState } from "react"
import { Copy, RefreshCw, Check, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MOCK_API_KEY, MASKED_API_KEY } from "../constants"
import { copyToClipboard } from "../utils/settings-utils"

export function ApiKeysTab() {
  const [apiKeyCopied, setApiKeyCopied] = useState(false)

  const handleCopyApiKey = async () => {
    await copyToClipboard(MOCK_API_KEY)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">API Keys</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your API keys for programmatic access to BlogSpy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Live API Key</Label>
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Active</span>
            </div>
            <div className="flex gap-2">
              <Input
                readOnly
                value={MASKED_API_KEY}
                className="bg-slate-900/50 border-slate-700 text-slate-400 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyApiKey}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0 bg-transparent"
              >
                {apiKeyCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Keep your API key secret. Do not share it or expose it in client-side code.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300 font-medium">Bring Your Own Key</p>
                <p className="text-sm text-slate-400 mt-1">
                  If you run out of credits, BlogSpy allows you to use your own OpenAI API key to continue using AI features.
                </p>
                <Button variant="link" className="px-0 h-auto text-emerald-400 hover:text-emerald-300 mt-2">
                  Learn more about BYOK
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
