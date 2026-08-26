import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Compass,
  ExternalLink,
  Flag,
  Gamepad2,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic2,
  Music2,
  Palette,
  Pin,
  Plus,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const FACEBOOK_URL = "https://facebook.com/tagpuancommunity";
const RSVP_URL = "https://lu.ma/";
const TAGPUAN_LOGO_URL = "/manus-storage/tagpuanlogotransparent_92d74ba9.png";

function HutMark({ size = 48 }: { size?: number }) {
  return (
    <img
      className="tagpuan-logo"
      src={TAGPUAN_LOGO_URL}
      width={size}
      height={size * 1.25}
      alt="Tagpuan hut logo"
    />
  );
}

const events = [
  {
    id: "sunday-sessions",
    date: "AUG 29 · SATURDAY",
    title: "Sunday Sessions",
    venue: "The Social Room",
    time: "7:00 PM",
    description:
      "Bring the thing you are making. Stay for the people you meet.",
    photo: "one",
    count: 11,
    capacity: 30,
    initials: ["M", "A", "J"],
    rotation: "-1.2deg",
  },
  {
    id: "open-table",
    date: "SEP 12 · SATURDAY",
    title: "Open Table",
    venue: "The Den",
    time: "4:00 PM",
    description:
      "A softer afternoon for work-in-progress, good questions, and merienda.",
    photo: "two",
    count: 3,
    capacity: 24,
    initials: ["K", "L", "S"],
    rotation: "1.4deg",
  },
  {
    id: "night-shift",
    date: "SEP 26 · SATURDAY",
    title: "Night Shift",
    venue: "Malaya's Cafe — Grove",
    time: "7:30 PM",
    description:
      "Co-work for a little while. Open mic, DJ sets, and a free drink after.",
    photo: "three",
    count: 0,
    capacity: 32,
    initials: [],
    rotation: "-0.8deg",
  },
];

const recapPhotos = [
  { label: "hands at work", rotation: "-3deg" },
  { label: "the long table", rotation: "2deg" },
  { label: "new friends", rotation: "-1deg" },
  { label: "open mic", rotation: "3deg" },
  { label: "one more song", rotation: "-2deg" },
];

const prompts = [
  { text: "what are you making time for?", tone: "mustard", rotation: "-2deg" },
  { text: "pin a note. leave a trace.", tone: "sage", rotation: "2deg" },
  { text: "a small board for big ideas.", tone: "rose", rotation: "-1deg" },
  { text: "your people are probably here.", tone: "bone", rotation: "3deg" },
];

const spotlight = {
  name: "Mika Santos",
  role: "Product designer, weekend potter",
  quote:
    "What I'm working on right now: a tiny ceramic lamp series, and getting better at asking people what they are excited about.",
  event: "FEATURED AT: SUNDAY SESSIONS · AUG 29",
};

const aboutItems = [
  {
    icon: Users,
    title: "Who's it for?",
    text: "Anyone pursuing an idea, project, craft, or passion — from art and tech to science, writing, and everything between.",
  },
  {
    icon: Compass,
    title: "What is it?",
    text: "Part Pomodoro-style co-working session, part community hangout. Come with a project, or just come as you are.",
  },
  {
    icon: Sparkles,
    title: "Why come?",
    text: "Because making things is better with people nearby. Find a good question, a new collaborator, or a reason to keep going.",
  },
  {
    icon: Lightbulb,
    title: "What can you do?",
    text: "Code. Paint. Write. Read. Crochet. Compose. Share. Listen. Bring the thing you are quietly building.",
  },
];

