import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ValuationPanel() {
  const [ticker, setTicker] = useState("");
  const [assetType, setAssetType] = useState<"stock" | "crypto">("stock");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const fetchFinancialsMutation = trpc.valuation.fetchFinancials.useMutation();
  const calculateValuationMutation = trpc.valuation.calculateValuation.useMutation();
  const { data: valuation, isLoading: isLoadingValuation } = trpc.valuation.getValuationHistory.useQuery(
    { ticker: selectedTicker || "" },
    { enabled: !!selectedTicker }
  );

  const handleFetchFinancials = async () => {
    if (!ticker.trim()) return;
    try {
      await fetchFinancialsMutation.mutateAsync({ ticker: ticker.toUpperCase() });
      setSelectedTicker(ticker.toUpperCase());
    } catch (error) {
      console.error("Failed to fetch financials:", error);
    }
  };

  const handleCalculateValuation = async () => {
    if (!selectedTicker) return;
    try {
      await calculateValuationMutation.mutateAsync({
        ticker: selectedTicker,
        assetType,
      });
    } catch (error) {
      console.error("Failed to calculate valuation:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Analyze Stock Valuation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Enter ticker (e.g., AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-slate-800 border-slate-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleFetchFinancials()}
            />
            <Select value={assetType} onValueChange={(value: any) => setAssetType(value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleFetchFinancials}
              disabled={fetchFinancialsMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2"
            >
              {fetchFinancialsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Fetch Financials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Results */}
      {selectedTicker && (
        <>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{selectedTicker} - DCF Valuation</CardTitle>
                <Button
                  onClick={handleCalculateValuation}
                  disabled={calculateValuationMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                >
                  {calculateValuationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Calculate DCF"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {calculateValuationMutation.data ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Intrinsic Value</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      ${calculateValuationMutation.data.intrinsicValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Current Price</p>
                    <p className="text-2xl font-bold">
                      ${calculateValuationMutation.data.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Margin of Safety</p>
                    <p className={`text-2xl font-bold ${calculateValuationMutation.data.marginOfSafety > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {calculateValuationMutation.data.marginOfSafety.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Vulture Status</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {calculateValuationMutation.data.vultureStatus}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Free Cash Flow</p>
                    <p className="text-2xl font-bold">
                      ${(calculateValuationMutation.data.fcf / 1e6).toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Debt/Equity</p>
                    <p className="text-2xl font-bold">
                      {calculateValuationMutation.data.debtToEquity.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  Click "Calculate DCF" to analyze this stock's valuation.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTicker && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-12 text-center">
            <p className="text-slate-400">Enter a ticker and fetch financials to begin valuation analysis.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
