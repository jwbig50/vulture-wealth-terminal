import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AllocationPanel() {
  const [strategy, setStrategy] = useState<"equal" | "value-weighted" | "conviction">("equal");
  const [monthlyAmount, setMonthlyAmount] = useState("2100");

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Allocation Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                value: "equal",
                label: "Equal Weight",
                description: "Split evenly across all holdings",
              },
              {
                value: "value-weighted",
                label: "Value-Weighted",
                description: "Weight by Margin of Safety",
              },
              {
                value: "conviction",
                label: "High Conviction",
                description: "Top 5 get 15%, rest 5%",
              },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStrategy(s.value as any)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  strategy === s.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <p className="font-bold mb-1">{s.label}</p>
                <p className="text-sm text-slate-400">{s.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DCA Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Dollar-Cost Averaging (DCA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Monthly DCA Amount</label>
            <div className="flex gap-2">
              <span className="text-2xl font-bold text-slate-400">$</span>
              <Input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-2xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Brokerage Account</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${(parseFloat(monthlyAmount) * 0.7).toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-700/50">
              <p className="text-xs text-slate-400 mb-1">Roth IRA</p>
              <p className="text-2xl font-bold text-blue-400">
                ${(parseFloat(monthlyAmount) * 0.3).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Breakdown */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Allocation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-slate-400 text-sm mb-4">
              Your holdings will be allocated according to the {strategy} strategy.
            </p>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400">
                Set up your allocation strategy and DCA amount to automatically distribute your monthly investment across your portfolio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-6">
          Save Allocation
        </Button>
        <Button variant="outline" className="flex-1 border-slate-700">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
