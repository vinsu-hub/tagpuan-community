import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Image,
  LayoutDashboard,
  Mail,
  MapPin,
  Plus,
  Search,
  Save,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

const interestOptions = [
  "Art & Design",
  "Technology",
  "Writing & Storytelling",
  "Music & Performance",
  "Research & Learning",
  "Community & Startups",
];
const defaultRegistration = {
  name: "",
  email: "",
  background: "",
  currentInterests: "",
  topInterests: [] as string[],
  heardFrom: "",
  hotTake: "",
  nightSuggestion: "",
  photoConsent: false,
};

function RegistrationPage() {
  const [location] = useLocation();
  const [registration, setRegistration] = useState(defaultRegistration);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const eventSlug =
    new URLSearchParams(location.split("?")[1] ?? "").get("event") ??
    "sunday-sessions";
  const eventsQuery = trpc.content.events.useQuery();
  const selectedEvent = eventsQuery.data?.find(
    event => event.slug === eventSlug
  );
  const registrationMutation = trpc.registrations.create.useMutation({
    onSuccess: result => {
      setSubmitted(true);
      setMessage(result.message);
    },
    onError: error => setMessage(error.message),
  });
  const title =
    selectedEvent?.title === "Sunday Sessions"
      ? "Saturday Night Session"
      : (selectedEvent?.title ?? "Saturday Night Session");
  const dateLabel = selectedEvent?.dateLabel ?? "AUG 29 · SATURDAY";
  const timeLabel = selectedEvent?.timeLabel ?? "7:00 PM – 11:00 PM";
  const venue = selectedEvent?.venue ?? "The Social Room";
  function toggleInterest(interest: string) {
    setRegistration(current => ({
      ...current,
      topInterests: current.topInterests.includes(interest)
        ? current.topInterests.filter(item => item !== interest)
        : current.topInterests.length < 3
          ? [...current.topInterests, interest]
          : current.topInterests,
    }));
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!registration.photoConsent)
      return setMessage(
        "Please confirm the photo and video consent to register."
      );
    if (!registration.topInterests.length)
      return setMessage(
        "Choose at least one interest so we know what brings you here."
      );
    registrationMutation.mutate({
      eventSlug,
      eventId: selectedEvent?.id ?? null,
      ...registration,
      photoConsent: true,
    });
  }
  return (
    <div className="registration-page grain-paper">
      <header className="registration-page-header">
        <Link href="/" className="back-home-link">
          <ArrowRight size={15} /> Back to the home scrapbook
        </Link>
        <p className="section-kicker">registration · {dateLabel}</p>
        <h1>{title}</h1>
        <p>
          {timeLabel} · {venue}
        </p>
      </header>
      <main className="registration-page-main">
        <section className="registration-page-intro">
          <p className="section-kicker">your info</p>
          <h2>Make room for a new idea.</h2>
          <p>
            Welcome. Fill this out so we know who’s coming and what you’re
            excited about. Admission is free and slots are limited.
          </p>
        </section>
        {submitted ? (
          <div
            className="registration-success registration-page-success"
            role="status"
          >
            <Check size={26} />
            <strong>{message}</strong>
            <p>Your spot is saved for {title}. We’ll see you at the hut.</p>
            <Link className="pill pill-primary" href="/">
              Return to Tagpuan <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form
            className="registration-form registration-page-form"
            onSubmit={submit}
          >
            <label>
              Name <span aria-hidden="true">*</span>
              <input
                required
                value={registration.name}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label>
              Email <span aria-hidden="true">*</span>
              <input
                required
                type="email"
                value={registration.email}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>
            <label>
              Tell us a little about yourself <span aria-hidden="true">*</span>
              <small>(your field/industry, school, work, or side quests)</small>
              <textarea
                required
                minLength={10}
                value={registration.background}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    background: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              What are you into these days? <span aria-hidden="true">*</span>
              <small>
                (interests, hobbies, projects, or anything you’re into)
              </small>
              <textarea
                required
                minLength={10}
                value={registration.currentInterests}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    currentInterests: event.target.value,
                  }))
                }
              />
            </label>
            <fieldset className="registration-interest-fieldset">
              <legend>
                What are some things you’re interested in?{" "}
                <span aria-hidden="true">*</span> <small>(pick up to 3)</small>
              </legend>
              <div className="registration-interest-grid">
                {interestOptions.map(interest => (
                  <label key={interest}>
                    <input
                      type="checkbox"
                      checked={registration.topInterests.includes(interest)}
                      onChange={() => toggleInterest(interest)}
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              How did you hear about Tagpuan? <span aria-hidden="true">*</span>
              <select
                required
                value={registration.heardFrom}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    heardFrom: event.target.value,
                  }))
                }
              >
                <option value="">Select one</option>
                <option>Friend or community member</option>
                <option>Facebook or Instagram</option>
                <option>Event listing</option>
                <option>University or workplace</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Got a hot take? <small>(we might use it for a game)</small>
              <textarea
                value={registration.hotTake}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    hotTake: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Have a suggestion for the night?{" "}
              <small>(games, songs, activities, anything else)</small>
              <textarea
                value={registration.nightSuggestion}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    nightSuggestion: event.target.value,
                  }))
                }
              />
            </label>
            <label className="registration-consent">
              <input
                required
                type="checkbox"
                checked={registration.photoConsent}
                onChange={event =>
                  setRegistration(current => ({
                    ...current,
                    photoConsent: event.target.checked,
                  }))
                }
              />
              <span>
                I agree that Tagpuan may take and use event photos or videos for
                community updates and social media.
              </span>
            </label>
            {message && (
              <p className="registration-error" role="alert">
                {message}
              </p>
            )}
            <button
              className="pill pill-primary registration-submit"
              disabled={registrationMutation.isPending}
              type="submit"
            >
              {registrationMutation.isPending
                ? "Saving your spot…"
                : "Register for this session"}{" "}
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

