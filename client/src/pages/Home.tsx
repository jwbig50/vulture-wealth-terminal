import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

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

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Vulture Wealth Terminal</h1>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Investment Analysis & Portfolio Management
            <span className="text-emerald-500"> Redefined</span>
          </h2>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Combine real-time market data with fundamental valuation analysis. Track your portfolio with precision, analyze valuations with DCF models, and make confident investment decisions backed by data.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-6 text-lg"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <h3 className="text-3xl font-bold mb-12">Powerful Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Real-Time Portfolio Tracking",
              description: "Monitor your holdings with live price updates and instant performance metrics.",
            },
            {
              title: "DCF Valuation Engine",
              description: "Calculate intrinsic value with sensitivity analysis and margin of safety.",
            },
            {
              title: "CAGR Velocity Metrics",
              description: "Track compound annual growth rates across 1M, 1Y, 3Y, and 5Y timeframes.",
            },
            {
              title: "Dynamic DCA Management",
              description: "Edit positions and watch all metrics update in real-time as you dollar-cost average.",
            },
            {
              title: "Smart Allocation Strategies",
              description: "Equal weight, value-weighted, or high-conviction portfolio allocation.",
            },
            {
              title: "Watchlist to Portfolio Pipeline",
              description: "Monitor stocks before adding them to your active holdings.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg hover:border-emerald-500/50 transition-colors"
            >
              <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800 text-center">
        <h3 className="text-3xl font-bold mb-6">Ready to become a Vulture investor?</h3>
        <p className="text-xl text-slate-400 mb-8">
          Start analyzing your portfolio with institutional-grade tools.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-6 text-lg"
        >
          Sign In Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500">
          <p>&copy; 2026 Vulture Wealth Terminal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
