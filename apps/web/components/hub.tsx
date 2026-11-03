"use client";
import Link from "next/link";
import PracticePlan from "./practice-plan";
import Bookmarks from "./bookmarks";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  LayoutDashboard,
  LogOut,
  Moon,
  Play,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  UserRound,
} from "lucide-react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  preferredRole: string;
};
type Topic = { _id: string; name: string; slug: string; description?: string };
type Question = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  topics: Topic[];
  companies: Topic[];
  rubric?: string;
  expectedConcepts?: string[];
  status?: string;
  roles?: string[];
  attribution?: string;
};
type Report = {
  overallScore: number;
  technicalCorrectness: number;
  reasoning: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionEvaluations: {
    question: string;
    topic: string;
    score: number;
    feedback: string;
    missingConcepts: string[];
  }[];
};
type Interview = {
  _id: string;
  role: string;
  type: string;
  status: string;
  difficulty: string;
  questionCount: number;
  version: number;
  createdAt: string;
  error?: string;
  turns: {
    question: string;
    topic: string;
    answer?: string;
    feedback?: string;
  }[];
  report?: Report;
};
let csrf = "";
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Request failed. Please retry.");
  if (data.csrfToken) csrf = data.csrfToken;
  return data;
}
const roles = [
  "Software Development Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "AI/ML Engineer",
  "Applied AI / GenAI Engineer",
];
const types = [
  "DSA",
  "Web Development",
  "Backend Engineering",
  "Core CS",
  "Machine Learning",
  "GenAI / LLM Engineering",
  "Mixed Technical",
];
const nav = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/questions", "Question library", BookOpen],
  ["/bookmarks", "Bookmarks", BookOpen],
  ["/interviews/new", "Practice interview", BrainCircuit],
  ["/history", "Interview history", Clock3],
  ["/analytics", "Your progress", ChartNoAxesCombined],
  ["/recommendations", "Practice plan", Target],
] as const;
function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="status">
      {children}
    </div>
  );
}
function ErrorBox({ error }: { error: unknown }) {
  return error ? (
    <div className="error" role="alert">
      {error instanceof Error ? error.message : String(error)}
    </div>
  ) : null;
}
function Title({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className={`badge ${String(children).toLowerCase()}`}>
      {children}
    </span>
  );
}
export default function Hub() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 10000 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Shell />
    </QueryClientProvider>
  );
}
function Shell() {
  const path = usePathname();
  const router = useRouter();
  const cache = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<{ user: User }>("/users/profile"),
  });
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.dataset.theme = value ? "dark" : "light";
  }, []);
  function theme() {
    const value = !dark;
    setDark(value);
    localStorage.setItem("theme", value ? "dark" : "light");
    document.documentElement.dataset.theme = value ? "dark" : "light";
  }
  const publicPage = ["/", "/features", "/login", "/register"].includes(path);
  useEffect(() => {
    if (!publicPage && profile.isError) router.replace("/login");
  }, [publicPage, profile.isError, router]);
  async function logout() {
    try {
      await api("/users/logout", "POST");
      cache.clear();
      router.push("/login");
    } catch (e) {
      setError(String(e));
    }
  }
  if (publicPage)
    return (
      <>
        <header className="public-nav">
          <Link className="brand" href="/">
            <span className="brand-icon">
              <Code2 size={21} />
            </span>
            interview<span>hub</span>
            <span className="beta">AI</span>
          </Link>
          <nav>
            <Link href="/features">Features</Link>
            <button
              className="icon-btn"
              onClick={theme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login">Sign in</Link>
            <Link className="button small" href="/register">
              Get started <ArrowRight size={16} />
            </Link>
          </nav>
        </header>
        {path === "/login" || path === "/register" ? (
          <Auth register={path === "/register"} />
        ) : (
          <Landing />
        )}
        <footer>
          Built for the next step in your engineering career.
          <span>AI feedback is guidance, not a hiring assessment.</span>
        </footer>
      </>
    );
  if (!profile.data)
    return (
      <main className="center">
        <Notice>Loading your workspace…</Notice>
        <ErrorBox error={profile.error} />
      </main>
    );
  const user = profile.data.user;
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-icon">
            <Code2 size={20} />
          </span>
          interview<span>hub</span>
        </Link>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav>
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              className={path === href ? "active" : ""}
              href={href}
            >
              <Icon size={18} />
              {label}
              {path === href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-tip">
          <Sparkles size={20} />
          <strong>A little practice. Every day.</strong>
          <p>Build confidence one thoughtful answer at a time.</p>
          <Link href="/interviews/new">
            Start a session <ArrowRight size={15} />
          </Link>
        </div>
        <nav className="bottom-nav">
          {user.role === "admin" && (
            <Link href="/admin">
              <Shield size={18} />
              Content management
            </Link>
          )}
          <Link href="/settings">
            <Settings size={18} />
            Settings
          </Link>
          <button onClick={logout}>
            <LogOut size={18} />
            Sign out
          </button>
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>
            Workspace <ChevronRight size={14} />{" "}
            {nav.find(([href]) => href === path)?.[1] || "Interview Hub"}
          </span>
          <div>
            <button
              className="icon-btn"
              onClick={theme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="avatar" href="/profile">
              {user.name[0]}
            </Link>
          </div>
        </header>
        <main className="content">
          <ErrorBox error={error} />
          {path === "/dashboard" ? (
            <Dashboard user={user} />
          ) : path === "/questions" ? (
            <Library />
          ) : path.startsWith("/questions/") ? (
            <QuestionDetail id={path.split("/")[2]} />
          ) : path === "/interviews/new" ? (
            <Setup />
          ) : path.startsWith("/interviews/") ? (
            <LiveInterview id={path.split("/")[2]} />
          ) : path === "/history" ? (
            <History />
          ) : path === "/bookmarks" ? (
            <Bookmarks />
          ) : path === "/recommendations" ? (
            <PracticePlan />
          ) : path === "/analytics" ? (
            <Progress recommendations={false} />
          ) : path === "/profile" || path === "/settings" ? (
            <Profile user={user} />
          ) : path.startsWith("/admin") && user.role === "admin" ? (
            <Admin />
          ) : (
            <Notice>
              Page not found.{" "}
              <Link href="/dashboard">Return to your dashboard</Link>
            </Notice>
          )}
        </main>
      </div>
    </div>
  );
}
function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="eyebrow">
          <span className="live-dot" /> YOUR NEXT ROLE STARTS HERE
        </div>
        <h1>
          Great interviews
          <br />
          start with <em>practice.</em>
        </h1>
        <p>
          A focused space to sharpen your technical thinking. Practice with an
          AI interviewer, explore the question library, and turn feedback into
          your next step.
        </p>
        <div className="actions">
          <Link className="button" href="/register">
            Build your confidence <ArrowRight size={18} />
          </Link>
          <Link className="button secondary" href="/login">
            Explore your workspace
          </Link>
        </div>
        <div className="hero-foot">
          <Check size={16} /> Six engineering tracks <span>·</span> Your pace,
          your progress
        </div>
      </section>
      <section className="feature-grid">
        <article className="card">
          <BrainCircuit className="accent" />
          <h2>Practice the conversation</h2>
          <p>
            Relevant technical questions, thoughtful follow-ups, and space to
            explain your approach.
          </p>
          <span className="eyebrow">AI MOCK INTERVIEWS</span>
        </article>
        <article className="card">
          <Search className="accent" />
          <h2>Find the right challenge</h2>
          <p>
            Search by topic or describe what you want to learn. Build
            understanding beyond memorized answers.
          </p>
          <span className="eyebrow">QUESTION LIBRARY</span>
        </article>
        <article className="card">
          <ChartNoAxesCombined className="accent" />
          <h2>Know what comes next</h2>
          <p>
            Saved feedback makes strengths visible and gives you concrete areas
            to work on.
          </p>
          <span className="eyebrow">PERSONAL FEEDBACK</span>
        </article>
      </section>
      <section className="how">
        <div className="eyebrow">A SIMPLE PRACTICE LOOP</div>
        <h2>Small sessions. Clear direction.</h2>
        <div className="feature-grid">
          {[
            "Choose your role and focus",
            "Explain how you would solve it",
            "Reflect, improve, and repeat",
          ].map((v, i) => (
            <div key={v}>
              <span className="step">0{i + 1}</span>
              <h3>{v}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
const authSchema = z.object({
  name: z.string().optional(),
  email: z.email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters").max(72),
});
function Auth({ register }: { register: boolean }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
  });
  async function submit(data: z.infer<typeof authSchema>) {
    try {
      setError("");
      await api(
        `/users/${register ? "register" : "login"}`,
        "POST",
        register
          ? { ...data, city: "" }
          : { email: data.email, password: data.password },
      );
      await cache.invalidateQueries({ queryKey: ["profile"] });
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <main className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">MAKE ROOM FOR YOUR NEXT CHAPTER</span>
        <h1>
          Confidence is
          <br />
          something you build.
        </h1>
        <p>
          One question. One explanation. One moment of understanding at a time.
        </p>
        <div className="quote">
          <Code2 size={36} />
          <p>Your practice belongs here.</p>
        </div>
      </div>
      <form className="card auth-card" onSubmit={handleSubmit(submit)}>
        <Badge>WELCOME TO INTERVIEW HUB</Badge>
        <h2>{register ? "Create your workspace" : "Good to see you again."}</h2>
        <p>
          {register
            ? "Start building your interview confidence."
            : "Sign in and pick up where you left off."}
        </p>
        {register && (
          <label>
            Your name
            <input
              {...field("name")}
              required
              autoComplete="name"
              placeholder="Alex Morgan"
            />
          </label>
        )}
        <label>
          Email address
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <ErrorBox error={errors.email?.message} />
        <label>
          Password
          <input
            {...field("password")}
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            placeholder="At least 10 characters"
          />
        </label>
        <ErrorBox error={errors.password?.message || error} />
        <button className="button full" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait…"
            : register
              ? "Create account"
              : "Sign in"}
          <ArrowRight size={17} />
        </button>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New here?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
function useInterviews() {
  return useQuery({
    queryKey: ["interviews"],
    queryFn: () => api<{ interviews: Interview[] }>("/interviews"),
  });
}
function Dashboard({ user }: { user: User }) {
  const query = useInterviews();
  const sessions = query.data?.interviews || [];
  const completed = sessions.filter((s) => s.status === "completed");
  return (
    <>
      <Title
        eyebrow="YOUR PRACTICE, IN FOCUS"
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
      >
        Every session is a step forward. What will you work on today?
      </Title>
      <section className="practice-banner">
        <div>
          <Badge>YOUR NEXT CHALLENGE</Badge>
          <h2>
            Think it through.
            <br />
            Talk it out. Get better.
          </h2>
          <p>A focused mock interview, tailored to your role.</p>
          <Link className="button" href="/interviews/new">
            <Play size={17} />
            Start a practice interview <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-art">
          <div className="orbit one" />
          <div className="orbit two" />
          <div className="art-core">
            <BrainCircuit size={60} />
          </div>
          <span className="floating-tag">think → explain → improve</span>
        </div>
      </section>
      <section className="stats">
        <Stat
          label="Practice sessions"
          value={sessions.length}
          icon={<BrainCircuit />}
        />
        <Stat
          label="Completed interviews"
          value={completed.length}
          icon={<Check />}
        />
        <Stat label="Engineering tracks" value={6} icon={<Code2 />} />
      </section>
      <div className="section-heading">
        <h2>Recent practice</h2>
        <Link href="/history">
          View history <ArrowRight size={15} />
        </Link>
      </div>
      <ErrorBox error={query.error} />
      {query.isLoading ? (
        <Notice>Loading sessions…</Notice>
      ) : (
        <SessionList sessions={sessions.slice(0, 4)} />
      )}
      <div className="section-heading">
        <h2>Make your next session count</h2>
      </div>
      <div className="feature-grid">
        <Link className="card action-card" href="/questions">
          <BookOpen />
          <h3>Explore the library</h3>
          <p>Find a question worth thinking about.</p>
          <ArrowRight size={18} />
        </Link>
        <Link className="card action-card" href="/recommendations">
          <Target />
          <h3>Find your focus</h3>
          <p>Turn your past feedback into a plan.</p>
          <ArrowRight size={18} />
        </Link>
        <Link className="card action-card" href="/analytics">
          <ChartNoAxesCombined />
          <h3>See your progress</h3>
          <p>Reflect on the work you have put in.</p>
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <article className="card stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-icon">{icon}</div>
    </article>
  );
}
function SessionList({ sessions }: { sessions: Interview[] }) {
  return !sessions.length ? (
    <div className="card empty">
      <BrainCircuit size={30} />
      <h3>Your story starts with one session.</h3>
      <p>Completed interviews and feedback will appear here.</p>
      <Link href="/interviews/new">
        Start your first interview <ArrowRight size={16} />
      </Link>
    </div>
  ) : (
    <div className="card session-list">
      {sessions.map((s) => (
        <Link href={`/interviews/${s._id}`} key={s._id}>
          <span className="session-icon">
            <Code2 size={20} />
          </span>
          <div>
            <strong>{s.type} interview</strong>
            <small>
              {s.role} · {new Date(s.createdAt).toLocaleDateString()}
            </small>
          </div>
          <Badge>{s.status}</Badge>
          <ChevronRight size={18} />
        </Link>
      ))}
    </div>
  );
}
function Library() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [semantic, setSemantic] = useState(false);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState("newest");
  const companies = useQuery({
    queryKey: ["companies"],
    queryFn: () => api<{ companies: Topic[] }>("/companies"),
  });
  const topics = useQuery({
    queryKey: ["topics"],
    queryFn: () => api<{ topics: Topic[] }>("/topics"),
  });
  const query = useQuery({
    queryKey: [
      "questions",
      term,
      difficulty,
      topic,
      semantic,
      page,
      role,
      company,
      sort,
    ],
    queryFn: () =>
      api<{ questions: Question[]; total: number; mode: string }>(
        `/questions/search?${new URLSearchParams({ q: term, difficulty, topics: topic, semantic: String(semantic), page: String(page), roles: role, companies: company, sort })}`,
      ),
  });
  return (
    <>
      <Title eyebrow="BUILD YOUR UNDERSTANDING" title="Question library">
        A good question is the beginning of a better explanation.
      </Title>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(q);
          setPage(1);
        }}
      >
        <Search size={20} />
        <input
          aria-label="Search questions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a concept, topic, or question…"
        />
        <button className="button small">Search</button>
      </form>
      <div className="filters">
        <select
          aria-label="Difficulty"
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All difficulties</option>
          {["Easy", "Medium", "Hard"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          aria-label="Topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All topics</option>
          {topics.data?.topics.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Role filter"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          aria-label="Company filter"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All companies</option>
          {companies.data?.companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort questions"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title</option>
        </select>
        <label className="check-label">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
          />
          <Sparkles size={15} /> Search by meaning
        </label>
        <span>{query.data?.total || 0} questions</span>
      </div>
      <ErrorBox error={query.error} />
      {query.data?.mode === "keyword-fallback" && (
        <Notice>
          Semantic search is unavailable. Showing keyword matches.
        </Notice>
      )}
      {query.isLoading ? (
        <Notice>Finding questions…</Notice>
      ) : query.data?.questions.length ? (
        <div className="question-grid">
          {query.data.questions.map((question) => (
            <Link
              className="card question-card"
              href={`/questions/${question._id}`}
              key={question._id}
            >
              <div>
                <Badge>{question.difficulty}</Badge>
                <span className="muted">
                  {question.topics[0]?.name || "Technical practice"}
                </span>
              </div>
              <h2>{question.title}</h2>
              <p>
                {question.description.slice(0, 170)}
                {question.description.length > 170 ? "…" : ""}
              </p>
              <span className="question-footer">
                Explore question <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Notice>
          No questions found. Try a broader search or a different filter.
        </Notice>
      )}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          disabled={page * 20 >= (query.data?.total || 0)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
function QuestionDetail({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ["question", id],
    queryFn: () => api<{ question: Question }>(`/questions/${id}`),
  });
  const [message, setMessage] = useState("");
  if (!query.data)
    return (
      <>
        <Notice>Loading question…</Notice>
        <ErrorBox error={query.error} />
      </>
    );
  const q = query.data.question;
  return (
    <>
      <Link className="back" href="/questions">
        ← Question library
      </Link>
      <Title
        eyebrow={
          q.topics.map((t) => t.name).join(" / ") || "TECHNICAL PRACTICE"
        }
        title={q.title}
      />
      <div className="card prose">
        <Badge>{q.difficulty}</Badge>
        <p className="statement">{q.description}</p>
        <h3>Think about</h3>
        <ul>
          {q.expectedConcepts?.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <details>
          <summary>View answer guidance</summary>
          <p>
            {q.rubric ||
              "Explain your reasoning, discuss trade-offs, and consider edge cases."}
          </p>
        </details>
        <div className="actions">
          <button
            className="button secondary"
            onClick={async () => {
              try {
                await api(`/questions/${id}/bookmark`, "POST");
                setMessage("Saved to your bookmarks.");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          >
            Bookmark question
          </button>
          <Link className="button" href="/interviews/new">
            Practice an interview <ArrowRight size={16} />
          </Link>
        </div>
        {message && <Notice>{message}</Notice>}
        <small>
          Original practice content. Company tags indicate practice
          classifications, not verified interview provenance.
        </small>
      </div>
    </>
  );
}
function Setup() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await api<{ interview: Interview }>("/interviews", "POST", {
        role: data.get("role"),
        difficulty: data.get("difficulty"),
        type: data.get("type"),
        questionCount: Number(data.get("count")),
        topics: String(data.get("topics") || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push(`/interviews/${r.interview._id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <Title
        eyebrow="A LITTLE INTENTION GOES A LONG WAY"
        title="Make this session yours."
      >
        Choose your focus. Take your time. Explain your thinking.
      </Title>
      <div className="setup-grid">
        <form className="card setup-form" onSubmit={submit}>
          <h2>Interview setup</h2>
          <label>
            Target role
            <select name="role">
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Interview focus
              <select name="type">
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select name="difficulty">
                {["Easy", "Medium", "Hard"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Topics <span className="muted">optional, comma-separated</span>
            <input
              name="topics"
              maxLength={300}
              placeholder="e.g. arrays, complexity, edge cases"
            />
          </label>
          <label>
            Number of questions
            <select name="count">
              {[1, 3, 5, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "question" : "questions"}
                </option>
              ))}
            </select>
          </label>
          <ErrorBox error={error} />
          <button className="button full" disabled={busy}>
            {busy ? "Creating session…" : "Enter your interview"}
            <ArrowRight size={18} />
          </button>
        </form>
        <aside className="card session-guide">
          <BrainCircuit size={32} />
          <h2>A space to think.</h2>
          <p>
            This is practice. You do not need a perfect answer to make progress.
          </p>
          <ul>
            <li>Describe your approach before the details.</li>
            <li>Discuss assumptions and trade-offs.</li>
            <li>Consider edge cases and complexity.</li>
            <li>Your progress is saved after each submission.</li>
          </ul>
          <Notice>
            AI feedback can be imperfect. Use it to guide practice, not measure
            professional ability.
          </Notice>
        </aside>
      </div>
    </>
  );
}
function LiveInterview({ id }: { id: string }) {
  const cache = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const query = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api<{ interview: Interview }>(`/interviews/${id}`),
  });
  const s = query.data?.interview;
  async function action(name: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      await api(`/interviews/${id}/${name}`, "POST", body);
      setAnswer("");
      setKey(crypto.randomUUID());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      await cache.invalidateQueries({ queryKey: ["interview", id] });
      await cache.invalidateQueries({ queryKey: ["interviews"] });
      setBusy(false);
    }
  }
  if (!s)
    return (
      <>
        <Notice>Opening your interview…</Notice>
        <ErrorBox error={query.error} />
      </>
    );
  if (s.report) return <Results session={s} />;
  return (
    <>
      <Title eyebrow="YOUR PRACTICE ROOM" title={`${s.type} interview`}>
        {s.role} · {s.difficulty} · {s.turns.filter((t) => t.answer).length} of{" "}
        {s.questionCount} answered
      </Title>
      <div className="interview-layout">
        <section className="card conversation">
          <div className="conversation-head">
            <span className="interviewer-icon">
              <BrainCircuit size={20} />
            </span>
            <div>
              <strong>Your AI interviewer</strong>
              <small>
                {busy
                  ? "Thinking through your response…"
                  : "Take a breath. Explain your thinking."}
              </small>
            </div>
            <Badge>{s.status}</Badge>
          </div>
          {!s.turns.length && (
            <div className="empty">
              <BrainCircuit size={36} />
              <h2>Ready when you are.</h2>
              <p>Start the interview to receive your first question.</p>
            </div>
          )}
          {s.turns.map((t, i) => (
            <div className="turn" key={i}>
              {t.feedback && (
                <div className="feedback">
                  <Sparkles size={16} />
                  {t.feedback}
                </div>
              )}
              <div className="eyebrow">
                QUESTION {i + 1} · {t.topic}
              </div>
              <p className="interviewer-text">{t.question}</p>
              {t.answer && (
                <div className="answer">
                  <span>Your response</span>
                  <p>{t.answer}</p>
                </div>
              )}
            </div>
          ))}
          <ErrorBox error={error || s.error} />
          {busy && (
            <Notice>
              Generating with your configured model. Your submitted answer is
              saved.
            </Notice>
          )}
          {s.status === "active" && !s.turns.at(-1)?.answer && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action("answers", { answer, key, version: s.version });
              }}
            >
              <label>
                Your answer
                <textarea
                  rows={7}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  maxLength={8000}
                  required
                  placeholder="Start with your approach. Walk through the reasoning…"
                />
              </label>
              <div className="composer-footer">
                <span>{answer.length}/8000 · Text-only practice</span>
                <button className="button" disabled={busy || !answer.trim()}>
                  Submit answer <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
          {s.status === "created" && !s.turns.length && (
            <button
              className="button"
              disabled={busy}
              onClick={() => action("start")}
            >
              <Play size={17} />
              Start interview
            </button>
          )}
          {["failed", "generating", "evaluating"].includes(s.status) ||
          (s.status === "created" && s.turns.length > 0) ? (
            <button
              className="button"
              disabled={busy}
              onClick={() => action("retry")}
            >
              Retry saved operation
            </button>
          ) : null}
          {s.status === "cancelled" && (
            <Notice>
              This session was cancelled. Your previous answers remain saved.
            </Notice>
          )}
        </section>
        <aside className="interview-aside">
          <div className="card">
            <h3>Your session</h3>
            <progress
              value={s.turns.filter((t) => t.answer).length}
              max={s.questionCount}
            />
            <p>{s.turns.filter((t) => t.answer).length} answers saved</p>
            <p className="muted">
              Focus on the reasoning. There can be more than one valid approach.
            </p>
            {s.turns.some((t) => t.answer) && s.status === "active" && (
              <button
                className="button secondary full"
                disabled={busy}
                onClick={() => action("complete")}
              >
                Finish & review
              </button>
            )}
            {s.status !== "cancelled" && (
              <button className="text-button" onClick={() => action("cancel")}>
                Cancel session
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
function Results({ session }: { session: Interview }) {
  const r = session.report!;
  return (
    <>
      <Title
        eyebrow="REFLECT. REFINE. REPEAT."
        title="A clearer picture of your practice."
      >
        Your saved feedback from this {session.type.toLowerCase()} session.
      </Title>
      <div className="report-score card">
        <div className="score-ring">
          {r.overallScore}
          <small>/ 100</small>
        </div>
        <div>
          <Badge>SESSION COMPLETE</Badge>
          <h2>Progress starts with reflection.</h2>
          <p>
            AI-generated practice feedback, not an objective measure of
            professional ability.
          </p>
        </div>
      </div>
      <section className="stats">
        <Stat
          label="Technical correctness"
          value={r.technicalCorrectness}
          icon={<Code2 />}
        />
        <Stat label="Reasoning" value={r.reasoning} icon={<BrainCircuit />} />
        <Stat
          label="Communication"
          value={r.communication}
          icon={<UserRound />}
        />
      </section>
      <div className="feature-grid">
        {[
          ["What went well", r.strengths],
          ["Room to grow", r.weaknesses],
          ["Your next steps", r.recommendations],
        ].map(([title, items]) => (
          <article className="card" key={String(title)}>
            <h2>{String(title)}</h2>
            <ul>
              {(items as string[]).map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {r.questionEvaluations?.map((e, i) => (
        <article className="card evaluation" key={i}>
          <Badge>{e.topic}</Badge>
          <h3>{e.question}</h3>
          <p>{e.feedback}</p>
          <small>Practice score: {e.score}/100</small>
        </article>
      ))}
      <div className="actions">
        <Link className="button" href="/interviews/new">
          Practice again <ArrowRight size={17} />
        </Link>
        <Link className="button secondary" href="/questions">
          Explore questions
        </Link>
      </div>
    </>
  );
}
function History() {
  const q = useInterviews();
  return (
    <>
      <Title eyebrow="THE WORK ADDS UP" title="Your interview history">
        Revisit a session, review feedback, or pick up where you left off.
      </Title>
      <ErrorBox error={q.error} />
      {q.isLoading ? (
        <Notice>Loading history…</Notice>
      ) : (
        <SessionList sessions={q.data?.interviews || []} />
      )}
    </>
  );
}
function Progress({ recommendations }: { recommendations: boolean }) {
  const sessions = useInterviews();
  const reports = useQuery({
    queryKey: [
      "reports",
      sessions.data?.interviews.map((s) => s._id).join(","),
    ],
    enabled: !!sessions.data,
    queryFn: async () =>
      Promise.all(
        (sessions.data?.interviews || [])
          .filter((s) => s.status === "completed")
          .slice(0, 20)
          .map((s) =>
            api<{ interview: Interview }>(`/interviews/${s._id}`).then(
              (r) => r.interview,
            ),
          ),
      ),
  });
  const items = reports.data || [];
  return (
    <>
      <Title
        eyebrow="TURN REFLECTION INTO DIRECTION"
        title={
          recommendations ? "Your practice plan" : "See how you are growing."
        }
      >
        Based on your saved interview feedback.
      </Title>
      <ErrorBox error={sessions.error || reports.error} />
      {reports.isLoading ? (
        <Notice>Loading your feedback…</Notice>
      ) : !items.length ? (
        <Notice>
          Complete your first interview to see feedback and progress here.
        </Notice>
      ) : recommendations ? (
        <div className="question-grid">
          {items.slice(0, 3).map((s) => (
            <article className="card" key={s._id}>
              <Badge>{s.type}</Badge>
              <h2>Focus for your next session</h2>
              <ul>
                {s.report?.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <Link href="/questions">Find a practice question →</Link>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="card chart">
            <h2>Practice score over time</h2>
            <p className="muted">
              AI scores vary by question and model. Look for learning patterns,
              not rankings.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={[...items]
                  .reverse()
                  .map((s, i) => ({
                    session: i + 1,
                    score: s.report?.overallScore,
                  }))}
              >
                <XAxis dataKey="session" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area dataKey="score" stroke="#34775e" fill="#b8d9c5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <SessionList sessions={items} />
        </>
      )}
    </>
  );
}
function Profile({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const cache = useQueryClient();
  return (
    <>
      <Title eyebrow="YOUR WORKSPACE, YOUR WAY" title="Profile & preferences" />
      <form
        className="card setup-form narrow"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await api("/users/profile", "PATCH", Object.fromEntries(f));
            setMessage("Preferences saved.");
            await cache.invalidateQueries({ queryKey: ["profile"] });
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Name
          <input name="name" defaultValue={user.name} required maxLength={80} />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          City
          <input name="city" defaultValue={user.city} maxLength={100} />
        </label>
        <label>
          Preferred track
          <select name="preferredRole" defaultValue={user.preferredRole}>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save preferences"}
        </button>
        {message && <Notice>{message}</Notice>}
      </form>
    </>
  );
}
function Admin() {
  const [kind, setKind] = useState("questions");
  const [edit, setEdit] = useState<Question | Topic | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cache = useQueryClient();
  const taxonomy = useQuery({queryKey:['admin-taxonomy'],queryFn:async()=>({topics:(await api<{topics:Topic[]}>('/topics')).topics,companies:(await api<{companies:Topic[]}>('/companies')).companies})});
  const data = useQuery({
    queryKey: ["admin", kind],
    queryFn: () =>
      api<Record<string, (Question | Topic)[]>>(
        kind === "questions" ? "/admin/questions" : `/${kind}`,
      ),
  });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string,unknown> = Object.fromEntries(form);
    if(kind==='questions'){
      body.topics=form.getAll('topics');body.companies=form.getAll('companies');body.roles=form.getAll('roles');
      body.expectedConcepts=String(form.get('expectedConcepts')||'').split('\n').map(v=>v.trim()).filter(Boolean);
    }
    setBusy(true);
    setError("");
    try {
      await api(
        `/${kind}${edit ? `/${edit._id}` : ""}`,
        edit ? "PUT" : "POST",
        body,
      );
      setEdit(null);
      await cache.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Title eyebrow="CONTENT WORKSPACE" title="Manage your question bank" />
      <div className="filters">
        {["questions", "topics", "companies"].map((k) => (
          <button
            className={kind === k ? "selected" : ""}
            key={k}
            onClick={() => {
              setKind(k);
              setEdit(null);
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="setup-grid">
        <div className="card">
          {data.data?.[kind]?.map((item) => (
            <div className="admin-row" key={item._id}>
              <strong>{"title" in item ? item.title : item.name}</strong>
              <button onClick={() => setEdit(item)}>Edit</button>
              <button
                onClick={async () => {
                  if (!confirm("Delete this item? Questions will be archived."))
                    return;
                  try {
                    await api(`/${kind}/${item._id}`, "DELETE");
                    await cache.invalidateQueries({ queryKey: ["admin"] });
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {!data.data?.[kind]?.length && (
            <Notice>No content yet. Create the first entry.</Notice>
          )}
          <ErrorBox error={data.error} />
        </div>
        <form
          className="card setup-form"
          key={`${kind}-${edit?._id}`}
          onSubmit={submit}
        >
          <h2>
            {edit ? "Edit" : "Create"} {kind.slice(0, -1)}
          </h2>
          <label>
            {kind === "questions" ? "Title" : "Name"}
            <input
              name={kind === "questions" ? "title" : "name"}
              defaultValue={
                edit ? ("title" in edit ? edit.title : edit.name) : ""
              }
              required
            />
          </label>
          <label>
            Slug
            <input
              name="slug"
              defaultValue={edit?.slug}
              required
              pattern="[a-z0-9-]+"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={edit?.description}
              required
              rows={5}
            />
          </label>
          {kind === "questions" && (
            <>
              <label>
                Difficulty
                <select
                  name="difficulty"
                  defaultValue={
                    edit && "difficulty" in edit ? edit.difficulty : "Easy"
                  }
                >
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  name="status"
                  defaultValue={
                    edit && "status" in edit ? edit.status : "draft"
                  }
                >
                  {["draft", "published", "archived"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Answer guidance
                <textarea
                  name="rubric"
                  defaultValue={edit && "rubric" in edit ? edit.rubric : ""}
                />
              </label>
              <label>Topics<select name="topics" multiple defaultValue={edit&&'topics'in edit?edit.topics.map(t=>t._id):[]}>{taxonomy.data?.topics.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select><small>Hold Ctrl or Command to choose multiple topics.</small></label>
              <label>Practice company tags<select name="companies" multiple defaultValue={edit&&'companies'in edit?edit.companies.map(t=>t._id):[]}>{taxonomy.data?.companies.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></label>
              <label>Career tracks<select name="roles" multiple defaultValue={edit&&'roles'in edit?edit.roles:[]}>{roles.map(r=><option key={r}>{r}</option>)}</select></label>
              <label>Expected concepts (one per line)<textarea name="expectedConcepts" defaultValue={edit&&'expectedConcepts'in edit?edit.expectedConcepts?.join('\n'):''}/></label>
              <label>Source attribution<input name="attribution" defaultValue={edit&&'attribution'in edit?edit.attribution:'Original practice question'}/></label>
            </>
          )}
          <ErrorBox error={error} />
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save content"}
          </button>
          {edit && (
            <button type="button" onClick={() => setEdit(null)}>
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </>
  );
}
