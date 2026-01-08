import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WatchlistPanel() {
  const { data: watchlist, isLoading, refetch } = trpc.portfolio.getWatchlist.useQuery();
  const [newTicker, setNewTicker] = useState("");
  const [assetType, setAssetType] = useState<"stock" | "crypto">("stock");
  const addMutation = trpc.portfolio.addToWatchlist.useMutation({
    onSuccess: () => {
      setNewTicker("");
      refetch();
    },
  });
  const removeMutation = trpc.portfolio.removeFromWatchlist.useMutation({
    onSuccess: () => refetch(),
  });

  const handleAdd = () => {
    if (!newTicker.trim()) return;
    addMutation.mutate({ ticker: newTicker.toUpperCase(), assetType });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add to Watchlist Form */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Add to Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter ticker (e.g., AAPL, BTC)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              className="bg-slate-800 border-slate-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
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
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      {watchlist && watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <Card key={item.ticker} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.ticker}</CardTitle>
                    <p className="text-xs text-slate-400 capitalize">{item.assetType}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMutation.mutate({ ticker: item.ticker })}
                    disabled={removeMutation.isPending}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                    View Analysis
                  </Button>
                  <Button variant="outline" className="w-full border-slate-700">
                    Add to Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-12 text-center">
            <p className="text-slate-400">No items in watchlist yet. Add one to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
