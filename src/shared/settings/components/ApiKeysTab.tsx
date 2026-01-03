"use client"

import { useState } from "react"
import { Copy, RefreshCw, Check, Key, Plus, Trash2, MoreVertical, Calendar, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyToClipboard } from "../utils/settings-utils"

interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  createdAt: string
  lastUsed: string | null
  status: "active" | "revoked"
}

// Mock API keys data
const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production Key",
    key: "sk_live_abc123xyz789def456ghi",
    maskedKey: "sk_live_••••••••••••••••••••",
    createdAt: "Dec 15, 2025",
    lastUsed: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Development Key",
    key: "sk_test_dev987uvw654rst321abc",
    maskedKey: "sk_test_••••••••••••••••••••",
    createdAt: "Nov 20, 2025",
    lastUsed: "5 days ago",
    status: "active",
  },
  {
    id: "3",
    name: "Old Integration",
    key: "sk_live_old111aaa222bbb333ccc",
    maskedKey: "sk_live_••••••••••••••••••••",
    createdAt: "Sep 01, 2025",
    lastUsed: null,
    status: "revoked",
  },
]

export function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const handleCopyKey = async (keyId: string, key: string) => {
    await copyToClipboard(key)
    setCopiedKeyId(keyId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      maskedKey: "sk_live_••••••••••••••••••••",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: null,
      status: "active",
    }
    
    setNewlyCreatedKey(newKey.key)
    setApiKeys(prev => [newKey, ...prev])
    setNewKeyName("")
  }

  const handleRevokeKey = (keyId: string) => {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === keyId ? { ...key, status: "revoked" as const } : key
      )
    )
  }

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  const activeKeys = apiKeys.filter(k => k.status === "active").length

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">API Keys</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your API keys for programmatic access to BlogSpy
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New API Key</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Give your API key a descriptive name to identify its purpose
                  </DialogDescription>
                </DialogHeader>
                
                {newlyCreatedKey ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400 font-medium mb-2">
                        ✓ API Key Created Successfully
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Copy this key now. You won't be able to see it again!
                      </p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={newlyCreatedKey}
                          className="bg-background/50 border-border text-foreground font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyKey("new", newlyCreatedKey)}
                          className="border-border shrink-0"
                        >
                          {copiedKeyId === "new" ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => {
                          setNewlyCreatedKey(null)
                          setIsCreateDialogOpen(false)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Done
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyName" className="text-foreground">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., Production, Development, CI/CD"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          className="bg-input/50 border-border text-foreground"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-border"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateKey}
                        disabled={!newKeyName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Create Key
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{activeKeys}</span> active keys
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{apiKeys.length}</span> total keys
              </span>
            </div>
          </div>

          {/* API Keys List */}
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`p-4 rounded-lg border transition-colors ${
                  apiKey.status === "revoked" 
                    ? "bg-muted/10 border-border opacity-60" 
                    : "bg-muted/30 border-border hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      apiKey.status === "active" 
                        ? "bg-emerald-500/20" 
                        : "bg-muted/30"
                    }`}>
                      <Key className={`h-4 w-4 ${
                        apiKey.status === "active" ? "text-emerald-400" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{apiKey.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {apiKey.createdAt}
                        </span>
                        {apiKey.lastUsed && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              Last used {apiKey.lastUsed}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={apiKey.status === "active" 
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" 
                        : "border-red-500/30 text-red-400 bg-red-500/10"
                      }
                    >
                      {apiKey.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        {apiKey.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="text-amber-400 focus:text-amber-400"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Revoke Key
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={apiKey.maskedKey}
                    className="bg-background/50 border-border text-muted-foreground font-mono text-sm"
                    disabled={apiKey.status === "revoked"}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                    disabled={apiKey.status === "revoked"}
                    className="border-border text-muted-foreground hover:bg-accent shrink-0 bg-transparent"
                  >
                    {copiedKeyId === apiKey.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300 font-medium">Security Best Practices</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                  <li>Never expose API keys in client-side code</li>
                  <li>Use environment variables for key storage</li>
                  <li>Rotate keys regularly and revoke unused ones</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BYOK Card */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <Key className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">Bring Your Own Key (BYOK)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Run out of credits? Use your own OpenAI API key to continue using AI features without limits.
              </p>
              <Button variant="link" className="px-0 h-auto text-emerald-400 hover:text-emerald-300 mt-2">
                Learn more about BYOK →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
