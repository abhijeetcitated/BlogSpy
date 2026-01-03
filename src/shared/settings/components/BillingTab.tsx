"use client"

import { useState } from "react"
import { CreditCard, Download, FileText, ExternalLink, Plus, Trash2, Check, Building, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProfile, useCredits } from "@/hooks/use-user"

// Mock invoice data - replace with real API data
const MOCK_INVOICES = [
  { id: "INV-001", date: "Dec 01, 2025", amount: 29.00, status: "paid", plan: "Pro Plan" },
  { id: "INV-002", date: "Nov 01, 2025", amount: 29.00, status: "paid", plan: "Pro Plan" },
  { id: "INV-003", date: "Oct 01, 2025", amount: 29.00, status: "paid", plan: "Pro Plan" },
  { id: "INV-004", date: "Sep 01, 2025", amount: 9.00, status: "paid", plan: "Free Trial" },
]

// Mock payment methods
interface PaymentMethod {
  id: string
  type: "card" | "upi"
  last4: string
  brand: string
  expiry?: string
  isDefault: boolean
}

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "1", type: "card", last4: "4242", brand: "Visa", expiry: "12/26", isDefault: true },
  { id: "2", type: "card", last4: "5555", brand: "Mastercard", expiry: "09/27", isDefault: false },
]

