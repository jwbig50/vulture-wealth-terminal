import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, BookOpen } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function InsightsPanel() {
  const [activeTab, setActiveTab] = useState<"analysis" | "education" | "assessment">("analysis");
  const [selectedTopic, setSelectedTopic] = useState<string>("dcf");

  const analysisQuery = trpc.insights.analyzePortfolio.useQuery();
  const assessmentQuery = trpc.insights.getVultureAssessment.useQuery();
  const educationQuery = trpc.insights.getEducationalContent.useQuery(
    { topic: selectedTopic },
    { enabled: activeTab === "education" }
  );

  const topics = [
    { value: "dcf", label: "DCF Valuation" },
    { value: "mos", label: "Margin of Safety" },
    { value: "cagr", label: "CAGR" },
    { value: "moat", label: "Economic Moat" },
    { value: "dca", label: "Dollar-Cost Averaging" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { id: "analysis", label: "Portfolio Analysis", icon: Brain },
          { id: "assessment", label: "Vulture Assessment", icon: Brain },
          { id: "education", label: "Education", icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
              activeTab === id
                ? "border-b-2 border-emerald-500 text-emerald-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Portfolio Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          {analysisQuery.isLoading ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </CardContent>
            </Card>
          ) : analysisQuery.data ? (
            <>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-500" />
                    Portfolio Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Streamdown>{typeof analysisQuery.data.analysis === 'string' ? analysisQuery.data.analysis : ''}</Streamdown>
                </CardContent>
              </Card>

              {analysisQuery.data.recommendations.length > 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisQuery.data.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-emerald-500 font-bold">{i + 1}.</span>
                          <span className="text-slate-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Vulture Assessment Tab */}
      {activeTab === "assessment" && (
        <div className="space-y-4">
          {assessmentQuery.isLoading ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </CardContent>
            </Card>
          ) : assessmentQuery.data ? (
            <>
              <Card
                className={`border-2 ${
                  assessmentQuery.data.assessment === "VULTURE"
                    ? "border-emerald-500 bg-emerald-500/5"
                    : assessmentQuery.data.assessment === "SHEEP"
                      ? "border-red-500 bg-red-500/5"
                      : "border-yellow-500 bg-yellow-500/5"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-3xl">
                    {assessmentQuery.data.assessment === "VULTURE"
                      ? "🦅 VULTURE INVESTOR"
                      : assessmentQuery.data.assessment === "SHEEP"
                        ? "🐑 SHEEP INVESTOR"
                        : "⚖️ " + assessmentQuery.data.assessment}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg text-slate-300">{assessmentQuery.data.message}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Average Margin of Safety</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {assessmentQuery.data.avgMOS}%
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Investor Score</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {assessmentQuery.data.score}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">What This Means</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 space-y-2">
                  {assessmentQuery.data.assessment === "VULTURE" ? (
                    <>
                      <p>
                        You're practicing disciplined value investing. You're buying with a strong margin of safety,
                        which is the cornerstone of successful long-term investing.
                      </p>
                      <p>Keep this up! Your patience and discipline will compound over time.</p>
                    </>
                  ) : assessmentQuery.data.assessment === "SHEEP" ? (
                    <>
                      <p>
                        You're buying at or above fair value. Consider waiting for market dips to build positions with
                        a better margin of safety.
                      </p>
                      <p>Channel your inner Vulture and be patient for better opportunities!</p>
                    </>
                  ) : (
                    <p>You're on the right track. Continue to look for opportunities with better margins of safety.</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Select a Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setSelectedTopic(topic.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedTopic === topic.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {educationQuery.isLoading ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </CardContent>
            </Card>
          ) : educationQuery.data ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  {educationQuery.data.topic}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Streamdown>{typeof educationQuery.data.content === 'string' ? educationQuery.data.content : ''}</Streamdown>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