type EventDraft = {
  id?: number;
  slug: string;
  title: string;
  dateLabel: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  venueAddress: string;
  timeLabel: string;
  capacity: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  activities: string;
  isPublished: boolean;
};
const emptyDraft: EventDraft = {
  slug: "",
  title: "",
  dateLabel: "",
  startsAt: "",
  endsAt: "",
  venue: "",
  venueAddress: "",
  timeLabel: "",
  capacity: "",
  imageUrl: "",
  imageAlt: "",
  description: "",
  activities: "",
  isPublished: true,
};
function AdminPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<
    "overview" | "events" | "create" | "applicants" | "content"
  >("overview");
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [eventFilter, setEventFilter] = useState<
    "all" | "upcoming" | "draft" | "past"
  >("all");
  const [eventSearch, setEventSearch] = useState("");
  const [message, setMessage] = useState("");
  const events = trpc.admin.events.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const applicants = trpc.admin.registrations.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const dashboard = trpc.admin.dashboard.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const createEvent = trpc.admin.createEvent.useMutation({
    onSuccess: result => {
      setMessage(result.message);
      setDraft(emptyDraft);
      events.refetch();
    },
    onError: error => setMessage(error.message),
  });
  const updateEvent = trpc.admin.updateEvent.useMutation({
    onSuccess: result => {
      setMessage(result.message);
      events.refetch();
    },
    onError: error => setMessage(error.message),
  });
  const updateStatus = trpc.admin.updateRegistrationStatus.useMutation({
    onSuccess: () => applicants.refetch(),
    onError: error => setMessage(error.message),
  });
  const confirmed =
    applicants.data?.filter(item => item.status === "confirmed").length ?? 0;
  const nextEvent = events.data
    ?.filter(event => event.startsAt > Date.now() && event.isPublished)
    .sort((a, b) => a.startsAt - b.startsAt)[0];
  const filteredEvents = useMemo(() => {
    const normalizedSearch = eventSearch.trim().toLowerCase();
    return (events.data ?? []).filter(event => {
      const matchesFilter =
        eventFilter === "all" ||
        (eventFilter === "upcoming" &&
          event.startsAt >= Date.now() &&
          Boolean(event.isPublished)) ||
        (eventFilter === "draft" && !event.isPublished) ||
        (eventFilter === "past" && event.startsAt < Date.now());
      const matchesSearch =
        !normalizedSearch ||
        `${event.title} ${event.venue}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [eventFilter, eventSearch, events.data]);
  const submitEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      slug: draft.slug,
      title: draft.title,
      dateLabel: draft.dateLabel,
      startsAt: new Date(draft.startsAt).getTime(),
      endsAt: draft.endsAt ? new Date(draft.endsAt).getTime() : null,
      venue: draft.venue,
      venueAddress: draft.venueAddress || undefined,
      timeLabel: draft.timeLabel,
      capacity: draft.capacity ? Number(draft.capacity) : null,
      imageUrl: draft.imageUrl || null,
      imageAlt: draft.imageAlt || null,
      description: draft.description,
      activities: draft.activities
        .split(",")
        .map(item => item.trim())
        .filter(Boolean),
      isPublished: draft.isPublished ? 1 : 0,
      rsvpUrl: "https://tagpuan.community/events",
    };
    if (draft.id) updateEvent.mutate({ id: draft.id, changes: payload });
    else createEvent.mutate(payload);
  };
  if (!user)
    return (
      <DashboardLayout>
        <div className="admin-denied">
          <h1>Sign in to access Tagpuan Admin</h1>
          <p>This workspace is limited to authenticated community managers.</p>
        </div>
      </DashboardLayout>
    );
  if (user.role !== "admin")
    return (
      <DashboardLayout>
        <div className="admin-denied">
          <h1>Admin access required</h1>
          <p>
            Your account is signed in, but it does not have content-manager
            permissions.
          </p>
        </div>
      </DashboardLayout>
    );
  return (
    <DashboardLayout>
      <div className="admin-shell">
        <div className="admin-header">
          <div>
            <p className="section-kicker">tagpuan admin</p>
            <h1>Keep the scrapbook alive.</h1>
            <p>
              Manage gatherings, review who’s coming, and keep the community
              surfaces current.
            </p>
          </div>
          <Link className="pill pill-primary" href="/">
            Preview website <ArrowRight size={15} />
          </Link>
        </div>
        <nav className="admin-tabs" aria-label="Admin sections">
          {[
            ["overview", LayoutDashboard, "Overview"],
            ["events", Plus, "Events"],
            ["applicants", Users, "Applicants"],
            ["content", Image, "Content & Media"],
          ].map(([key, Icon, label]) => (
            <button
              className={section === key ? "active" : ""}
              key={key as string}
              type="button"
              onClick={() => setSection(key as typeof section)}
            >
              {<Icon size={16} />}
              {label as string}
            </button>
          ))}
        </nav>
        {message && (
          <p className="admin-message" role="status">
            {message}
          </p>
        )}
        {section === "overview" && (
          <>
            <div className="admin-stat-grid admin-stat-grid-six">
              {[
                [
                  ClipboardList,
                  dashboard.data?.upcomingEvents ?? 0,
                  "Upcoming events",
                ],
                [Users, dashboard.data?.totalRsvps ?? confirmed, "Total RSVPs"],
                [
                  Users,
                  dashboard.data?.pendingApplicants ??
                    applicants.data?.length ??
                    0,
                  "Applicants",
                ],
                [ClipboardList, dashboard.data?.wallNotes ?? 0, "Wall notes"],
                [
                  LayoutDashboard,
                  dashboard.data?.passionProjects ?? 0,
                  "Passion projects",
                ],
                [
                  Mail,
                  dashboard.data?.newsletterSubscribers ?? 0,
                  "Newsletter subscribers",
                ],
              ].map(([Icon, value, label]) => {
                const MetricIcon = Icon as typeof ClipboardList;
                return (
                  <article key={label as string}>
                    <MetricIcon size={20} />
                    <strong>{value as number}</strong>
                    <span>{label as string}</span>
                  </article>
                );
              })}
            </div>
            <div className="admin-overview-grid">
              <section className="admin-card admin-next-gathering">
                <div className="admin-card-heading">
                  <div>
                    <p className="section-kicker">next gathering</p>
                    <h2>{nextEvent?.title ?? "No upcoming gathering"}</h2>
                  </div>
                  {nextEvent && (
                    <span className="admin-badge">{nextEvent.dateLabel}</span>
                  )}
                </div>
                {nextEvent ? (
                  <div className="admin-next-body">
                    <div
                      className="admin-next-photo"
                      style={
                        nextEvent.imageUrl
                          ? { backgroundImage: `url(${nextEvent.imageUrl})` }
                          : undefined
                      }
                      aria-label={nextEvent.imageAlt ?? `${nextEvent.title} photo`}
                      role="img"
                    />
                    <div className="admin-next-copy">
                      <p className="admin-next-meta">
                      {nextEvent.venue} · {nextEvent.timeLabel}
                    </p>
                    <p>{nextEvent.description}</p>
                    <div className="admin-action-row">
                      <button
                        className="pill pill-primary"
                        type="button"
                        onClick={() => {
                          setSection("create");
                          setDraft({
                            id: nextEvent.id,
                            slug: nextEvent.slug,
                            title: nextEvent.title,
                            dateLabel: nextEvent.dateLabel,
                            startsAt: new Date(nextEvent.startsAt)
                              .toISOString()
                              .slice(0, 16),
                            endsAt: nextEvent.endsAt
                              ? new Date(nextEvent.endsAt)
                                  .toISOString()
                                  .slice(0, 16)
                              : "",
                            venue: nextEvent.venue,
                            venueAddress: nextEvent.venueAddress ?? "",
                            timeLabel: nextEvent.timeLabel,
                            capacity: nextEvent.capacity?.toString() ?? "",
                            imageUrl: nextEvent.imageUrl ?? "",
                            imageAlt: nextEvent.imageAlt ?? "",
                            description: nextEvent.description,
                            activities: nextEvent.activities,
                            isPublished: Boolean(nextEvent.isPublished),
                          });
                        }}
                      >
                        Manage event <ArrowRight size={15} />
                      </button>
                      <Link
                        className="pill pill-outline"
                        href={`/events#event-${nextEvent.slug}`}
                      >
                        View public page <ArrowRight size={15} />
                      </Link>
                    </div>
                    </div>
                  </div>
                ) : (
                  <p className="admin-empty">
                    Create your first gathering from the Events tab.
                  </p>
                )}
              </section>
              <section className="admin-card admin-activity-panel">
                <div className="admin-card-heading">
                  <h2>Recent activity</h2>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setSection("applicants")}
                  >
                    View all
                  </button>
                </div>
                {applicants.data?.slice(0, 5).map(applicant => (
                  <div className="admin-activity-row" key={applicant.id}>
                    <span className="activity-dot">
                      <Users size={15} />
                    </span>
                    <span>
                      <strong>{applicant.name} submitted an RSVP</strong>
                      <small>
                        {applicant.eventSlug} ·{" "}
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </small>
                    </span>
                    <small>{applicant.status}</small>
                  </div>
                ))}
                {!applicants.data?.length && (
                  <p className="admin-empty">
                    No recent applicant activity yet.
                  </p>
                )}
              </section>
            </div>
            <div className="admin-lower-grid">
              <section className="admin-card">
                <div className="admin-card-heading">
                  <h2>Recent RSVPs</h2>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setSection("applicants")}
                  >
                    View all
                  </button>
                </div>
                {applicants.data?.slice(0, 3).map(applicant => (
                  <div className="admin-list-row" key={applicant.id}>
                    <span>
                      <strong>{applicant.name}</strong>
                      <small>{applicant.eventSlug}</small>
                    </span>
                    <small>{applicant.status}</small>
                  </div>
                ))}
                {!applicants.data?.length && (
                  <p className="admin-empty">No registrations yet.</p>
                )}
              </section>
              <section className="admin-card">
                <div className="admin-card-heading">
                  <h2>Wall activity</h2>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setSection("content")}
                  >
                    View all
                  </button>
                </div>
                <p className="admin-empty">
                  {dashboard.data?.wallNotes
                    ? `${dashboard.data.wallNotes} notes are currently in the Wall records.`
                    : "No Wall notes have been submitted yet."}
                </p>
              </section>
              <section className="admin-card">
                <div className="admin-card-heading">
                  <h2>Content needing attention</h2>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setSection("content")}
                  >
                    View all
                  </button>
                </div>
                <div className="admin-list-row">
                  <span>
                    <strong>Open moderation reports</strong>
                    <small>Wall and project review queue</small>
                  </span>
                  <b>{dashboard.data?.openReports ?? 0}</b>
                </div>
                <div className="admin-list-row">
                  <span>
                    <strong>Draft events</strong>
                    <small>Not visible publicly</small>
                  </span>
                  <b>
                    {events.data?.filter(event => !event.isPublished).length ??
                      0}
                  </b>
                </div>
                <div className="admin-list-row">
                  <span>
                    <strong>Unpublished spotlights</strong>
                    <small>Member profiles waiting for review</small>
                  </span>
                  <b>{dashboard.data?.unpublishedSpotlights ?? 0}</b>
                </div>
                <div className="admin-list-row">
                  <span>
                    <strong>Recap with missing photos</strong>
                    <small>Media records needing an image reference</small>
                  </span>
                  <b>{dashboard.data?.missingRecapPhotos ?? 0}</b>
                </div>
              </section>
            </div>
          </>
        )}
        {section === "events" && (
          <section className="admin-events-view">
            <div className="admin-page-heading">
              <div>
                <p className="section-kicker">events</p>
                <h2>What’s going on?</h2>
                <p>Manage gatherings, schedules, RSVPs, and event content.</p>
              </div>
              <button
                className="pill pill-primary"
                type="button"
                onClick={() => {
                  setDraft(emptyDraft);
                  setSection("create");
                }}
              >
                <Plus size={16} /> Create event
              </button>
            </div>
            <div className="admin-events-toolbar">
              <div className="admin-filter-pills">
                {(["all", "upcoming", "draft", "past"] as const).map(filter => (
                  <button
                    key={filter}
                    className={eventFilter === filter ? "active" : ""}
                    type="button"
                    onClick={() => setEventFilter(filter)}
                  >
                    {filter[0].toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <label className="admin-search">
                <Search size={16} />
                <span className="sr-only">Search events</span>
                <input
                  value={eventSearch}
                  onChange={event => setEventSearch(event.target.value)}
                  placeholder="Search events…"
                />
              </label>
            </div>
            <div className="admin-event-list">
              {filteredEvents.map(event => (
                <article className="admin-event-row" key={event.id}>
                  <div
                    className="admin-event-photo"
                    style={
                      event.imageUrl
                        ? { backgroundImage: `url(${event.imageUrl})` }
                        : undefined
                    }
                  >
                    <span>{event.imageUrl ? "" : "No photo"}</span>
                  </div>
                  <div className="admin-event-details">
                    <div className="admin-event-titleline">
                      <span
                        className={`admin-status ${event.isPublished ? (event.startsAt < Date.now() ? "past" : "published") : "draft"}`}
                      >
                        {event.isPublished
                          ? event.startsAt < Date.now()
                            ? "Past"
                            : "Published"
                          : "Draft"}
                      </span>
                      <span className="admin-session-label">
                        {event.dateLabel}
                      </span>
                    </div>
                    <h3>{event.title}</h3>
                    <p className="admin-event-meta">
                      {event.dateLabel} · {event.timeLabel} ·{" "}
                      <MapPin size={13} /> {event.venue}
                    </p>
                    <p>{event.description}</p>
                    <div className="admin-event-stats">
                      <span>
                        <Users size={14} /> {event.attendeeCount} going
                      </span>
                      <span>
                        <Check size={14} /> {event.capacity ?? "—"} capacity
                      </span>
                    </div>
                  </div>
                  <div className="admin-event-actions">
                    <button
                      className="pill pill-outline"
                      type="button"
                      onClick={() => {
                        setDraft({
                          id: event.id,
                          slug: event.slug,
                          title: event.title,
                          dateLabel: event.dateLabel,
                          startsAt: new Date(event.startsAt)
                            .toISOString()
                            .slice(0, 16),
                          endsAt: event.endsAt
                            ? new Date(event.endsAt).toISOString().slice(0, 16)
                            : "",
                          venue: event.venue,
                          venueAddress: event.venueAddress ?? "",
                          timeLabel: event.timeLabel,
                          capacity: event.capacity?.toString() ?? "",
                          imageUrl: event.imageUrl ?? "",
                          imageAlt: event.imageAlt ?? "",
                          description: event.description,
                          activities: event.activities,
                          isPublished: Boolean(event.isPublished),
                        });
                        setSection("create");
                      }}
                    >
                      Edit
                    </button>
                    <Link
                      className="pill pill-outline"
                      href={`/events#event-${event.slug}`}
                    >
                      View public
                    </Link>
                  </div>
                </article>
              ))}
              {!filteredEvents.length && (
                <p className="admin-empty">No events match this view yet.</p>
              )}
            </div>
          </section>
        )}
        {section === "create" && (
          <div className="admin-two-column">
            <form
              className="admin-card admin-event-form"
              onSubmit={submitEvent}
            >
              <div className="admin-card-heading">
                <div>
                  <p className="section-kicker">event editor</p>
                  <h2>{draft.id ? "Edit gathering" : "Create a gathering"}</h2>
                </div>
                {draft.id && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setDraft(emptyDraft)}
                    aria-label="Cancel event editing"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              {(
                [
                  ["slug", "Slug"],
                  ["title", "Title"],
                  ["dateLabel", "Date label"],
                  ["startsAt", "Starts at"],
                  ["endsAt", "Ends at"],
                  ["venue", "Venue"],
                  ["venueAddress", "Venue address"],
                  ["timeLabel", "Time label"],
                  ["capacity", "Capacity"],
                  ["imageUrl", "Image URL"],
                  ["imageAlt", "Image alt text"],
                ] as [keyof EventDraft, string][]
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  {["startsAt", "endsAt"].includes(key) ? (
                    <input
                      type="datetime-local"
                      required={key === "startsAt"}
                      value={draft[key] as string}
                      onChange={event =>
                        setDraft(current => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  ) : (
                    <input
                      required={[
                        "slug",
                        "title",
                        "dateLabel",
                        "venue",
                        "timeLabel",
                      ].includes(key)}
                      value={draft[key] as string}
                      onChange={event =>
                        setDraft(current => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}
              <label>
                Description
                <textarea
                  required
                  minLength={10}
                  value={draft.description}
                  onChange={event =>
                    setDraft(current => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Activities <small>comma-separated</small>
                <input
                  required
                  value={draft.activities}
                  onChange={event =>
                    setDraft(current => ({
                      ...current,
                      activities: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="registration-consent">
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={event =>
                    setDraft(current => ({
                      ...current,
                      isPublished: event.target.checked,
                    }))
                  }
                />
                <span>Published on public pages</span>
              </label>
              <button className="pill pill-primary" type="submit">
                <Save size={15} />
                {draft.id ? "Save event" : "Create event"}
              </button>
            </form>
            <div className="admin-card">
              <div className="admin-card-heading">
                <div>
                  <p className="section-kicker">current gatherings</p>
                  <h2>Events</h2>
                </div>
              </div>
              <div className="admin-list">
                {events.data?.map(event => (
                  <article key={event.id}>
                    <div>
                      <strong>{event.title}</strong>
                      <span>
                        {event.dateLabel} · {event.venue}
                      </span>
                      <small>
                        {event.attendeeCount} registered ·{" "}
                        {event.isPublished ? "Published" : "Draft"}
                      </small>
                    </div>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: event.id,
                          slug: event.slug,
                          title: event.title,
                          dateLabel: event.dateLabel,
                          startsAt: new Date(event.startsAt)
                            .toISOString()
                            .slice(0, 16),
                          endsAt: event.endsAt
                            ? new Date(event.endsAt).toISOString().slice(0, 16)
                            : "",
                          venue: event.venue,
                          venueAddress: event.venueAddress ?? "",
                          timeLabel: event.timeLabel,
                          capacity: event.capacity?.toString() ?? "",
                          imageUrl: event.imageUrl ?? "",
                          imageAlt: event.imageAlt ?? "",
                          description: event.description,
                          activities: (() => {
                            try {
                              return JSON.parse(event.activities).join(", ");
                            } catch {
                              return event.activities;
                            }
                          })(),
                          isPublished: Boolean(event.isPublished),
                        })
                      }
                    >
                      Edit
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
        {section === "applicants" && (
          <div className="admin-card">
            <div className="admin-card-heading">
              <div>
                <p className="section-kicker">registration desk</p>
                <h2>Event applicants</h2>
              </div>
              <span className="admin-count">
                {applicants.data?.length ?? 0} total
              </span>
            </div>
            <div className="applicant-table">
              <div className="applicant-row applicant-head">
                <span>Name</span>
                <span>Event / email</span>
                <span>Interests</span>
                <span>Status</span>
              </div>
              {applicants.data?.map(applicant => (
                <div className="applicant-row" key={applicant.id}>
                  <span>
                    <strong>{applicant.name}</strong>
                    <small>
                      {new Date(applicant.createdAt).toLocaleString()}
                    </small>
                  </span>
                  <span>
                    {applicant.eventSlug}
                    <small>{applicant.email}</small>
                  </span>
                  <span>
                    {applicant.topInterests}
                    <small>{applicant.currentInterests.slice(0, 90)}</small>
                  </span>
                  <span>
                    <button
                      className={`status-button ${applicant.status}`}
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({
                          id: applicant.id,
                          status:
                            applicant.status === "confirmed"
                              ? "cancelled"
                              : "confirmed",
                        })
                      }
                    >
                      {applicant.status}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === "content" && (
          <div className="admin-content-grid">
            <article className="admin-card">
              <Image size={20} />
              <h2>Images & recaps</h2>
              <p>
                Manage local-ready recap images, spotlight portraits, and event
                image URLs from the event/content records.
              </p>
              <span className="admin-coming">
                Media editor foundation ready
              </span>
            </article>
            <article className="admin-card">
              <LayoutDashboard size={20} />
              <h2>Homepage surfaces</h2>
              <p>
                Events, spotlights, recap wall, venue pins, and newsletter
                settings are separated in the content model for the next editor
                pass.
              </p>
              <span className="admin-coming">Content model connected</span>
            </article>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export { AdminPage, RegistrationPage };
