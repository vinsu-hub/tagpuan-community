// Tagpuan style: warm scrapbook operations — cream paper, brown ink, terracotta actions, editorial type, tactile artifacts.
// Wired to the live Tagpuan community API via tRPC. Honest empty states — no fabricated data.

// Bundled into the lazy /admin chunk (see App.tsx) — the public site never
// downloads it.
import "./admin.css";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { Link, useLocation } from "wouter";
import {
  ApplicantsPage,
  HearMeOutPage,
  MediaPage,
  NewsletterPage,
  ProjectsPage,
  RecapsPage,
  SpotlightsPage,
  WallPage,
} from "./AdminAdditionalPages";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Send,
  Settings2,
  Sparkles,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ImageUpload } from "@/components/ImageUpload";
import { useMenuA11y } from "@/hooks/useMenuA11y";

const asset = {
  mark: "/assets/tagpuan/mark.png",
  next: "/assets/tagpuan/next-gathering.jpg",
  sunday: "/assets/tagpuan/sunday-sessions.jpg",
  creative: "/assets/tagpuan/creative-nights.jpg",
  weeknight: "/assets/tagpuan/weeknight-hang.jpg",
};

const navGroups = [
  {
    label: "Events",
    items: [],
  },
];

const allNavGroups = [
  {
    label: "Events",
    items: [
      { label: "All Events", path: "/admin/events", icon: CalendarDays },
      { label: "Create Event", path: "/admin/events/new", icon: PlusCircle },
      { label: "Event Recaps", path: "/admin/recaps", icon: CalendarDays },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Wall", path: "/admin/wall", icon: MessageCircle },
      { label: "Passion Projects", path: "/admin/projects", icon: Sparkles },
      {
        label: "Applicants & RSVPs",
        path: "/admin/applicants",
        icon: UsersRound,
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Member Spotlights", path: "/admin/spotlights", icon: Sparkles },
      { label: "Hear Me Out", path: "/admin/hear-me-out", icon: MessageCircle },
      { label: "Media", path: "/admin/media", icon: CalendarDays },
    ],
  },
  {
    label: "Audience",
    items: [{ label: "Newsletter", path: "/admin/newsletter", icon: FileText }],
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  back,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {back}
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="header-actions">{action}</div> : null}
    </header>
  );
}

