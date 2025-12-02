"use client";
import { useState, useEffect } from "react";
import { Sparkles, History, Brain, User, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface Perspectives {
  stoic: string;
  coach: string;
  friend: string;
}

interface Entry {
  id: number;
  content: string;
  perspectives: Perspectives;
  created_at: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("friend");

  // Fetch entries on load
  useEffect(() => {
    fetch("http://localhost:8000/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      // Send text as a query param for simplicity (Body is better for large text, but this works for MVP)
      const res = await fetch(`http://localhost:8000/entries?entry_text=${encodeURIComponent(input)}`, {
        method: "POST",
      });
      const newEntry = await res.json();
      setEntries([newEntry, ...entries]);
      setInput("");
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <header className="mb-12 text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Mind Journal
        </h1>
        <p className="text-gray-400">AI-Powered Reflection with Contextual Memory</p>
      </header>

      {/* Input Area */}
      <section className="mb-12 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 shadow-xl backdrop-blur-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind? (I will remember similar past events...)"
          className="w-full bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-lg min-h-[120px]"
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-600">Powered by Llama 3.2 & pgvector</span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Analyzing..." : "Reflect"}
          </button>
        </div>
      </section>

      {/* Timeline */}
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-400 flex items-center gap-2">
          <History size={20} /> Your Timeline
        </h2>

        {entries.map((entry) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={entry.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="p-6 border-b border-neutral-800">
              <p className="text-lg text-gray-200 leading-relaxed">{entry.content}</p>
              <p className="text-xs text-gray-600 mt-4">
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>

            {/* Board of Directors Tabs */}
            <div className="bg-black/20 p-4">
              <div className="flex gap-4 mb-4 text-sm font-medium">
                <button
                  onClick={() => setActiveTab('stoic')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${activeTab === 'stoic' ? 'bg-amber-900/30 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Brain size={16} /> The Stoic
                </button>
                <button
                  onClick={() => setActiveTab('coach')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${activeTab === 'coach' ? 'bg-red-900/30 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Dumbbell size={16} /> The Coach
                </button>
                <button
                  onClick={() => setActiveTab('friend')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${activeTab === 'friend' ? 'bg-green-900/30 text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <User size={16} /> The Friend
                </button>
              </div>

              <div className="pl-4 border-l-2 border-gray-800 italic text-gray-400 min-h-[40px]">
                {activeTab === 'stoic' && entry.perspectives.stoic}
                {activeTab === 'coach' && entry.perspectives.coach}
                {activeTab === 'friend' && entry.perspectives.friend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
