"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
export default function Bookmarks() {
  const q = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const r = await fetch("/api/v1/bookmarks");
      if (!r.ok) throw Error("Unable to load bookmarks");
      return r.json() as Promise<{
        questions: { _id: string; title: string; difficulty: string }[];
      }>;
    },
  });
  return (
    <>
      <header className="page-title">
        <div className="eyebrow">SAVE A QUESTION FOR LATER</div>
        <h1>Your bookmarks</h1>
      </header>
      {q.error && (
        <div role="alert" className="error">
          {q.error.message}
        </div>
      )}
      {q.isLoading ? (
        <div className="notice">Loading…</div>
      ) : q.data?.questions.length ? (
        <div className="question-grid">
          {q.data.questions.map((r) => (
            <Link className="card" key={r._id} href={`/questions/${r._id}`}>
              <span className="badge">{r.difficulty}</span>
              <h3>{r.title}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="notice">
          Bookmark a question from the library to find it here.
        </div>
      )}
    </>
  );
}
