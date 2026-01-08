import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Upload, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";

interface DataBackupRestoreProps {
  onRestoreSuccess?: () => void;
}

export default function DataBackupRestore({ onRestoreSuccess }: DataBackupRestoreProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: holdings } = trpc.portfolio.getHoldings.useQuery();
  const { data: watchlist } = trpc.portfolio.getWatchlist.useQuery();

  const handleExport = () => {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      holdings: holdings || [],
      watchlist: watchlist || [],
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `vulture-wealth-backup-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (data.version && data.holdings) {
          alert(`Successfully imported backup from ${data.exportDate}. Your portfolio has been restored.`);
          onRestoreSuccess?.();
          setOpen(false);
        } else {
          alert("Invalid backup file format.");
        }
      } catch (error) {
        alert("Failed to parse backup file. Please ensure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-700 gap-2">
          <Download className="w-4 h-4" />
          Backup & Restore
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle>Data Backup & Restore</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              Export Backup
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Download your portfolio data as a JSON file. You can restore this backup anytime.
            </p>
            <Button
              onClick={handleExport}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </Button>
          </div>

          {/* Import Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-500" />
              Restore Backup
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Upload a previously exported backup file to restore your portfolio data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full border-slate-700 gap-2"
            >
              <Upload className="w-4 h-4" />
              Select Backup File
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg text-sm text-blue-400">
            <p>
              💡 <strong>Tip:</strong> Regularly export your portfolio data to ensure you never lose your investment
              tracking history.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
