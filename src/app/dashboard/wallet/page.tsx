"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

// Mock wallet data
const mockWallet = {
  balance: 125000,
  pendingBalance: 45000,
  totalEarned: 580000,
  totalSpent: 320000,
};

// Mock transactions
const mockTransactions = [
  {
    id: "txn-1",
    type: "ESCROW_RELEASE",
    amount: 25000,
    fee: 1250,
    status: "COMPLETED",
    description: "Payment released for Order #ZEE-ABC123",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    balanceBefore: 100000,
    balanceAfter: 125000,
  },
  {
    id: "txn-2",
    type: "DEPOSIT",
    amount: 50000,
    fee: 0,
    status: "COMPLETED",
    description: "Wallet deposit via Paystack",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    balanceBefore: 50000,
    balanceAfter: 100000,
  },
  {
    id: "txn-3",
    type: "ESCROW_HOLD",
    amount: 45000,
    fee: 2250,
    status: "PENDING",
    description: "Payment held for Order #ZEE-DEF456",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    balanceBefore: 100000,
    balanceAfter: 100000,
  },
  {
    id: "txn-4",
    type: "PURCHASE",
    amount: 35000,
    fee: 1750,
    status: "COMPLETED",
    description: "Purchase: Logo Design Package",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    balanceBefore: 135000,
    balanceAfter: 100000,
  },
  {
    id: "txn-5",
    type: "WITHDRAWAL",
    amount: 25000,
    fee: 100,
    status: "COMPLETED",
    description: "Withdrawal to Bank Account",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    balanceBefore: 160000,
    balanceAfter: 135000,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    case "WITHDRAWAL":
      return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
    case "ESCROW_HOLD":
      return <Shield className="w-5 h-5 text-blue-600" />;
    case "ESCROW_RELEASE":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "REFUND":
      return <ArrowDownLeft className="w-5 h-5 text-purple-600" />;
    case "PURCHASE":
      return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    default:
      return <DollarSign className="w-5 h-5 text-gray-600" />;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    ESCROW_HOLD: "Escrow Hold",
    ESCROW_RELEASE: "Escrow Release",
    REFUND: "Refund",
    PURCHASE: "Purchase",
  };
  return labels[type] || type;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function WalletPage() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const wallet = mockWallet;
  const transactions = mockTransactions.filter(
    (txn) => filterType === "all" || txn.type === filterType
  );

  const handleDeposit = () => {
    // Mock deposit - would call API
    alert(`Initiating deposit of ${formatCurrency(parseFloat(depositAmount))}`);
    setShowDepositDialog(false);
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    // Mock withdraw - would call API
    alert(`Initiating withdrawal of ${formatCurrency(parseFloat(withdrawAmount))}`);
    setShowWithdrawDialog(false);
    setWithdrawAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your funds and view transaction history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(wallet.pendingBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">In escrow</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {formatCurrency(wallet.totalEarned)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">
                  {formatCurrency(wallet.totalSpent)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Add funds to your wallet using Paystack
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="deposit-amount">Amount (NGN)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Minimum deposit: ₦100
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) < 100}
              >
                Continue to Paystack
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Withdraw to your bank account
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available: {formatCurrency(wallet.balance)}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">Withdrawal Fee: ₦100</p>
                <p className="text-muted-foreground">Processing time: 1-2 business days</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > wallet.balance}
              >
                Request Withdrawal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "DEPOSIT" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("DEPOSIT")}
            >
              Deposits
            </Button>
            <Button
              variant={filterType === "ESCROW_RELEASE" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("ESCROW_RELEASE")}
            >
              Earnings
            </Button>
            <Button
              variant={filterType === "WITHDRAWAL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("WITHDRAWAL")}
            >
              Withdrawals
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    ["DEPOSIT", "ESCROW_RELEASE", "REFUND"].includes(transaction.type)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {["DEPOSIT", "ESCROW_RELEASE", "REFUND"].includes(transaction.type) ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    {getStatusBadge(transaction.status)}
                    {transaction.fee > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Fee: {formatCurrency(transaction.fee)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
