import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Plus, Eye, BarChart3, Target, Brain, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import PortfolioOverview from "@/components/PortfolioOverview";
import WatchlistPanel from "@/components/WatchlistPanel";
import ValuationPanel from "@/components/ValuationPanel";
import AllocationPanel from "@/components/AllocationPanel";
import InsightsPanel from "@/components/InsightsPanel";
import DataBackupRestore from "@/components/DataBackupRestore";
import BenchmarkComparison from "@/components/BenchmarkComparison";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <TrendingUp className="w-12 h-12 text-emerald-500" />
          </div>
          <p className="text-slate-400">Loading Vulture Wealth Terminal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-50 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vulture Wealth Terminal</h1>
              <p className="text-xs text-slate-500">Investment Analysis & Portfolio Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Welcome, {user.name}</span>
            <DataBackupRestore />
            <Button variant="outline" size="sm" className="border-slate-700">
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 mb-8">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="valuation" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Portfolio Overview</h2>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2">
                <Plus className="w-4 h-4" />
                Add Position
              </Button>
            </div>
            <PortfolioOverview />
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Watchlist</h2>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2">
                <Plus className="w-4 h-4" />
                Add to Watchlist
              </Button>
            </div>
            <WatchlistPanel />
          </TabsContent>

          {/* Valuation Tab */}
          <TabsContent value="valuation" className="space-y-6">
            <h2 className="text-2xl font-bold">Valuation Analysis</h2>
            <ValuationPanel />
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <h2 className="text-2xl font-bold">Portfolio Allocation</h2>
            <AllocationPanel />
          </TabsContent>

          {/* Benchmarks Tab */}
          <TabsContent value="benchmarks" className="space-y-6">
            <h2 className="text-2xl font-bold">Benchmark Comparison</h2>
            <BenchmarkComparison />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-2xl font-bold">AI Insights & Analysis</h2>
            <InsightsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
