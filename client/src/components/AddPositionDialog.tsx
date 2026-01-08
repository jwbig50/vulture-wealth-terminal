import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2 } from "lucide-react";

interface AddPositionDialogProps {
  onSuccess?: () => void;
}

export default function AddPositionDialog({ onSuccess }: AddPositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [assetType, setAssetType] = useState<"stock" | "crypto">("stock");

  const mutation = trpc.portfolio.updatePosition.useMutation({
    onSuccess: () => {
      setTicker("");
      setShares("");
      setPurchasePrice("");
      setAssetType("stock");
      setOpen(false);
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!ticker || !shares || !purchasePrice) {
      alert("Please fill in all fields");
      return;
    }

    mutation.mutate({
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
      assetType,
    });
  };

  const totalCost = parseFloat(shares || "0") * parseFloat(purchasePrice || "0");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2">
          <Plus className="w-4 h-4" />
          Add Position
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle>Add or Update Position</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticker Input */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Ticker Symbol</label>
            <Input
              placeholder="e.g., AAPL or BTC"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Asset Type */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Asset Type</label>
            <Select value={assetType} onValueChange={(value: any) => setAssetType(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shares */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Number of Shares</label>
            <Input
              type="number"
              placeholder="0.00"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              step="0.01"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Purchase Price per Share</label>
            <Input
              type="number"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              step="0.01"
            />
          </div>

          {/* Total Cost Preview */}
          {shares && purchasePrice && (
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Total Investment</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Position"
              )}
            </Button>
          </div>

          {mutation.error && (
            <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg text-red-400 text-sm">
              {mutation.error.message}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
