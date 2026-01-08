import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface BenchmarkComparisonProps {
  portfolioCAGR1Y?: number;
  portfolioCAGR3Y?: number;
  portfolioCAGR5Y?: number;
}

export default function BenchmarkComparison({
  portfolioCAGR1Y = 0,
  portfolioCAGR3Y = 0,
  portfolioCAGR5Y = 0,
}: BenchmarkComparisonProps) {
  const { data, isLoading } = trpc.benchmark.getBenchmarks.useQuery({
    portfolioCAGR1Y,
    portfolioCAGR3Y,
    portfolioCAGR5Y,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for charts
  const cagr1YData = [
    { name: "Your Portfolio", value: portfolioCAGR1Y },
    ...data.benchmarks.map((b) => ({
      name: b.name,
      value: b.cagr1Y || 0,
    })),
  ];

  const cagr3YData = [
    { name: "Your Portfolio", value: portfolioCAGR3Y },
    ...data.benchmarks.map((b) => ({
      name: b.name,
      value: b.cagr3Y || 0,
    })),
  ];

  const cagr5YData = [
    { name: "Your Portfolio", value: portfolioCAGR5Y },
    ...data.benchmarks.map((b) => ({
      name: b.name,
      value: b.cagr5Y || 0,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.benchmarks.map((benchmark) => {
          const cagr1Y = benchmark.cagr1Y || 0;
          const isPositive = cagr1Y >= 0;

          return (
            <Card key={benchmark.ticker} className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{benchmark.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Current Price</p>
                  <p className="text-2xl font-bold">${benchmark.currentPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">1-Year CAGR</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}{cagr1Y.toFixed(2)}%
                    </p>
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 1-Year CAGR Comparison */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>1-Year CAGR Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cagr1YData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value) => `${(value as number).toFixed(2)}%`}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3-Year CAGR Comparison */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>3-Year CAGR Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cagr3YData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value) => `${(value as number).toFixed(2)}%`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5-Year CAGR Comparison */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>5-Year CAGR Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cagr5YData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value) => `${(value as number).toFixed(2)}%`}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Detailed Benchmark Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-semibold">Benchmark</th>
                  <th className="text-right py-3 px-4 font-semibold">Current</th>
                  <th className="text-right py-3 px-4 font-semibold">1M CAGR</th>
                  <th className="text-right py-3 px-4 font-semibold">1Y CAGR</th>
                  <th className="text-right py-3 px-4 font-semibold">3Y CAGR</th>
                  <th className="text-right py-3 px-4 font-semibold">5Y CAGR</th>
                </tr>
              </thead>
              <tbody>
                {data.benchmarks.map((benchmark) => (
                  <tr key={benchmark.ticker} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold">{benchmark.name}</td>
                    <td className="text-right py-3 px-4">${benchmark.currentPrice.toLocaleString()}</td>
                    <td className={`text-right py-3 px-4 ${(benchmark.cagr1M || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(benchmark.cagr1M || 0) >= 0 ? "+" : ""}{(benchmark.cagr1M || 0).toFixed(2)}%
                    </td>
                    <td className={`text-right py-3 px-4 ${(benchmark.cagr1Y || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(benchmark.cagr1Y || 0) >= 0 ? "+" : ""}{(benchmark.cagr1Y || 0).toFixed(2)}%
                    </td>
                    <td className={`text-right py-3 px-4 ${(benchmark.cagr3Y || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(benchmark.cagr3Y || 0) >= 0 ? "+" : ""}{(benchmark.cagr3Y || 0).toFixed(2)}%
                    </td>
                    <td className={`text-right py-3 px-4 ${(benchmark.cagr5Y || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(benchmark.cagr5Y || 0) >= 0 ? "+" : ""}{(benchmark.cagr5Y || 0).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-400">📊 Benchmark Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-300 space-y-2">
          <p>
            <strong>S&P 500:</strong> The broad market index representing 500 large-cap U.S. companies. A solid benchmark for overall market performance.
          </p>
          <p>
            <strong>Gold:</strong> A traditional safe-haven asset that often moves inversely to stocks. Good for portfolio diversification.
          </p>
          <p>
            <strong>Bitcoin:</strong> A volatile digital asset with high growth potential but significant risk. Compare your portfolio's risk-adjusted returns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