export function BillingTab() {
  const { plan, isLoading: profileLoading } = useProfile()
  const { credits, creditPercentage, daysUntilReset } = useCredits()
  
  const isLoading = profileLoading
  const percentage = creditPercentage()
  const remaining = credits.remaining
  const renewsInDays = daysUntilReset()

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS)
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false)
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    taxId: "",
  })
  
  // Plan display info
  const planInfo = {
    FREE: { name: "Free Plan", price: 0 },
    PRO: { name: "Pro Plan", price: 29 },
    ENTERPRISE: { name: "Enterprise Plan", price: 99 },
  }
  
  const currentPlan = planInfo[plan as keyof typeof planInfo] || planInfo.FREE

  // Payment method handlers
  const handleAddCard = async () => {
    setIsAddingCard(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      last4: cardData.number.slice(-4) || "0000",
      brand: cardData.number.startsWith("4") ? "Visa" : "Mastercard",
      expiry: cardData.expiry,
      isDefault: paymentMethods.length === 0,
    }
    
    setPaymentMethods(prev => [...prev, newCard])
    setIsAddingCard(false)
    setIsAddCardDialogOpen(false)
    setCardData({ number: "", expiry: "", cvc: "", name: "" })
  }

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(prev => 
      prev.map(pm => ({ ...pm, isDefault: pm.id === cardId }))
    )
  }

  const handleDeleteCard = (cardId: string) => {
    setPaymentMethods(prev => {
      const filtered = prev.filter(pm => pm.id !== cardId)
      // If we deleted the default, make the first one default
      if (filtered.length > 0 && !filtered.some(pm => pm.isDefault)) {
        filtered[0].isDefault = true
      }
      return filtered
    })
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Current Plan</CardTitle>
          <CardDescription className="text-muted-foreground">Your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{currentPlan.name}</p>
                <p className="text-muted-foreground">
                  {currentPlan.price > 0 ? `$${currentPlan.price}/month • Billed monthly` : "Free forever"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent bg-transparent"
            >
              {plan === "FREE" ? "Upgrade Plan" : "Manage Subscription"}
            </Button>
          </div>

          {/* Usage Meter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Credits Usage</span>
              <span className="text-muted-foreground text-sm">Renews in {renewsInDays} days</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {credits.used.toLocaleString()} of {credits.total.toLocaleString()} credits used
                </span>
                <span className="text-emerald-400 font-medium">{percentage}%</span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-3" />
                <div
                  className="absolute inset-0 h-3 rounded-full bg-linear-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${percentage}%`, opacity: 0.2 }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{remaining.toLocaleString()} credits remaining this billing cycle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Callout - Show only for non-enterprise */}
      {plan !== "ENTERPRISE" && (
        <Card className="bg-linear-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-amber-300 text-lg">Need more credits?</p>
                <p className="text-muted-foreground">
                  Upgrade to {plan === "FREE" ? "Pro" : "Enterprise"} for{" "}
                  <span className="text-amber-400 font-semibold">
                    {plan === "FREE" ? "2,000" : "10,000"} credits
                  </span>{" "}
                  per month
                </p>
              </div>
              <Button className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Payment Methods</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your payment methods for subscriptions
              </CardDescription>
            </div>
            <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Payment Method</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter your card details to add a new payment method
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Cardholder Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={cardData.name}
                      onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-input/50 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Card Number</Label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={cardData.number}
                      onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                      className="bg-input/50 border-border text-foreground font-mono"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Expiry Date</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                        className="bg-input/50 border-border text-foreground"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">CVC</Label>
                      <Input
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) => setCardData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        className="bg-input/50 border-border text-foreground"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddCardDialogOpen(false)
                      setCardData({ number: "", expiry: "", cvc: "", name: "" })
                    }}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCard}
                    disabled={isAddingCard || !cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isAddingCard && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Card
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    pm.isDefault 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg ${pm.isDefault ? "bg-emerald-500/20" : "bg-muted"} flex items-center justify-center`}>
                      <CreditCard className={`h-5 w-5 ${pm.isDefault ? "text-emerald-400" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-foreground font-medium">{pm.brand} •••• {pm.last4}</p>
                        {pm.isDefault && (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Expires {pm.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(pm.id)}
                        className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                      >
                        Set Default
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Remove payment method?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This will remove {pm.brand} •••• {pm.last4} from your account. 
                            {pm.isDefault && " Another card will be set as default."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCard(pm.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No payment methods added</p>
              <Button 
                onClick={() => setIsAddCardDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Card
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Billing Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your billing address and tax information
              </CardDescription>
            </div>
            <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Edit Billing Information</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Update your billing address for invoices
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
                  <div className="space-y-2">
                    <Label className="text-foreground">Address Line 1</Label>
                    <Input
                      placeholder="123 Main Street"
                      value={billingAddress.line1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
                      className="bg-input/50 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Address Line 2 (Optional)</Label>
                    <Input
                      placeholder="Apt, Suite, Building"
                      value={billingAddress.line2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, line2: e.target.value }))}
                      className="bg-input/50 border-border text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">City</Label>
                      <Input
                        placeholder="Mumbai"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="bg-input/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">State</Label>
                      <Input
                        placeholder="Maharashtra"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="bg-input/50 border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Postal Code</Label>
                      <Input
                        placeholder="400001"
                        value={billingAddress.postalCode}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="bg-input/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Country</Label>
                      <Input
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="bg-input/50 border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">GST/Tax ID (Optional)</Label>
                    <Input
                      placeholder="22AAAAA0000A1Z5"
                      value={billingAddress.taxId}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, taxId: e.target.value }))}
                      className="bg-input/50 border-border text-foreground font-mono"
                    />
                    <p className="text-xs text-muted-foreground">For business invoices with GST</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBillingDialogOpen(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setIsBillingDialogOpen(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save Address
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {billingAddress.line1 ? (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-foreground">{billingAddress.line1}</p>
              {billingAddress.line2 && <p className="text-foreground">{billingAddress.line2}</p>}
              <p className="text-muted-foreground">
                {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{billingAddress.country}</p>
              {billingAddress.taxId && (
                <p className="text-muted-foreground mt-2 font-mono text-sm">
                  GST: {billingAddress.taxId}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No billing address set</p>
              <Button 
                variant="link"
                onClick={() => setIsBillingDialogOpen(true)}
                className="text-emerald-400 mt-1"
              >
                Add billing address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Invoice History</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and download your past invoices
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-border text-muted-foreground hover:bg-accent bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>Invoice</span>
              <span>Date</span>
              <span>Plan</span>
              <span>Amount</span>
              <span className="text-right">Actions</span>
            </div>
            
            {/* Invoice Rows */}
            {MOCK_INVOICES.map((invoice) => (
              <div 
                key={invoice.id}
                className="grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-accent/30 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{invoice.id}</span>
                </div>
                <span className="text-muted-foreground">{invoice.date}</span>
                <span className="text-foreground">{invoice.plan}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">${invoice.amount.toFixed(2)}</span>
                  <Badge 
                    variant="outline" 
                    className={invoice.status === "paid" 
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" 
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {MOCK_INVOICES.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No invoices yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
