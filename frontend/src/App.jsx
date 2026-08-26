import { useState } from "react";

const apiBaseUrl = "/api";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion || isLoading) {
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: cleanQuestion,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.answer || "The request could not be completed."
        );
      }

      setResult(body);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to the assistant."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = question.trim() && !isLoading;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Grounded catalogue search
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Product Knowledge Assistant
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            Ask about product prices, stock, warranties, or links. Answers
            come only from the supplied catalogue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="question"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Your question
          </label>
          <textarea
            id="question"
            name="question"
            rows="4"
            maxLength="500"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What is the warranty on the Amazfit Bip 5?"
            className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              {question.length}/500
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Searching..." : "Ask question"}
            </button>
          </div>
        </form>

        {result && (
          <div
            className={`mt-8 rounded-2xl border p-5 ${
              result.found
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
            aria-live="polite"
          >
            <p
              className={`mb-2 text-sm font-semibold ${
                result.found
                  ? "text-emerald-800"
                  : "text-amber-800"
              }`}
            >
              {result.found ? "Product found" : "Not available"}
            </p>
            <p className="whitespace-pre-line text-base leading-7 text-slate-800">
              {result.answer}
            </p>
          </div>
        )}

        {error && (
          <div
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
            role="alert"
          >
            <p className="mb-2 text-sm font-semibold text-red-800">
              Request failed
            </p>
            <p className="text-base leading-7 text-red-700">{error}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
