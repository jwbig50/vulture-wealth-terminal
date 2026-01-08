import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState } from "react";
import AddPositionDialog from "./AddPositionDialog";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444", "#f97316"];

export default function PortfolioOverview() {
  const { data: summary, isLoading, refetch } = trpc.portfolio.getPortfolioSummary.useQuery();
  const [editingTicker, setEditingTicker] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-12 text-center">
          <p className="text-slate-400 mb-4">No holdings yet. Add your first position to get started.</p>
          <AddPositionDialog onSuccess={() => refetch()} />
        </CardContent>
      </Card>
    );
  }

  const chartData = summary.holdings.map(h => ({
    name: h.ticker,
    value: h.marketValue,
  }));

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Portfolio Metrics</h3>
        <AddPositionDialog onSuccess={handleRefresh} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Cost Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${summary.totalCostBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${summary.totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${summary.totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-sm ${summary.totalGainPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {summary.totalGainPercent >= 0 ? "+" : ""}{summary.totalGainPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.holdings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Holdings List */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.holdings.map((holding, idx) => (
              <div key={holding.ticker} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold">{holding.ticker}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {(holding.marketValue / summary.totalValue * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Position Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-slate-700 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                  <th className="text-right py-3 px-4 font-semibold">Shares</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Cost</th>
                  <th className="text-right py-3 px-4 font-semibold">Current Price</th>
                  <th className="text-right py-3 px-4 font-semibold">Market Value</th>
                  <th className="text-right py-3 px-4 font-semibold">Gain %</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.holdings.map((holding) => (
                  <tr key={holding.ticker} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">{holding.ticker}</td>
                    <td className="text-right py-3 px-4">{holding.shares.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${holding.averageCostBasis.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${holding.currentPrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      ${holding.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold ${holding.gainPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {holding.gainPercent >= 0 ? "+" : ""}{holding.gainPercent.toFixed(2)}%
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-200"
                          onClick={() => setEditingTicker(holding.ticker)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
