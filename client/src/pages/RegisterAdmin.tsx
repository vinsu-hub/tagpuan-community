import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Image,
  LayoutDashboard,
  Plus,
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
    "overview" | "events" | "applicants" | "content"
  >("overview");
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [message, setMessage] = useState("");
  const events = trpc.admin.events.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const applicants = trpc.admin.registrations.useQuery(undefined, {
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
          <Link
            className="pill pill-primary"
            href="/register?event=sunday-sessions"
          >
            Preview registration <ArrowRight size={15} />
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
          <div className="admin-stat-grid">
            <article>
              <ClipboardList size={20} />
              <strong>{events.data?.length ?? 0}</strong>
              <span>Total events</span>
            </article>
            <article>
              <Users size={20} />
              <strong>{confirmed}</strong>
              <span>Confirmed applicants</span>
            </article>
            <article>
              <Image size={20} />
              <strong>Local</strong>
              <span>Clone-ready media</span>
            </article>
          </div>
        )}
        {section === "events" && (
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