function TapedPhoto({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("taped-photo", className)}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="photo-placeholder">
          <CalendarDays size={26} />
        </span>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: ReactNode;
}) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyOverviewState({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof CalendarDays;
  title: string;
  copy: string;
}) {
  return (
    <div className="empty-state surface-card">
      <Icon size={28} />
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useMenuA11y(mobileOpen, () => setMobileOpen(false));
  const { user, logout } = useAuth();
  const isOverview = location === "/admin" || location === "/admin/";
  const activePath = isOverview ? "/admin" : location;

  const navigate = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

  const displayName = user?.name ?? "Admin";
  const email = user?.email ?? "";

  return (
    <div className="admin-root">
      <aside className={cn("admin-sidebar", mobileOpen && "mobile-open")}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <img src={asset.mark} alt="Tagpuan hut mark" />
            <div>
              <div className="brand-name">TAGPUAN</div>
              <div className="brand-subtitle">Admin Workspace</div>
            </div>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Admin navigation">
          <button
            className={cn("nav-item", isOverview && "active")}
            onClick={() => navigate("/admin")}
            type="button"
          >
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </button>
          {allNavGroups.map(group => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(item => {
                const Icon = item.icon;
                const active = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    className={cn("nav-item", active && "active")}
                    onClick={() => navigate(item.path)}
                    type="button"
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <div className="account-avatar">
            {(displayName[0] ?? "A").toUpperCase()}
          </div>
          <div className="account-copy">
            <strong>{displayName}</strong>
            <span>{email}</span>
          </div>
          <button
            className="account-logout"
            onClick={() => logout()}
            aria-label="Sign out"
            title="Sign out"
            type="button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          className="sidebar-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          type="button"
        />
      ) : null}

      <main className="admin-main">
        <div className="mobile-topbar">
          <button
            className="icon-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            type="button"
          >
            <Menu size={20} />
          </button>
          <div className="mobile-brand">
            TAGPUAN <span>ADMIN</span>
          </div>
          <Link
            className="mobile-preview"
            href="/"
            aria-label="Preview website"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
        {children}
        <footer className="admin-footer">
          <img src={asset.mark} alt="" />
          <span>Tagpuan Community Admin Panel</span>
          <span className="footer-dot">•</span>
          <span>Keep the space warm and the people closer.</span>
          <Sparkles size={14} />
        </footer>
      </main>
    </div>
  );
}

function OverviewPage() {
  const statsQuery = trpc.admin.dashboard.useQuery();
  const activityQuery = trpc.admin.activity.useQuery();
  const eventsQuery = trpc.admin.events.useQuery();
  const stats = statsQuery.data;
  const activity = activityQuery.data;
  const events = eventsQuery.data ?? [];

  const nextEvent = events
    .filter(event => event.isPublished === 1 && event.startsAt > Date.now())
    .sort((a, b) => a.startsAt - b.startsAt)[0];

  const news = [
    ...(activity?.wall ?? []).map(note => ({
      text: note.body,
      kind: "Wall note",
      at: note.createdAt,
    })),
    ...(activity?.projects ?? []).map(project => ({
      text: project.body,
      kind: "Passion project",
      at: project.createdAt,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 6);

  return (
    <div className="page-wrap">
      <PageHeader
        eyebrow="TAGPUAN ADMIN"
        title="Keep the scrapbook alive."
        description={
          <>
            Manage gatherings, review what the community shares,
            <br className="desktop-break" /> and keep the public surfaces
            current.
          </>
        }
        action={
          <Link className="button primary" href="/">
            <span>Preview website</span>
            <ArrowUpRight size={17} />
          </Link>
        }
      />

      <section className="stats-grid" aria-label="Community metrics">
        <StatCard value={stats?.upcomingEvents ?? 0} label="UPCOMING EVENTS" />
        <StatCard value={stats?.totalRsvps ?? 0} label="CONFIRMED RSVPS" />
        <StatCard value={stats?.wallNotes ?? 0} label="WALL NOTES" />
        <StatCard
          value={stats?.passionProjects ?? 0}
          label="PASSION PROJECTS"
        />
        <StatCard
          value={stats?.newsletterSubscribers ?? 0}
          label="NEWSLETTER SUBSCRIBERS"
        />
        <StatCard value={stats?.openReports ?? 0} label="OPEN REPORTS" />
      </section>

      <div className="overview-top-grid">
        <section className="surface-card next-card">
          <div className="card-heading">
            <h2>Next Gathering</h2>
          </div>
          {nextEvent ? (
            <div className="next-card-body">
              <TapedPhoto
                src={nextEvent.imageUrl ?? asset.next}
                alt={nextEvent.title}
                className="next-photo"
              />
              <div className="next-details">
                <h3>{nextEvent.title}</h3>
                <div className="dashed-rule" />
                <div className="meta-list">
                  <span>
                    <Calendar size={16} /> {nextEvent.dateLabel}
                  </span>
                  <span>
                    <Clock3 size={16} /> {nextEvent.timeLabel}
                  </span>
                  <span>
                    <MapPin size={16} /> {nextEvent.venue}
                  </span>
                  <span>
                    <UsersRound size={16} /> {nextEvent.attendeeCount}{" "}
                    registered
                  </span>
                </div>
                <div className="inline-actions">
                  <Link className="button primary small" href="/admin/events">
                    Manage events <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state surface-card">
              <CalendarDays size={28} />
              <h2>No upcoming events</h2>
              <p>Create your first published event to see it here.</p>
            </div>
          )}
        </section>

        <section className="surface-card activity-card">
          <div className="card-heading">
            <h2>Recent Community Activity</h2>
          </div>
          {news.length ? (
            <div className="activity-list">
              {news.map((entry, index) => (
                <div className="activity-row" key={index}>
                  <span className="activity-icon orange">
                    {entry.kind === "Wall note" ? (
                      <MessageCircle size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </span>
                  <span className="activity-text">{entry.text}</span>
                  <span className="activity-time">{entry.kind}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyOverviewState
              icon={MessageCircle}
              title="No recent activity"
              copy="New wall notes and projects will appear here as the community shares them."
            />
          )}
        </section>
      </div>

      <div className="overview-bottom-grid">
        <section className="surface-card list-card">
          <div className="card-heading">
            <h2>Wall Notes</h2>
            <Link href="/admin/wall">Review</Link>
          </div>
          {(activity?.wall ?? []).length ? (
            <div className="wall-list">
              {(activity?.wall ?? []).map(note => (
                <div className="wall-row" key={note.id}>
                  <span className="note-chip green">
                    <span />{" "}
                  </span>
                  <div>
                    <strong>{note.body}</strong>
                    <span>{note.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state surface-card">
              <MessageCircle size={24} />
              <h2>No wall notes yet</h2>
              <p>Notes will show up here as people post.</p>
            </div>
          )}
        </section>

        <section className="surface-card list-card attention-card">
          <div className="card-heading">
            <h2>Content Needing Attention</h2>
          </div>
          <div className="attention-list">
            <div className="attention-row">
              <span>
                <MessageCircle size={16} />
              </span>
              <strong>Open reports</strong>
              <b>{stats?.openReports ?? 0}</b>
            </div>
            <div className="attention-row">
              <span>
                <Sparkles size={16} />
              </span>
              <strong>Unpublished spotlights</strong>
              <b>{stats?.unpublishedSpotlights ?? 0}</b>
            </div>
            <div className="attention-row">
              <span>
                <CalendarDays size={16} />
              </span>
              <strong>Recap photos</strong>
              <b>{stats?.missingRecapPhotos ?? 0}</b>
            </div>
            <div className="attention-row">
              <span>
                <UsersRound size={16} />
              </span>
              <strong>Pending applicants</strong>
              <b>{stats?.pendingApplicants ?? 0}</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type EventRowData = {
  id: number;
  title: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  description: string;
  isPublished: number;
  imageUrl?: string | null;
  attendeeCount?: number | null;
  capacity?: number | null;
};

function EventRow({
  event,
  onAction,
}: {
  event: EventRowData;
  onAction: (message: string) => void;
}) {
  return (
    <article className="event-row surface-card">
      <div className="event-content">
        <div className="event-title-line">
          <h2>{event.title}</h2>
        </div>
        <div className="event-meta">
          <span>
            <Calendar size={16} /> {event.dateLabel}
          </span>
          <span>
            <Clock3 size={16} /> {event.timeLabel}
          </span>
          <span>
            <MapPin size={16} /> {event.venue}
          </span>
        </div>
        <p>{event.description}</p>
        <div className="event-counts">
          <span>
            <UsersRound size={16} /> {event.attendeeCount ?? 0} registered
          </span>
          {event.capacity ? (
            <>
              <i />
              <span>
                <UsersRound size={16} /> {event.capacity} capacity
              </span>
            </>
          ) : null}
        </div>
      </div>
      <div className="event-actions">
        <span
          className={cn(
            "status-badge",
            event.isPublished === 1 ? "published" : "draft"
          )}
        >
          <span />
          {event.isPublished === 1 ? "Published" : "Draft"}
        </span>
        <button
          className="icon-button event-menu"
          type="button"
          aria-label="More event actions"
          onClick={() =>
            onAction("Event editing is available on the public site.")
          }
        >
          <MoreHorizontal size={19} />
        </button>
      </div>
    </article>
  );
}

function EventsPage() {
  const { data: events = [], isLoading } = trpc.admin.events.useQuery();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return events.filter(event => {
      const matchesQuery =
        !normalized ||
        `${event.title} ${event.venue} ${event.description}`
          .toLowerCase()
          .includes(normalized);
      const matchesFilter =
        filter === "All" ||
        (filter === "Upcoming" &&
          event.isPublished === 1 &&
          event.startsAt > Date.now()) ||
        (filter === "Draft" && event.isPublished === 0);
      return matchesQuery && matchesFilter;
    });
  }, [filter, query, events]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="page-wrap events-page">
      <PageHeader
        eyebrow="EVENTS"
        title="What’s going on?"
        description="Manage gatherings, schedules, RSVPs, and event content."
        action={
          <Link className="button primary" href="/admin/events/new">
            <Plus size={18} /> Create event
          </Link>
        }
      />
      <div className="events-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Event filters">
          {["All", "Upcoming", "Draft"].map(item => (
            <button
              key={item}
              className={cn(filter === item && "active")}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="search-tools">
          <label className="search-field">
            <Search size={18} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search events..."
              aria-label="Search events"
            />
          </label>
          <button
            className="icon-button outline-icon"
            type="button"
            onClick={() => showNotice("More filters will be available here.")}
            aria-label="Open filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>
      <div className="event-list">
        {isLoading ? (
          <div className="empty-state surface-card">
            <CalendarDays size={28} />
            <h2>Loading events…</h2>
          </div>
        ) : filteredEvents.length ? (
          filteredEvents.map(event => (
            <EventRow
              key={event.id}
              event={{
                ...event,
                imageUrl: event.imageUrl,
                attendeeCount: event.attendeeCount,
                capacity: event.capacity ?? undefined,
              }}
              onAction={showNotice}
            />
          ))
        ) : (
          <div className="empty-state surface-card">
            <CalendarDays size={28} />
            <h2>No events found</h2>
            <p>Try another search or choose a different filter.</p>
          </div>
        )}
      </div>
      {notice ? (
        <div className="toast neutral">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      ) : null}
    </div>
  );
}

const activityOptions = [
  "Speed Friending",
  "Open Mic",
  "Hear Me Out",
  "Games",
  "DJ Sets",
  "Free Drinks",
];

function CreateEventPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [daysFromNow, setDaysFromNow] = useState<number | null>(null);
  const [timeLabel, setTimeLabel] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [status, setStatus] = useState("published");
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "neutral";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();
  const createMutation = trpc.admin.createEvent.useMutation({
    onSuccess: () => {
      setNotice({
        message: `Event “${name || "Untitled event"}” saved.`,
        tone: "success",
      });
      window.setTimeout(() => setNotice(null), 2800);
      setName("");
      setSlug("");
      setDateLabel("");
      setDaysFromNow(null);
      setTimeLabel("");
      setVenue("");
      setCapacity("");
      setDescription("");
      setImageUrl("");
      setImageAlt("");
      setSelectedActivities([]);
      utils.admin.events.invalidate();
    },
  });

  const notify = (message: string, tone: "success" | "neutral" = "neutral") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 2800);
  };

  const toggleActivity = (item: string) =>
    setSelectedActivities(current =>
      current.includes(item)
        ? current.filter(activity => activity !== item)
        : [...current, item]
    );

  const handleSubmit = async (kind: "draft" | "publish") => {
    if (!name.trim() || !slug.trim() || !venue.trim()) {
      notify("Please fill in the event name, slug, and venue.", "neutral");
      return;
    }
    setIsSubmitting(true);
    const startsAt = daysFromNow
      ? Date.now() + daysFromNow * 24 * 60 * 60 * 1000
      : Date.now();
    try {
      await createMutation.mutateAsync({
        slug: slug.trim(),
        title: name.trim(),
        dateLabel: dateLabel.trim() || "TBA",
        startsAt,
        venue: venue.trim(),
        timeLabel: timeLabel.trim() || "TBA",
        rsvpUrl: "https://tagpuan.community/events",
        capacity: capacity ? Number(capacity) : null,
        imageUrl: imageUrl || null,
        imageAlt: imageAlt.trim() || null,
        description: description.trim() || "Join us.",
        activities: selectedActivities.length
          ? selectedActivities
          : ["Hear Me Out"],
        isPublished: status === "published" ? 1 : 0,
      });
    } catch {
      notify("Timeline is offline. Event not saved.", "neutral");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap create-page">
      <PageHeader
        eyebrow="EVENTS  ›  CREATE EVENT"
        title="Create Event"
        description="Add the details of your gathering and publish it for the community."
        action={
          <button
            className="button primary"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("publish")}
          >
            <Send size={16} /> Create event <ArrowUpRight size={15} />
          </button>
        }
      />

      <div className="create-grid">
        <section className="surface-card form-card event-info-card">
          <div className="section-title">
            <h2>Event Information</h2>
          </div>
          <label className="field-label">
            Event name <span>*</span>
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Give your gathering a name"
            />
          </label>
          <label className="field-label">
            Slug <span>*</span>
            <input
              value={slug}
              onChange={event => setSlug(event.target.value)}
              placeholder="the-social-room"
            />
          </label>
          <div className="form-three">
            <label className="field-label">
              Date label
              <div className="input-with-icon">
                <Calendar size={17} />
                <input
                  value={dateLabel}
                  onChange={event => setDateLabel(event.target.value)}
                  placeholder="Aug 29, 2026"
                />
              </div>
            </label>
            <label className="field-label">
              Days from now
              <div className="input-with-icon">
                <Clock3 size={17} />
                <input
                  type="number"
                  min="0"
                  value={daysFromNow ?? ""}
                  onChange={event =>
                    setDaysFromNow(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </div>
            </label>
            <label className="field-label">
              Time label
              <div className="input-with-icon">
                <Clock3 size={17} />
                <input
                  value={timeLabel}
                  onChange={event => setTimeLabel(event.target.value)}
                  placeholder="7:00 PM"
                />
              </div>
            </label>
          </div>
          <label className="field-label">
            Venue <span>*</span>
            <div className="input-with-icon">
              <MapPin size={17} />
              <input
                value={venue}
                onChange={event => setVenue(event.target.value)}
              />
            </div>
          </label>
          <label className="field-label">
            Capacity
            <div className="input-with-icon">
              <UsersRound size={17} />
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={event => setCapacity(event.target.value)}
              />
            </div>
          </label>
        </section>

        <section className="surface-card form-card description-card">
          <div className="section-title">
            <h2>Event Description</h2>
          </div>
          <textarea
            value={description}
            onChange={event =>
              event.target.value.length <= 2000 &&
              setDescription(event.target.value)
            }
            placeholder="Describe your event, what to expect, and why people should join..."
          />
          <div className="char-count">{description.length} / 2000</div>
        </section>

        <section className="surface-card form-card">
          <div className="section-title">
            <h2>Cover Image</h2>
          </div>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            folder="events"
            label="Event cover"
          />
          <label className="field-label">
            Image description
            <input
              value={imageAlt}
              onChange={event => setImageAlt(event.target.value)}
              placeholder="What the photo shows (for accessibility)"
            />
          </label>
        </section>

        <section className="surface-card form-card activities-card">
          <div className="section-title">
            <h2>Activities</h2>
            <p>Select the activities that will be part of this event.</p>
          </div>
          <div className="activity-options">
            {activityOptions.map(item => (
              <label className="check-card" key={item}>
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(item)}
                  onChange={() => toggleActivity(item)}
                />
                <span className="custom-check">
                  <Check size={13} />
                </span>
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card form-card publishing-card">
          <div className="section-title">
            <h2>Publishing</h2>
          </div>
          <div className="publishing-options">
            <label
              className={cn(
                "publish-option",
                status === "published" && "selected"
              )}
            >
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={event => setStatus(event.target.value)}
              />
              <span className="radio-dot" />
              <span>
                <strong>Published</strong>
                <small>
                  Publish event and make it visible to the community.
                </small>
              </span>
            </label>
            <label
              className={cn("publish-option", status === "draft" && "selected")}
            >
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={event => setStatus(event.target.value)}
              />
              <span className="radio-dot" />
              <span>
                <strong>Draft</strong>
                <small>Save and publish later.</small>
              </span>
            </label>
          </div>
        </section>
      </div>
      {notice ? (
        <div className={cn("toast", notice.tone)}>
          {notice.tone === "success" ? <CheckCircle2 size={17} /> : null}
          {notice.message}
        </div>
      ) : null}
    </div>
  );
}

function FallbackPlaceholder({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: ReactNode;
}) {
  return (
    <div className="page-wrap">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
    </div>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-root">
        <div className="page-wrap">
          <p style={{ padding: "2rem", opacity: 0.7 }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") {
      window.location.assign("/login?redirect=/admin");
    }
    return null;
  }

  if (user && user.role !== "admin") {
    return (
      <div className="admin-root">
        <div className="page-wrap">
          <div
            className="empty-state surface-card"
            style={{ margin: "3rem auto", maxWidth: 460 }}
          >
            <h2>Admin access required</h2>
            <p>This account is signed in but is not an admin for Tagpuan.</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminWorkspace() {
  return (
    <AdminGate>
      <AdminWorkspaceInner />
    </AdminGate>
  );
}

function AdminWorkspaceInner() {
  const [location] = useLocation();
  let content: ReactNode;
  if (location === "/admin" || location === "/admin/")
    content = <OverviewPage />;
  else if (location === "/admin/events") content = <EventsPage />;
  else if (location === "/admin/events/new") content = <CreateEventPage />;
  else if (location === "/admin/recaps") content = <RecapsPage />;
  else if (location === "/admin/wall") content = <WallPage />;
  else if (location === "/admin/projects") content = <ProjectsPage />;
  else if (location === "/admin/applicants") content = <ApplicantsPage />;
  else if (location === "/admin/spotlights") content = <SpotlightsPage />;
  else if (location === "/admin/hear-me-out") content = <HearMeOutPage />;
  else if (location === "/admin/media") content = <MediaPage />;
  else if (location === "/admin/newsletter") content = <NewsletterPage />;
  else
    content = (
      <FallbackPlaceholder
        eyebrow="WORKSPACE"
        title="This space is ready for your community."
        description={
          <>The workspace shell is live and connected to Tagpuan data.</>
        }
      />
    );

  return <AdminShell>{content}</AdminShell>;
}
