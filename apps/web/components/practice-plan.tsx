"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
type Insights = {
  topics: { topic: string; score: number; attempts: number }[];
  recommendations: { topic: string; reason: string; action: string }[];
  questions: { _id: string; title: string; difficulty: string }[];
  method: string;
};
export default function PracticePlan() {
  const q = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const r = await fetch("/api/v1/insights");
      if (!r.ok) throw Error("Unable to load your practice plan");
      return r.json() as Promise<Insights>;
    },
  });
  return (
    <>
      <header className="page-title">
        <div className="eyebrow">TURN REFLECTION INTO DIRECTION</div>
        <h1>Your practice plan</h1>
        <p>Simple recommendations based on your evaluated topic history.</p>
      </header>
      {q.error && (
        <div role="alert" className="error">
          {q.error.message}
        </div>
      )}
      {q.isLoading && <div className="notice">Loading your practice plan…</div>}
      {q.data && (
        <>
          <div className="question-grid">
            {q.data.recommendations.map((r) => (
              <article key={r.topic} className="card">
                <span className="badge">{r.topic}</span>
                <h2 style={{ marginTop: 16 }}>{r.action}</h2>
                <p>{r.reason}</p>
              </article>
            ))}
          </div>
          {!q.data.recommendations.length && (
            <div className="notice">
              Complete an interview to build your personalized plan.
            </div>
          )}
          <div className="section-heading">
            <h2>Questions to explore</h2>
          </div>
          <div className="question-grid">
            {q.data.questions.map((r) => (
              <Link className="card" key={r._id} href={`/questions/${r._id}`}>
                <span className="badge">{r.difficulty}</span>
                <h3 style={{ marginTop: 14 }}>{r.title}</h3>
              </Link>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 24 }}>
            {q.data.method}
          </p>
        </>
      )}
    </>
  );
}
