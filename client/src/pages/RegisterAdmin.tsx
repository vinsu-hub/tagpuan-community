import { trpc } from "@/lib/trpc";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
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

export { RegistrationPage };
