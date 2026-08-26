import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Pin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

const FACEBOOK_URL = "https://facebook.com/tagpuancommunity";
const RSVP_URL = "https://lu.ma/";
const TAGPUAN_LOGO_URL = "/manus-storage/LOGOONLY_7725599d.png";

function HutMark({ size = 36 }: { size?: number }) {
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

function PageFrame({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--espresso)]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--paper)] focus:px-4 focus:py-3"
        href="#page-content"
      >
        Skip to content
      </a>
      <header className="hero-surface grain-dark" style={{ minHeight: "auto" }}>
        <nav className="site-nav">
          <a className="brand-lockup" href="/">
            <HutMark size={35} />
          </a>
          <button
            className="nav-toggle focus-ring"
            type="button"
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-controls="inner-page-links"
            aria-label={navOpen ? "Close menu" : "Open menu"}
          >
            {navOpen ? "×" : "☰"}
          </button>
          <div
            id="inner-page-links"
            className={`nav-links ${navOpen ? "open" : ""}`}
          >
            <a href="/about" onClick={() => setNavOpen(false)}>
              About
            </a>
            <a href="/events" onClick={() => setNavOpen(false)}>
              What's Going On
            </a>
            <a href="/wall" onClick={() => setNavOpen(false)}>
              The Wall
            </a>
            <a href="/projects" onClick={() => setNavOpen(false)}>
              Ginagawa Ko Ngayon
            </a>
            <a href="/people" onClick={() => setNavOpen(false)}>
              Kilala Mo Ba Sila?
            </a>
            <a href="/join" onClick={() => setNavOpen(false)}>
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
        <div className="event-ribbon">
          <HutMark size={18} />
          <span>Sunod na Tagpuan · Next gathering:</span>
          <a href="/events">
            Sat Aug 29 · The Social Room <ArrowRight size={12} />
          </a>
        </div>
        <div className="section-wrap" style={{ padding: "75px 0 88px" }}>
          <p className="section-kicker" style={{ color: "var(--ember)" }}>
            {eyebrow}
          </p>
          <h1 className="section-title light" style={{ maxWidth: 750 }}>
            {title}
          </h1>
          <p className="section-copy light" style={{ maxWidth: 650 }}>
            {intro}
          </p>
        </div>
      </header>
      <main id="page-content">{children}</main>
      <footer className="footer section-pad">
        <div
          className="section-wrap footer-bottom"
          style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}
        >
          <a className="brand-lockup" href="/">
            <HutMark size={35} />
          </a>
          <span className="footer-signoff">see you at the hut :)</span>
        </div>
      </footer>
    </div>
  );
}

const eventItems = ["Sunday Sessions", "Open Table", "Night Shift"];

