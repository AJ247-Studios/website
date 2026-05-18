"use client";

import { useState, useCallback } from "react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"enter" | "confirm" | "success" | "error">("enter");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleContinue = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStep("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStep("confirm");
    setMessage("");
  }, [email]);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStep("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStep("error");
      setMessage("Something went wrong. Please try again or contact us directly.");
    }
  }, [email]);

  const handleCancel = useCallback(() => {
    setStep("enter");
    setMessage("");
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Unsubscribe
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sorry to see you go. Manage your email preferences below.
          </p>
        </div>

        {step === "success" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{message}</p>
            <a
              href="/"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Return to homepage
            </a>
          </div>
        ) : step === "confirm" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Are you sure?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                You are about to unsubscribe:
              </p>
              <p className="text-slate-900 dark:text-white font-medium mt-1">
                {email}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-3">
                You will no longer receive our pricing guide, tips, or exclusive offers.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                {isLoading ? "Processing..." : "Yes, unsubscribe me"}
              </button>
              <button
                onClick={handleCancel}
                className="w-full px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                No, keep me subscribed
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleContinue} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Continue
              </button>
            </div>
            {(step === "error") && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
            )}
          </form>
        )}

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
          Having trouble?{" "}
          <a href="https://wa.me/48503685377" className="text-blue-600 dark:text-blue-400 hover:underline">
            Message us on WhatsApp
          </a>{" "}
          and we'll remove you manually.
        </p>
      </div>
    </main>
  );
}