const projectTags = [
  { label: "14 in Tech", className: "" },
  { label: "6 in Art", className: "" },
  { label: "5 in Writing", className: "" },
  { label: "3 in Music", className: "" },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [ribbonVisible, setRibbonVisible] = useState(true);
  const [wallOpen, setWallOpen] = useState(false);
  const [wallText, setWallText] = useState("");
  const [wallName, setWallName] = useState("");
  const [wallMessage, setWallMessage] = useState("");
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectText, setProjectText] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectTag, setProjectTag] = useState("Tech");
  const [projectMessage, setProjectMessage] = useState("");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [wallPage, setWallPage] = useState(1);
  const [icebreaker, setIcebreaker] = useState(
    "What are you making time for this week?"
  );
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement>(null);
  const [wallArchive, setWallArchive] = useState(false);
  const [projectPage, setProjectPage] = useState(1);
  const [pinnedNoteIds, setPinnedNoteIds] = useState<number[]>([]);
  const { data: cmsEvents } = trpc.content.events.useQuery();
  const { data: wallData, isLoading: wallLoading } = trpc.wall.list.useQuery({
    page: wallPage,
    pageSize: 12,
    archive: wallArchive,
  });
  const { data: projectData, isLoading: projectLoading } =
    trpc.projects.list.useQuery({ page: projectPage, pageSize: 10 });
  const { data: cmsSpotlights } = trpc.content.spotlights.useQuery();
  const { data: cmsRecapPhotos } = trpc.content.recapPhotos.useQuery();
  const { data: cmsVenuePins } = trpc.content.venuePins.useQuery();
  const wallPinMutation = trpc.wall.pin.useMutation();
  const wallReportMutation = trpc.wall.report.useMutation();
  const projectReportMutation = trpc.projects.report.useMutation();
  const wallMutation = trpc.wall.create.useMutation({
    onSuccess: result => {
      setWallMessage(result.message);
      setWallText("");
      setWallName("");
    },
    onError: error => setWallMessage(error.message),
  });
  const projectMutation = trpc.projects.create.useMutation({
    onSuccess: result => {
      setProjectMessage(result.message);
      setProjectText("");
      setProjectName("");
    },
    onError: error => setProjectMessage(error.message),
  });
  const newsletterMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => setNewsletterState("success"),
    onError: () => setNewsletterState("error"),
  });

  useEffect(() => {
    try {
      if (sessionStorage.getItem("tagpuan-ribbon-dismissed") === "1")
        setRibbonVisible(false);
    } catch {
      // Session storage can be unavailable in privacy-restricted browsers.
    }
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight")
        setLightboxIndex(index =>
          index === null ? 0 : (index + 1) % displayedRecaps.length
        );
      if (event.key === "ArrowLeft")
        setLightboxIndex(index =>
          index === null
            ? 0
            : (index + displayedRecaps.length - 1) % displayedRecaps.length
        );
    };
    window.addEventListener("keydown", onKeyDown);
    lightboxCloseRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      lightboxTriggerRef.current?.focus();
    };
  }, [lightboxIndex]);

  const displayedEvents = cmsEvents?.length
    ? cmsEvents.map((event, index) => ({
        id: event.slug,
        date: event.dateLabel,
        title: event.title,
        venue: event.venue,
        time: event.timeLabel,
        description: event.description,
        photo: event.imageUrl ? "cms" : ["one", "two", "three"][index % 3],
        imageUrl: event.imageUrl ?? undefined,
        count: event.attendeeCount,
        capacity: event.capacity ?? 32,
        initials: [],
        rotation: `${index % 2 ? 1.3 : -1.1}deg`,
      }))
    : events;
  const currentSpotlight = useMemo(() => {
    const items = cmsSpotlights?.length ? cmsSpotlights : [spotlight];
    return items[spotlightIndex % items.length];
  }, [cmsSpotlights, spotlightIndex]);
  const displayedRecaps = cmsRecapPhotos?.length
    ? cmsRecapPhotos.map(photo => ({
        label: photo.caption || photo.imageAlt,
        rotation: "0deg",
        imageUrl: photo.imageUrl,
      }))
    : recapPhotos.map(photo => ({ ...photo, imageUrl: undefined }));

  function dismissRibbon() {
    setRibbonVisible(false);
    try {
      sessionStorage.setItem("tagpuan-ribbon-dismissed", "1");
    } catch {
      // Non-blocking fallback: dismissal still applies for this render.
    }
  }

  function submitWall(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallText.trim()) {
      setWallMessage("Your note needs a little something in it first.");
      return;
    }
    if (wallText.trim().length > 140) {
      setWallMessage("That note is a little too long. Keep it to 140 letters.");
      return;
    }
    setWallMessage("Sending your note to the board...");
    wallMutation.mutate({
      body: wallText.trim(),
      authorName: wallName.trim() || undefined,
      tone: "mustard",
    });
  }

  function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectText.trim()) {
      setProjectMessage("Tell us what you are making right now.");
      return;
    }
    if (projectText.trim().length > 120) {
      setProjectMessage("Keep this update to 120 letters.");
      return;
    }
    setProjectMessage("Sending your update for a quick moderation check...");
    projectMutation.mutate({
      body: projectText.trim(),
      authorName: projectName.trim() || undefined,
      tag: projectTag as
        | "Art"
        | "Tech"
        | "Writing"
        | "Music"
        | "Research"
        | "Other",
    });
  }

  function submitNewsletter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setNewsletterState("error");
      return;
    }
    newsletterMutation.mutate({ email: email.trim() });
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--espresso)]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--paper)] focus:px-4 focus:py-3 focus:text-[var(--espresso)]"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="hero-surface grain-dark" id="top">
        <div className="hero-content">
          <nav className="site-nav" aria-label="Primary navigation">
            <a className="brand-lockup" href="#top" aria-label="Tagpuan home">
              <HutMark size={35} />
            </a>
            <button
              className="nav-toggle focus-ring"
              type="button"
              onClick={() => setNavOpen(!navOpen)}
              aria-expanded={navOpen}
              aria-controls="site-links"
              aria-label={navOpen ? "Close menu" : "Open menu"}
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div
              className={`nav-links ${navOpen ? "open" : ""}`}
              id="site-links"
            >
              <a href="#about" onClick={() => setNavOpen(false)}>
                About
              </a>
              <a href="#events" onClick={() => setNavOpen(false)}>
                What's Going On
              </a>
              <a href="#wall" onClick={() => setNavOpen(false)}>
                The Wall
              </a>
              <a href="#join" onClick={() => setNavOpen(false)}>
                Join
              </a>
              <a
                className="pill pill-primary"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
              >
                Join the Collective <ArrowRight size={15} />
              </a>
            </div>
          </nav>
          {ribbonVisible && (
            <div className="event-ribbon" role="status">
              <HutMark size={19} />
              <span>Sunod na Tagpuan · Next gathering:</span>
              <a href="#event-sunday-sessions">
                Sat Aug 29 · The Social Room <ArrowRight size={12} />
              </a>
              <button
                className="ribbon-dismiss focus-ring"
                type="button"
                aria-label="Dismiss next gathering reminder for this session"
                onClick={dismissRibbon}
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="section-wrap section-pad text-center">
            <div className="hero-logo">
              <HutMark size={78} />
            </div>
            <p className="section-kicker" style={{ color: "var(--ember)" }}>
              an open collective · a meeting place
            </p>
            <h1 className="hero-wordmark">Tagpuan</h1>
            <p className="hero-mission">
              An open collective for people building their passions — where
              makers, artists, engineers, researchers, writers, and everyone in
              between come together.
            </p>
            <div className="hero-note torn-card">
              <span className="tape" aria-hidden="true" />
              <div className="torn-inner">
                <p>
                  Make time for things that excite you. (Not for school. Not for
                  work. :))
                </p>
              </div>
            </div>
            <div className="hero-actions">
              <a
                className="pill pill-primary"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
              >
                Join the Collective <ArrowRight size={17} />
              </a>
              <a
                className="pill pill-ghost"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
              >
                Follow on Facebook <ExternalLink size={15} />
              </a>
            </div>
            <a className="scroll-cue" href="#about">
              scroll to wander <ArrowDown size={16} />
            </a>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="about section-pad" id="about">
          <div className="section-wrap">
            <p className="section-kicker">meet tagpuan</p>
            <h2 className="section-title">
              Come as you are.
              <br />
              Bring what excites you.
            </h2>
            <p className="section-copy">
              Tagpuan is a warm corner for people who are making, learning,
              trying, and starting again. A gathering spot for the project in
              your head and the person you have not met yet.
            </p>
            <div className="about-grid">
              {aboutItems.map(({ icon: Icon, title, text }) => (
                <article className="about-cell" key={title}>
                  <Icon className="about-icon" size={27} strokeWidth={1.7} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <p className="about-close">
              Anything born out of passion is welcome here.{" "}
              <span>(Not for school. Not for work. :))</span>
            </p>
            <div className="starter-wrap">
              <div className="starter-intro">
                <p className="section-kicker">for first-timers</p>
                <h3>New Here?</h3>
                <p className="section-copy">
                  No secret handshake. No finished project required. Start
                  wherever you are.
                </p>
              </div>
              <div className="starter-card">
                <span className="tape" aria-hidden="true" />
                <ol className="starter-list">
                  <li>
                    <span className="checkbox-sketch">
                      <Check size={16} />
                    </span>
                    <span>
                      <strong>
                        <a href="#event-sunday-sessions">Come to a session</a>
                      </strong>
                      <span>Show up. No experience or project required.</span>
                    </span>
                  </li>
                  <li>
                    <span className="checkbox-sketch">
                      <Check size={16} />
                    </span>
                    <span>
                      <strong>Find your people</strong>
                      <span>
                        Speed friending, open mic, or just hang by the DJ booth.
                      </span>
                    </span>
                  </li>
                  <li>
                    <span className="checkbox-sketch">
                      <Check size={16} />
                    </span>
                    <span>
                      <strong>
                        <a href="#projects">Bring your own passion</a>
                      </strong>
                      <span>
                        Next time, bring the thing you are building. We will ask
                        about it.
                      </span>
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="events section-pad grain-dark" id="events">
          <div className="section-wrap">
            <div className="event-head">
              <div>
                <p className="section-kicker">tama na ang lurking</p>
                <h2 className="section-title light">What's Going On?</h2>
                <p className="section-copy light">
                  A little focus. A little chaos. A lot of people making room
                  for one another.
                </p>
              </div>
              <div className="session-stamp">
                SESSION №47 · RUNNING SINCE 2024
              </div>
            </div>
            <div className="events-scroll" aria-label="Upcoming Tagpuan events">
              {displayedEvents.map(event => {
                const nearCapacity =
                  event.count > 0 && event.count / event.capacity > 0.72;
                const rsvpCopy =
                  event.count === 0
                    ? "Be the first to RSVP"
                    : nearCapacity
                      ? `${event.count}+ going · almost full`
                      : `${event.count} are going`;
                return (
                  <article
                    className="event-card"
                    id={`event-${event.id}`}
                    style={
                      { "--rotation": event.rotation } as React.CSSProperties
                    }
                    key={event.id}
                  >
                    <div className="event-card-bg" aria-hidden="true" />
                    <div className="event-card-inner">
                      <div
                        className={`event-photo ${event.photo}`}
                        role="img"
                        aria-label={`${event.title} event atmosphere`}
                        style={
                          (event as { imageUrl?: string }).imageUrl
                            ? {
                                backgroundImage: `linear-gradient(145deg, rgba(43,27,18,.08), rgba(43,27,18,.42)), url(${(event as { imageUrl?: string }).imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        <span className="photo-word">come through</span>
                      </div>
                      <p className="event-date">{event.date}</p>
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span>
                          <MapPin size={12} /> {event.venue}
                        </span>
                        <span>
                          <Clock3 size={12} /> {event.time}
                        </span>
                      </div>
                      <div className="event-footer">
                        <a
                          className="event-link"
                          href={RSVP_URL}
                          target="_blank"
                          rel="noreferrer"
                        >
                          RSVP for this one <ArrowRight size={13} />
                        </a>
                        <a
                          className="rsvp-badge"
                          href={RSVP_URL}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`RSVP: ${rsvpCopy}`}
                        >
                          {event.initials.length > 0 && (
                            <span className="avatar-stack">
                              {event.initials.map(initial => (
                                <span className="avatar-dot" key={initial}>
                                  {initial}
                                </span>
                              ))}
                            </span>
                          )}
                          <span>{rsvpCopy}</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="activity-grid">
              <div className="activity-box">
                <h4>
                  <Users size={14} /> Make a little room
                </h4>
                <p>
                  Speed Friending
                  <br />
                  Hear Me Out
                  <br />
                  DJ Sets
                </p>
              </div>
              <div className="activity-box">
                <h4>
                  <Music2 size={14} /> Stay for the fun
                </h4>
                <p>
                  Open Mic
                  <br />
                  Games
                  <br />
                  Free Drink
                </p>
              </div>
            </div>
            <div className="recap">
              <div className="recap-heading">
                <h3>Last time at Tagpuan →</h3>
                <a href="#join">
                  Don't miss the next one <ArrowRight size={13} />
                </a>
              </div>
              <div
                className="recap-strip"
                aria-label="Photo recap from the last Tagpuan gathering"
              >
                {displayedRecaps.map((photo, index) => (
                  <button
                    className="recap-photo focus-ring"
                    key={photo.label}
                    style={
                      {
                        "--rotation": photo.rotation,
                        ...(photo.imageUrl
                          ? {
                              backgroundImage: `url(${photo.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : {}),
                      } as React.CSSProperties
                    }
                    onClick={event => {
                      lightboxTriggerRef.current = event.currentTarget;
                      setLightboxIndex(index);
                    }}
                    aria-label={`Open recap photo: ${photo.label}`}
                  >
                    <span className="sr-only">{photo.label}</span>
                  </button>
                ))}
              </div>
              <p className="recap-caption">
                The Social Room, Aug 29 — full house, plenty of unfinished
                ideas.
              </p>
            </div>
            <p className="events-signoff">
              Make time for things that excite you.
            </p>
          </div>
        </section>

        <section className="wall section-pad" id="wall">
          <div className="section-wrap">
            <div className="wall-head">
              <div>
                <p className="section-kicker">the board is yours</p>
                <h2 className="section-title">The Tagpuan Wall</h2>
              </div>
              <p className="wall-intro">
                A little corner of the internet for the things you are thinking
                about, working on, or hoping to find. Pin something small.
              </p>
            </div>
            <div className="wall-board">
              <div className="board-prompts">
                {wallLoading && (
                  <p className="col-span-full font-mono text-xs uppercase tracking-[.12em] text-[var(--espresso)]">
                    loading the board...
                  </p>
                )}
                {wallData?.items.map(note => (
                  <article
                    className={`wall-note ${note.tone} ${Date.now() - note.createdAt > 7 * 86_400_000 ? "aged" : ""}`}
                    style={
                      {
                        "--rotation": `${(note.id % 7) - 3}deg`,
                      } as React.CSSProperties
                    }
                    key={`note-${note.id}`}
                  >
                    <p>{note.body}</p>
                    <small>
                      {note.authorName || "anonymous kubo-dweller"} ·{" "}
                      {note.pinCount ? `${note.pinCount} pins` : "new note"}
                    </small>
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      <button
                        className="pushpin focus-ring"
                        type="button"
                        onClick={() => {
                          if (!pinnedNoteIds.includes(note.id)) {
                            setPinnedNoteIds(ids => [...ids, note.id]);
                            wallPinMutation.mutate({ id: note.id });
                          }
                        }}
                        aria-label="Pin this note"
                      >
                        <Pin size={12} />
                      </button>
                      <button
                        className="pushpin focus-ring"
                        type="button"
                        onClick={() =>
                          wallReportMutation.mutate({
                            targetType: "wall",
                            targetId: note.id,
                          })
                        }
                        aria-label="Report this note"
                      >
                        <Flag size={12} />
                      </button>
                    </div>
                  </article>
                ))}
                {prompts.map(prompt => (
                  <article
                    className={`wall-note ${prompt.tone} prompt`}
                    style={
                      { "--rotation": prompt.rotation } as React.CSSProperties
                    }
                    key={prompt.text}
                  >
                    <p>{prompt.text}</p>
                    <small>wall prompt · write yours</small>
                  </article>
                ))}
              </div>
            </div>
            <div className="wall-toolbar">
              <p>
                <Pin size={13} /> chronological · no login · 140 letters ·{" "}
                {wallData?.total ?? 0} live notes
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="pill pill-ghost !border-[var(--espresso)] !text-[var(--espresso)]"
                  type="button"
                  onClick={() => {
                    setWallArchive(!wallArchive);
                    setWallPage(1);
                  }}
                >
                  {wallArchive ? "Back to live wall" : "Wall Archive"}
                </button>
                <button
                  className="pill pill-dark"
                  type="button"
                  onClick={() => setWallOpen(!wallOpen)}
                >
                  <Plus size={16} /> Pin a note
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-4 font-mono text-[.65rem] uppercase tracking-[.08em] text-[var(--espresso)]">
              {wallPage > 1 && (
                <button
                  type="button"
                  onClick={() => setWallPage(page => page - 1)}
                >
                  ← newer
                </button>
              )}
              {wallData && wallData.total > wallPage * 12 && (
                <button
                  type="button"
                  onClick={() => setWallPage(page => page + 1)}
                >
                  older →
                </button>
              )}
            </div>
            <form
              className={`wall-form ${wallOpen ? "open" : ""}`}
              onSubmit={submitWall}
              aria-label="Pin a note form"
            >
              <div className="form-grid">
                <div className="form-field full">
                  <label htmlFor="wall-note">Your note</label>
                  <textarea
                    id="wall-note"
                    value={wallText}
                    onChange={event => setWallText(event.target.value)}
                    maxLength={140}
                    placeholder="what are you making time for?"
                    autoFocus={wallOpen}
                  />
                  <div className="char-count">
                    {140 - wallText.length} letters left
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="wall-name">Name (optional)</label>
                  <input
                    id="wall-name"
                    value={wallName}
                    onChange={event => setWallName(event.target.value)}
                    placeholder="anonymous kubo-dweller"
                  />
                </div>
              </div>
              <div className="form-footer">
                <span className="form-message" role="status">
                  {wallMessage}
                </span>
                <button className="pill pill-primary" type="submit">
                  <Pin size={16} /> Pin to the Wall
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="projects section-pad" id="projects">
          <div className="section-wrap">
            <div className="projects-head">
              <div>
                <p className="section-kicker">the quiet work in progress</p>
                <h2 className="section-title">Ginagawa Ko Ngayon</h2>
                <p className="section-copy">
                  What are people making right now? A small, chronological log
                  of work that is still becoming.
                </p>
              </div>
              <div
                className="tag-summary"
                aria-label="Weekly project tag summary"
              >
                {projectTags.map(tag => (
                  <span className="tag-chip" key={tag.label}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="project-feed">
              {projectLoading && (
                <p className="project-empty">loading the work in progress...</p>
              )}
              {projectData?.items.length
                ? projectData.items.map(update => (
                    <article className="project-row" key={update.id}>
                      <div className="author">
                        {update.authorName || "anonymous"}
                      </div>
                      <div>
                        <p className="update">{update.body}</p>
                        <span className="tag-chip">{update.tag}</span>
                      </div>
                      <div className="time">
                        <button
                          type="button"
                          onClick={() =>
                            projectReportMutation.mutate({
                              targetType: "project",
                              targetId: update.id,
                            })
                          }
                          aria-label="Report this project update"
                        >
                          <Flag size={12} /> report
                        </button>
                      </div>
                    </article>
                  ))
                : !projectLoading && (
                    <div className="project-empty">
                      <MessageCircle size={20} />
                      <p>
                        No updates pinned yet. Be the first to say what you are
                        working on.
                      </p>
                    </div>
                  )}
            </div>
            {projectData && projectData.total > 10 && (
              <div className="project-actions">
                <button
                  type="button"
                  onClick={() => setProjectPage(page => Math.max(1, page - 1))}
                >
                  ← newer
                </button>
                <button
                  type="button"
                  onClick={() => setProjectPage(page => page + 1)}
                >
                  older →
                </button>
              </div>
            )}
            <div className="project-actions">
              <button
                className="pill pill-dark"
                type="button"
                onClick={() => setProjectOpen(!projectOpen)}
              >
                <Plus size={16} /> Share an update
              </button>
              <a href="#wall">
                Or leave a note <ArrowRight size={14} />
              </a>
            </div>
            {projectOpen && (
              <form
                className="wall-form open"
                onSubmit={submitProject}
                aria-label="Share a passion project update form"
              >
                <div className="form-grid">
                  <div className="form-field full">
                    <label htmlFor="project-update">One-line update</label>
                    <input
                      id="project-update"
                      value={projectText}
                      onChange={event => setProjectText(event.target.value)}
                      maxLength={120}
                      placeholder="making a tiny lamp, learning Rust, writing the first page..."
                      autoFocus
                    />
                    <div className="char-count">
                      {120 - projectText.length} letters left
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="project-author">Name (optional)</label>
                    <input
                      id="project-author"
                      value={projectName}
                      onChange={event => setProjectName(event.target.value)}
                      placeholder="anonymous"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="project-tag">Tag</label>
                    <select
                      id="project-tag"
                      value={projectTag}
                      onChange={event => setProjectTag(event.target.value)}
                    >
                      <option>Tech</option>
                      <option>Art</option>
                      <option>Writing</option>
                      <option>Music</option>
                      <option>Research</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-footer">
                  <span className="form-message" role="status">
                    {projectMessage}
                  </span>
                  <button className="pill pill-primary" type="submit">
                    <Send size={15} /> Share update
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="spotlight section-pad" id="spotlight">
          <div className="section-wrap">
            <p className="section-kicker">people make the place</p>
            <h2 className="section-title">Kilala Mo Ba Sila?</h2>
            <div className="spotlight-card">
              <div
                className="spotlight-photo"
                role="img"
                aria-label="Warm grainy portrait placeholder for a Tagpuan member spotlight"
              />
              <div className="spotlight-copy">
                <p className="section-kicker">
                  KILALA MO BA SILA? — MEMBER SPOTLIGHT
                </p>
                <h3>{currentSpotlight.name}</h3>
                <p className="spotlight-role">{currentSpotlight.role}</p>
                <p className="spotlight-quote">“{currentSpotlight.quote}”</p>
                <p className="spotlight-event">
                  {("eventTag" in currentSpotlight
                    ? currentSpotlight.eventTag
                    : currentSpotlight.event) || "MEMBER SPOTLIGHT"}
                </p>
                <div className="spotlight-controls">
                  <button
                    className="pushpin focus-ring"
                    type="button"
                    onClick={() =>
                      setSpotlightIndex(index => Math.max(0, index - 1))
                    }
                    aria-label="Previous member spotlight"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button className="dot active" aria-label="Spotlight one" />
                  <button className="dot" aria-label="Spotlight two" />
                  <button className="dot" aria-label="Spotlight three" />
                  <button
                    className="pushpin focus-ring"
                    type="button"
                    onClick={() => setSpotlightIndex(index => (index + 1) % 3)}
                    aria-label="Next member spotlight"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="join section-pad" id="join">
          <div className="section-wrap join-grid">
            <div className="join-note">
              <span className="tape" aria-hidden="true" />
              <h3>An open collective for curious minds.</h3>
              <p>
                Meet people. Work on your passions. Share your progress. Or sit
                nearby while someone else does.
              </p>
              <a
                className="pill pill-primary"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 26 }}
              >
                Join the Collective <ArrowRight size={17} />
              </a>
            </div>
            <div>
              <p
                className="section-kicker"
                style={{ color: "var(--espresso)" }}
              >
                tara, sama ka
              </p>
              <p className="join-statement">work on what excites you.</p>
              <p className="join-sub">
                Code. Paint. Write. Read. Crochet. Compose. Create.
              </p>
              <div className="newsletter-note">
                <h4>Leave your note, we'll write back.</h4>
                {newsletterState === "success" ? (
                  <p className="newsletter-success" role="status">
                    pinned! we'll write back soon.
                  </p>
                ) : (
                  <form onSubmit={submitNewsletter}>
                    <div className="newsletter-row">
                      <label className="sr-only" htmlFor="newsletter-email">
                        Your email address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={event => {
                          setEmail(event.target.value);
                          setNewsletterState("idle");
                        }}
                        placeholder="you@example.com"
                        aria-invalid={newsletterState === "error"}
                        required
                      />
                      <button
                        className="pushpin focus-ring"
                        type="submit"
                        aria-label="Pin email signup"
                      >
                        <Mail size={17} />
                      </button>
                    </div>
                    {newsletterState === "error" && (
                      <p className="form-message" role="alert">
                        That email looks a little off. Try again?
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-pad" id="footer">
        <div className="section-wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand-lockup" href="#top">
                <HutMark size={37} />
              </a>
              <p>
                An open collective for people building their passions — a
                meeting place for the curious, the unfinished, and the excited.
              </p>
            </div>
            <div className="footer-links">
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">
                Facebook <ExternalLink size={12} />
              </a>
              <a href={RSVP_URL} target="_blank" rel="noreferrer">
                Luma / RSVP <ExternalLink size={12} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram <ExternalLink size={12} />
              </a>
              <a href="mailto:hello@tagpuan.community">
                Contact <Mail size={12} />
              </a>
            </div>
            <div className="map-card">
              <h4>where we usually are</h4>
              <a
                className="map-pin one"
                href="https://maps.google.com/?q=The+Den"
                target="_blank"
                rel="noreferrer"
                aria-label="Open The Den in maps"
              >
                <HutMark size={18} />
              </a>
              <span className="map-label one">The Den</span>
              <a
                className="map-pin two"
                href="https://maps.google.com/?q=Malaya's+Cafe+Grove"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Malaya's Cafe Grove in maps"
              >
                <HutMark size={18} />
              </a>
              <span className="map-label two">Malaya's Cafe — Grove</span>
              <a
                className="map-pin three"
                href="https://maps.google.com/?q=The+Social+Room"
                target="_blank"
                rel="noreferrer"
                aria-label="Open The Social Room in maps"
              >
                <HutMark size={18} />
              </a>
              <span className="map-label three">The Social Room</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-small">
              © 2026 Tagpuan · made for making time
            </span>
            <span className="footer-signoff">see you at the hut :)</span>
          </div>
        </div>
      </footer>

      {lightboxIndex !== null && (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Photo recap viewer"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="lightbox-panel"
            onClick={event => event.stopPropagation()}
          >
            <button
              ref={lightboxCloseRef}
              className="pushpin lightbox-close focus-ring"
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo viewer"
            >
              <X size={17} />
            </button>
            <div
              className={`lightbox-image recap-photo`}
              style={
                {
                  "--rotation": "0deg",
                  ...(displayedRecaps[lightboxIndex]?.imageUrl
                    ? {
                        backgroundImage: `url(${displayedRecaps[lightboxIndex].imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                } as React.CSSProperties
              }
              role="img"
              aria-label={displayedRecaps[lightboxIndex].label}
            />
            <div className="lightbox-nav">
              <button
                className="pill pill-dark"
                type="button"
                onClick={() =>
                  setLightboxIndex(index =>
                    index === null
                      ? 0
                      : (index + displayedRecaps.length - 1) %
                        displayedRecaps.length
                  )
                }
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span>
                {lightboxIndex + 1} / {displayedRecaps.length} ·{" "}
                {displayedRecaps[lightboxIndex].label}
              </span>
              <button
                className="pill pill-dark"
                type="button"
                onClick={() =>
                  setLightboxIndex(index =>
                    index === null ? 0 : (index + 1) % displayedRecaps.length
                  )
                }
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