export function EventsPage() {
  return (
    <PageFrame
      eyebrow="gather in real life"
      title="What's Going On?"
      intro="A little focus. A little chaos. A lot of people making room for one another. Find the next thing that feels like your kind of evening."
    >
      <section className="section-pad">
        <div className="section-wrap">
          <div
            className="events-scroll"
            style={{ margin: 0, padding: "18px 0 38px" }}
          >
            {eventItems.map((item, index) => (
              <article
                className="event-card"
                style={
                  {
                    "--rotation": `${index % 2 ? 1.2 : -1.2}deg`,
                  } as React.CSSProperties
                }
                key={item}
              >
                <div className="event-card-bg" />
                <div className="event-card-inner">
                  <div
                    className={`event-photo ${["one", "two", "three"][index]}`}
                  >
                    <span className="photo-word">come through</span>
                  </div>
                  <p className="event-date">
                    {index === 0
                      ? "AUG 29 · SATURDAY"
                      : index === 1
                        ? "SEP 12 · SATURDAY"
                        : "SEP 26 · SATURDAY"}
                  </p>
                  <h3>{item}</h3>
                  <p>
                    Bring the thing you are making. Stay for the people you
                    meet.
                  </p>
                  <div className="event-meta">
                    <span>
                      <MapPin size={12} />{" "}
                      {index === 1 ? "The Den" : "The Social Room"}
                    </span>
                    <span>
                      <CalendarDays size={12} /> 7:00 PM
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
                    <span className="rsvp-badge">
                      {index ? `${index + 2} are going` : "+11 others going"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
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
                <Sparkles size={14} /> Stay for the fun
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
          <div
            className="starter-card"
            style={{ marginTop: 70, transform: "rotate(-.7deg)" }}
          >
            <h3 className="font-display">Last time at Tagpuan →</h3>
            <p className="section-copy">
              The Social Room, Aug 29 — full house, plenty of unfinished ideas.
            </p>
            <a className="pill pill-primary" href="/">
              Back to the home scrapbook <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

export function AboutPage() {
  return (
    <PageFrame
      eyebrow="meet tagpuan"
      title="A meeting place for the unfinished."
      intro="Tagpuan is an open collective for people building their passions — not for school, not for work, and never only for people who already know what they are doing."
    >
      <section className="about section-pad">
        <div className="section-wrap">
          <div className="about-grid">
            {[
              [
                Users,
                "Who's it for?",
                "Anyone pursuing an idea, project, craft, or passion.",
              ],
              [
                MessageCircle,
                "What is it?",
                "Part co-working session, part community hangout.",
              ],
              [
                Heart,
                "Why come?",
                "Because making things is better with people nearby.",
              ],
              [
                Sparkles,
                "What can you do?",
                "Code. Paint. Write. Read. Crochet. Compose. Create.",
              ],
            ].map(([Icon, label, copy]) => {
              const Component = Icon as typeof Users;
              return (
                <article className="about-cell" key={label as string}>
                  <Component className="about-icon" size={28} />
                  <h3>{label as string}</h3>
                  <p>{copy as string}</p>
                </article>
              );
            })}
          </div>
          <div className="starter-wrap">
            <div className="starter-intro">
              <p className="section-kicker">for first-timers</p>
              <h3>New Here?</h3>
              <p className="section-copy">
                No secret handshake. No finished project required.
              </p>
            </div>
            <div className="starter-card">
              <ol className="starter-list">
                <li>
                  <span className="checkbox-sketch">1</span>
                  <span>
                    <strong>Come to a session</strong>
                    <span>Show up, no experience required.</span>
                  </span>
                </li>
                <li>
                  <span className="checkbox-sketch">2</span>
                  <span>
                    <strong>Find your people</strong>
                    <span>Speed friending, open mic, or just hang.</span>
                  </span>
                </li>
                <li>
                  <span className="checkbox-sketch">3</span>
                  <span>
                    <strong>Bring your passion</strong>
                    <span>Next time, bring the thing you are building.</span>
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

export function WallPage() {
  const [text, setText] = useState("");
  return (
    <PageFrame
      eyebrow="the board is yours"
      title="The Tagpuan Wall"
      intro="Pin something small. Leave a trace. Come back later and see what the collective is carrying together."
    >
      <section className="wall section-pad">
        <div className="section-wrap">
          <div className="wall-board">
            <div className="board-prompts">
              <article
                className="wall-note mustard"
                style={{ "--rotation": "-2deg" } as React.CSSProperties}
              >
                <p>what are you making time for?</p>
                <small>your note could go here</small>
              </article>
              <article
                className="wall-note sage"
                style={{ "--rotation": "2deg" } as React.CSSProperties}
              >
                <p>pin a small beginning.</p>
                <small>chronological · no login</small>
              </article>
              <article
                className="wall-note rose"
                style={{ "--rotation": "-1deg" } as React.CSSProperties}
              >
                <p>find your people.</p>
                <small>wall archive →</small>
              </article>
            </div>
          </div>
          <form
            className="wall-form open"
            onSubmit={e => {
              e.preventDefault();
              setText("");
            }}
          >
            <div className="form-field">
              <label htmlFor="page-note">Your note</label>
              <textarea
                id="page-note"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={140}
                placeholder="what are you making time for?"
              />
              <span className="char-count">
                {140 - text.length} letters left
              </span>
            </div>
            <div className="form-footer">
              <span className="form-message" role="status">
                No login needed. Notes go up after a quick moderation check.
              </span>
              <button className="pill pill-primary">
                <Pin size={15} /> Pin this note
              </button>
            </div>
          </form>
        </div>
      </section>
    </PageFrame>
  );
}

export function ProjectsPage() {
  return (
    <PageFrame
      eyebrow="the quiet work in progress"
      title="Ginagawa Ko Ngayon"
      intro="A small, chronological log of what the collective is making right now. Not a feed to doomscroll — just enough to make the work feel less alone."
    >
      <section className="projects section-pad">
        <div className="section-wrap">
          <div className="tag-summary">
            <span className="tag-chip">14 in Tech</span>
            <span className="tag-chip">6 in Art</span>
            <span className="tag-chip">5 in Writing</span>
            <span className="tag-chip">3 in Music</span>
          </div>
          <div className="project-feed">
            <article className="project-row">
              <div className="author">you, maybe?</div>
              <div>
                <p className="update">
                  Share one line about the thing you are building.
                </p>
                <span className="tag-chip">Other</span>
              </div>
              <div className="time">newest first</div>
            </article>
          </div>
          <a className="pill pill-dark" href="/">
            Back to the home scrapbook <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </PageFrame>
  );
}

export function PeoplePage() {
  return (
    <PageFrame
      eyebrow="people make the place"
      title="Kilala Mo Ba Sila?"
      intro="Real people, real work in progress, and the small details that turn a gathering into a community."
    >
      <section className="spotlight section-pad">
        <div className="section-wrap">
          <div className="spotlight-card">
            <div
              className="spotlight-photo"
              role="img"
              aria-label="Warm Tagpuan member spotlight portrait placeholder"
            />
            <div className="spotlight-copy">
              <p className="section-kicker">MEMBER SPOTLIGHT</p>
              <h3>Mika Santos</h3>
              <p className="spotlight-role">Product designer, weekend potter</p>
              <p className="spotlight-quote">
                “What I'm working on right now: a tiny ceramic lamp series, and
                getting better at asking people what they are excited about.”
              </p>
              <p className="spotlight-event">
                FEATURED AT: SUNDAY SESSIONS · AUG 29
              </p>
              <a className="pill pill-primary" href="/events">
                Meet the next people <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

export function JoinPage() {
  return (
    <PageFrame
      eyebrow="tara, sama ka"
      title="Work on what excites you."
      intro="Meet people. Work on your passions. Share your progress. Come for one gathering, or keep finding your way back."
    >
      <section className="join section-pad">
        <div className="section-wrap join-grid">
          <div className="join-note">
            <h3>An open collective for curious minds.</h3>
            <p>There is room for the idea you have not started yet.</p>
            <a
              className="pill pill-primary"
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
            >
              Join the Collective <ArrowRight size={15} />
            </a>
          </div>
          <div>
            <p className="join-statement">work on what excites you.</p>
            <p className="join-sub">
              Code. Paint. Write. Read. Crochet. Compose. Create.
            </p>
            <div className="newsletter-note">
              <h4>Leave your note, we'll write back.</h4>
              <div className="newsletter-row">
                <input
                  aria-label="Email address"
                  placeholder="you@example.com"
                />
                <button className="pushpin" aria-label="Submit email">
                  <Plus size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
