// Tagpuan style: warm scrapbook operations — cream paper, brown ink, terracotta actions, editorial type, tactile artifacts.
// Ported from the tagpuan-admin concept, rewired to live Tagpuan data via tRPC.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudUpload,
  Eye,
  FileImage,
  FileText,
  Filter,
  Flag,
  FolderOpen,
  Image as ImageIcon,
  ImagePlus,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  UploadCloud,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: ReactNode; action?: ReactNode }) {
  return <header className="page-header section-page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action ? <div className="header-actions">{action}</div> : null}</header>;
}

function Notice({ message, tone = "success", onClose }: { message: string; tone?: "success" | "neutral"; onClose: () => void }) {
  return <div className={cn("toast", tone)}>{tone === "success" ? <CheckCircle2 size={17} /> : null}{message}<button type="button" onClick={onClose} aria-label="Dismiss notification"><X size={15} /></button></div>;
}

function MetricStrip({ items }: { items: Array<{ label: string; value: string; icon: ReactNode; tone?: string }> }) {
  return <div className="section-metrics">{items.map((item) => <div className="section-metric" key={item.label}><span className={cn("metric-icon", item.tone)}>{item.icon}</span><div><strong>{item.value}</strong><span>{item.label}</span></div></div>)}</div>;
}

function Tabs({ items, value, onChange }: { items: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="section-tabs" role="tablist">{items.map((item) => <button type="button" key={item} className={cn(value === item && "active")} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

function SearchBar({ value, onChange, placeholder = "Search this section..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="section-search"><Search size={17} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></div>;
}

function ActionPill({ children, onClick, primary = false }: { children: ReactNode; onClick?: () => void; primary?: boolean }) {
  return <button type="button" className={cn("button small action-pill", primary ? "primary" : "outline")} onClick={onClick}>{children}</button>;
}

function DetailDrawer({ eyebrow, title, description, children, actions, onClose }: { eyebrow: string; title: string; description?: ReactNode; children: ReactNode; actions?: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [onClose]);
  return <><button className="drawer-backdrop" type="button" aria-label="Close detail drawer" onClick={onClose} /><aside className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-drawer-title"><div className="drawer-topbar"><span className="drawer-eyebrow">{eyebrow}</span><button className="icon-button" type="button" onClick={onClose} aria-label="Close detail drawer"><X size={19} /></button></div><div className="drawer-scroll"><h2 id="detail-drawer-title">{title}</h2>{description ? <p className="drawer-description">{description}</p> : null}{children}</div>{actions ? <div className="drawer-footer">{actions}</div> : null}</aside></>;
}

function DrawerMeta({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <div className="drawer-meta-grid">{items.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>;
}

function DrawerAction({ children, onClick, primary = false }: { children: ReactNode; onClick?: () => void; primary?: boolean }) {
  return <button type="button" className={cn("button drawer-action", primary ? "primary" : "outline")} onClick={onClick}>{children}</button>;
}

function EmptyState({ icon: Icon, title, copy }: { icon: typeof MessageCircle; title: string; copy: string }) {
  return <div className="empty-state surface-card"><Icon size={30} /><h2>{title}</h2><p>{copy}</p></div>;
}

export function RecapsPage() {
  const { data = [], isLoading } = trpc.admin.recaps.list.useQuery();
  const [tab, setTab] = useState("All recaps");
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof data)[number] | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const published = data.filter((item) => item.isPublished === 1).length;
  const visible = data.filter((item) => {
    const matchesTab = tab === "All recaps" || (tab === "Published" && item.isPublished === 1) || (tab === "Hidden" && item.isPublished === 0);
    return matchesTab;
  });
  return <div className="page-wrap section-page"><SectionHeader eyebrow="EVENT RECAPS" title="Keep the moments close." description="Turn each gathering into a story people can revisit, share, and carry forward." action={<ActionPill primary onClick={() => notify("Attach a new recap photo from the Media tab.")}><Plus size={16} /> Add recap</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL PHOTOS", value: String(data.length), icon: <ImageIcon size={18} />, tone: "orange" }, { label: "PUBLISHED", value: String(published), icon: <Check size={18} />, tone: "green" }, { label: "HIDDEN", value: String(data.length - published), icon: <FolderOpen size={18} />, tone: "yellow" }, { label: "EVENTS", value: String(new Set(data.map((item) => item.eventId)).size), icon: <FileImage size={18} />, tone: "blue" }]} />
    <div className="section-toolbar"><Tabs items={["All recaps", "Published", "Hidden"]} value={tab} onChange={setTab} /></div>
    {isLoading ? <div className="empty-state surface-card"><Sparkles size={30} /><h2>Loading recaps…</h2></div> : visible.length ? <div className="recap-grid">{visible.map((photo) => <article className="recap-card surface-card" key={photo.id}><div className="recap-image-wrap"><img src={photo.imageUrl} alt={photo.imageAlt} /><span className={cn("content-status", photo.isPublished === 1 && "published")}>{photo.isPublished === 1 ? "Published" : "Hidden"}</span></div><div className="recap-card-body"><div className="card-kicker"><span>{photo.caption || photo.imageAlt}</span></div><div className="card-action-row"><ActionPill onClick={() => setSelected(photo)}><Eye size={15} /> View photo</ActionPill><button className="icon-button" type="button" onClick={() => notify("Recap actions coming soon.")} aria-label="More recap actions"><MoreHorizontal size={18} /></button></div></div></article>)}</div> : <EmptyState icon={ImageIcon} title="No recap photos yet" copy="Photos from gatherings will appear here as they are added." />}
    {selected ? <DetailDrawer eyebrow="EVENT RECAP" title={selected.imageAlt} description="A closer look at this photo before it is shared with the community." onClose={() => setSelected(null)} actions={<><DrawerAction onClick={() => notify("Recap photo archived.")}><Archive size={15} /> Archive</DrawerAction><DrawerAction primary onClick={() => notify(selected.isPublished === 1 ? "Recap photo is already public." : "Recap photo published.")}><Send size={15} /> {selected.isPublished === 1 ? "Published" : "Publish photo"}</DrawerAction></>}><div className="drawer-image"><img src={selected.imageUrl} alt={selected.imageAlt} /></div><DrawerMeta items={[{ label: "Caption", value: selected.caption || "No caption" }, { label: "Current state", value: selected.isPublished === 1 ? "Published" : "Hidden" }]} /></DetailDrawer> : null}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function WallPage() {
  const { data = [], isLoading } = trpc.admin.wall.list.useQuery();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("All notes");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof data)[number] | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const updateStatus = trpc.admin.wall.updateStatus.useMutation({
    onSettled: async () => { await utils.admin.wall.list.invalidate(); },
  });
  const visible = data.filter((note) => `${note.body} ${note.authorName ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (tab === "All notes" || (tab === "Approved" && note.status === "approved") || (tab === "Pending" && note.status === "pending") || (tab === "Rejected" && note.status === "rejected")));
  const pending = data.filter((item) => item.status === "pending").length;
  return <div className="page-wrap section-page"><SectionHeader eyebrow="COMMUNITY  /  WALL" title="What’s on the wall?" description="Keep an eye on the small sparks, questions, and invitations shared by the community." action={<ActionPill primary onClick={() => notify("Wall moderation filters opened.")}><Flag size={16} /> Review reports</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL NOTES", value: String(data.length), icon: <MessageCircle size={18} />, tone: "yellow" }, { label: "PENDING", value: String(pending), icon: <Sparkles size={18} />, tone: "orange" }, { label: "APPROVED", value: String(data.filter((item) => item.status === "approved").length), icon: <Check size={18} />, tone: "green" }, { label: "REJECTED", value: String(data.filter((item) => item.status === "rejected").length), icon: <Flag size={18} />, tone: "pink" }]} />
    <div className="section-toolbar"><Tabs items={["All notes", "Pending", "Approved", "Rejected"]} value={tab} onChange={setTab} /><SearchBar value={query} onChange={setQuery} placeholder="Search wall notes..." /></div>
    {isLoading ? <div className="empty-state surface-card"><Sparkles size={30} /><h2>Loading wall notes…</h2></div> : visible.length ? <div className="wall-admin-grid">{visible.map((note) => <article className="wall-admin-card surface-card" key={note.id}><div className="wall-card-top"><span className={cn("mini-status", note.status.toLowerCase())}>{note.status}</span>{note.reportCount > 0 ? <span className="mini-status pink">Reported</span> : null}</div><h2>{note.body}</h2><div className="wall-card-meta"><span>{note.authorName || "anonymous"}</span><span>{note.pinCount} pins</span></div><div className="card-action-row"><ActionPill onClick={() => setSelected(note)}><Eye size={15} /> View note</ActionPill><ActionPill primary onClick={() => updateStatus.mutate({ id: note.id, status: note.status === "approved" ? "rejected" : "approved" })}>{note.status === "approved" ? "Reject" : "Approve"}</ActionPill></div></article>)}</div> : <EmptyState icon={MessageCircle} title="No wall notes yet" copy="Notes posted on the community wall will show up here for review." />}
    {selected ? <DetailDrawer eyebrow="WALL MODERATION" title={selected.body} description="Review the note, check its context, and decide what should happen next." onClose={() => setSelected(null)} actions={<><DrawerAction onClick={() => updateStatus.mutate({ id: selected.id, status: "rejected" })}><Archive size={15} /> Reject</DrawerAction><DrawerAction primary onClick={() => updateStatus.mutate({ id: selected.id, status: "approved" })}><Tag size={15} /> Approve note</DrawerAction></>}><div className="drawer-note-preview"><MessageCircle size={22} /><p>{selected.body}</p><span>{selected.authorName || "anonymous"} · {selected.pinCount} pins</span></div><DrawerMeta items={[{ label: "Status", value: selected.status }, { label: "Pins", value: String(selected.pinCount) }, { label: "Reports", value: String(selected.reportCount) }]} /></DetailDrawer> : null}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function ProjectsPage() {
  const { data = [], isLoading } = trpc.admin.projects.list.useQuery();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("All projects");
  const [notice, setNotice] = useState<string | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const updateStatus = trpc.admin.projects.updateStatus.useMutation({ onSettled: async () => { await utils.admin.projects.list.invalidate(); } });
  const visible = data.filter((project) => tab === "All projects" || project.status === tab.toLowerCase());
  return <div className="page-wrap section-page"><SectionHeader eyebrow="COMMUNITY  /  PASSION PROJECTS" title="Good things are taking shape." description="Help people find collaborators, encouragement, and a little momentum for the ideas they care about." action={<ActionPill primary onClick={() => notify("New projects appear here once members share them.")}><Plus size={16} /> Add project</ActionPill>} />
    <MetricStrip items={[{ label: "ACTIVE PROJECTS", value: String(data.length), icon: <Sparkles size={18} />, tone: "orange" }, { label: "PENDING", value: String(data.filter((item) => item.status === "pending").length), icon: <UsersRound size={18} />, tone: "yellow" }, { label: "APPROVED", value: String(data.filter((item) => item.status === "approved").length), icon: <UserCheck size={18} />, tone: "green" }, { label: "REJECTED", value: String(data.filter((item) => item.status === "rejected").length), icon: <Flag size={18} />, tone: "pink" }]} />
    <div className="section-toolbar"><Tabs items={["All projects", "Approved", "Pending", "Rejected"]} value={tab} onChange={setTab} /><button className="button outline small" type="button" onClick={() => notify("Project sorting options opened.")}><Filter size={15} /> Sort by <ChevronDown size={14} /></button></div>
    {isLoading ? <div className="empty-state surface-card"><Sparkles size={30} /><h2>Loading projects…</h2></div> : visible.length ? <div className="project-grid">{visible.map((project, index) => <article className={cn("project-card surface-card", index === 0 && "featured-project")} key={project.id}><div className="project-photo"><span className={cn("project-state", project.tag.toLowerCase())}>{project.status}</span></div><div className="project-card-body"><div className="project-label"><Sparkles size={14} /> Passion project</div><h2>{project.tag}</h2><p>{project.body}</p><div className="project-owner"><span>Posted by <strong>{project.authorName || "anonymous"}</strong></span></div><div className="card-action-row"><ActionPill primary onClick={() => updateStatus.mutate({ id: project.id, status: project.status === "approved" ? "rejected" : "approved" })}>{project.status === "approved" ? "Reject" : "Approve"} <ArrowRight size={15} /></ActionPill></div></div></article>)}</div> : <EmptyState icon={Sparkles} title="No passion projects yet" copy="Projects shared by the community will appear here for review." />}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function ApplicantsPage() {
  const { data = [], isLoading } = trpc.admin.registrations.useQuery();
  const utils = trpc.useUtils();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const updateStatus = trpc.admin.updateRegistrationStatus.useMutation({ onSettled: async () => { await utils.admin.registrations.invalidate(); } });
  const visible = data.filter((applicant) => `${applicant.name} ${applicant.eventSlug} ${applicant.email}`.toLowerCase().includes(query.toLowerCase()));
  const confirmed = data.filter((item) => item.status === "confirmed").length;
  return <div className="page-wrap section-page"><SectionHeader eyebrow="COMMUNITY  /  REGISTRATION DESK" title="Meet the next neighbors." description="Review registrations from each gathering and keep the intake experience thoughtful, clear, and human." action={<ActionPill onClick={() => notify("Applicant export is preparing.")}><ArrowUpRight size={16} /> Export list</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL RSVPS", value: String(data.length), icon: <UsersRound size={18} />, tone: "orange" }, { label: "CONFIRMED", value: String(confirmed), icon: <UserCheck size={18} />, tone: "green" }, { label: "CANCELLED", value: String(data.length - confirmed), icon: <Clock3 size={18} />, tone: "pink" }]} />
    <div className="section-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search applicants..." /></div>
    <div className="applicant-table surface-card"><div className="table-heading"><span>Applicant</span><span>Event / email</span><span>Background</span><span>Status</span><span /></div>{visible.map((applicant) => <div className="applicant-row" key={applicant.id}><div className="applicant-person"><strong>{applicant.name}</strong><small>{new Date(applicant.createdAt).toLocaleDateString()}</small></div><p>{applicant.eventSlug}<small>{applicant.email}</small></p><p>{applicant.background.slice(0, 90)}</p><span className={cn("review-status", applicant.status.toLowerCase())}><i />{applicant.status}</span><button className="icon-button" type="button" onClick={() => updateStatus.mutate({ id: applicant.id, status: applicant.status === "confirmed" ? "cancelled" : "confirmed" })} aria-label={`Toggle ${applicant.name}`}><ArrowUpRight size={17} /></button></div>)}</div>{isLoading ? <div className="empty-state surface-card"><UsersRound size={30} /><h2>Loading applicants…</h2></div> : !visible.length ? <div className="empty-state surface-card"><UsersRound size={30} /><h2>No registrations yet</h2><p>Registrations from the public page will appear here.</p></div> : null}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function SpotlightsPage() {
  const { data = [], isLoading } = trpc.admin.spotlights.list.useQuery();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("All spotlights");
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof data)[number] | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const updateSpotlight = trpc.admin.spotlights.update.useMutation({ onSettled: async () => { await utils.admin.spotlights.list.invalidate(); } });
  const visible = data.filter((item) => tab === "All spotlights" || (tab === "Published" && item.isPublished === 1) || (tab === "Draft" && item.isPublished === 0));
  return <div className="page-wrap section-page"><SectionHeader eyebrow="CONTENT  /  MEMBER SPOTLIGHTS" title="People worth spotlighting." description="Shape member stories with care and publish the voices that make Tagpuan feel like home." action={<ActionPill primary onClick={() => notify("Create a new spotlight from the public site first.")}><Plus size={16} /> New spotlight</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL SPOTLIGHTS", value: String(data.length), icon: <Star size={18} />, tone: "orange" }, { label: "PUBLISHED", value: String(data.filter((item) => item.isPublished === 1).length), icon: <Check size={18} />, tone: "green" }, { label: "DRAFTS", value: String(data.filter((item) => item.isPublished === 0).length), icon: <FileText size={18} />, tone: "yellow" }]} />
    <div className="section-toolbar"><Tabs items={["All spotlights", "Published", "Draft"]} value={tab} onChange={setTab} /></div>
    {isLoading ? <div className="empty-state surface-card"><Sparkles size={30} /><h2>Loading spotlights…</h2></div> : visible.length ? <div className="spotlight-grid">{visible.map((item) => <article className="spotlight-card surface-card" key={item.id}><div className="spotlight-art"><span className={cn("content-status", item.isPublished === 1 && "published")}>{item.isPublished === 1 ? "Published" : "Draft"}</span><Sparkles size={23} /></div><div className="spotlight-body"><div className="card-kicker"><span>Member spotlight</span></div><h2>{item.name}</h2><p>{item.role}</p><div className="spotlight-person"><span>Featuring <strong>{item.name}</strong></span></div><div className="card-action-row"><ActionPill onClick={() => setSelected(item)}><Eye size={15} /> View story</ActionPill><ActionPill primary onClick={() => updateSpotlight.mutate({ id: item.id, changes: { isPublished: item.isPublished === 1 ? 0 : 1 } })}>{item.isPublished === 1 ? "Unpublish" : "Publish"}</ActionPill></div></div></article>)}</div> : <EmptyState icon={Sparkles} title="No member spotlights yet" copy="Published spotlights will appear here and on the community page." />}
    {selected ? <DetailDrawer eyebrow="MEMBER SPOTLIGHT" title={selected.name} description="A closer look at this member story." onClose={() => setSelected(null)} actions={<><DrawerAction onClick={() => notify("Spotlight kept as-is.")}><FileText size={15} /> Keep as is</DrawerAction><DrawerAction primary onClick={() => updateSpotlight.mutate({ id: selected.id, changes: { isPublished: selected.isPublished === 1 ? 0 : 1 } })}><Send size={15} /> {selected.isPublished === 1 ? "Unpublish" : "Publish story"}</DrawerAction></>}><div className={cn("drawer-story-card")}>{selected.photoUrl ? <img src={selected.photoUrl} alt={selected.photoAlt || selected.name} /> : null}</div><DrawerMeta items={[{ label: "Featuring", value: selected.name }, { label: "Role", value: selected.role }, { label: "Status", value: selected.isPublished === 1 ? "Published" : "Draft" }]} /><div className="drawer-section"><h3>Quote</h3><p className="drawer-note-preview"><p>{selected.quote}</p></p></div></DetailDrawer> : null}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function HearMeOutPage() {
  const { data = [], isLoading } = trpc.admin.hearMeOut.list.useQuery();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("All submissions");
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof data)[number] | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const updateStatus = trpc.admin.hearMeOut.updateStatus.useMutation({ onSettled: async () => { await utils.admin.hearMeOut.list.invalidate(); } });
  const visible = data.filter((item) => tab === "All submissions" || item.status === tab.toLowerCase().replaceAll(" ", "_"));
  return <div className="page-wrap section-page"><SectionHeader eyebrow="CONTENT  /  HEAR ME OUT" title="Give the room a mic." description="Review thoughtful submissions and keep the community conversation moving in the open." action={<ActionPill onClick={() => notify("Submission guidelines opened.")}><FileText size={16} /> View guidelines</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL SUBMISSIONS", value: String(data.length), icon: <MessageCircle size={18} />, tone: "orange" }, { label: "NEW", value: String(data.filter((item) => item.status === "new").length), icon: <Sparkles size={18} />, tone: "yellow" }, { label: "IN REVIEW", value: String(data.filter((item) => item.status === "in_review").length), icon: <Clock3 size={18} />, tone: "pink" }, { label: "PUBLISHED", value: String(data.filter((item) => item.status === "published").length), icon: <Check size={18} />, tone: "green" }]} />
    <div className="section-toolbar"><Tabs items={["All submissions", "New", "In review", "Published", "Archived"]} value={tab} onChange={setTab} /></div>
    {isLoading ? <div className="empty-state surface-card"><Sparkles size={30} /><h2>Loading submissions…</h2></div> : visible.length ? <div className="submission-list">{visible.map((item) => <article className="submission-row surface-card" key={item.id}><span className="submission-icon"><MessageCircle size={20} /></span><div className="submission-copy"><div className="card-kicker"><span>{item.category}</span><span>{item.sender}</span></div><h2>{item.subject}</h2><p>{item.excerpt}</p></div><div className="submission-meta"><span className={cn("review-status", item.status.toLowerCase().replace("_", "-"))}><i />{item.status.replace("_", " ")}</span></div><div className="submission-actions"><ActionPill onClick={() => setSelected(item)}><Eye size={15} /> Review</ActionPill></div></article>)}</div> : <EmptyState icon={MessageCircle} title="No submissions yet" copy="Hear Me Out submissions from the community will appear here." />}
    {selected ? <DetailDrawer eyebrow="HEAR ME OUT" title={selected.subject} description="Give this submission a thoughtful read before deciding how it should meet the wider community." onClose={() => setSelected(null)} actions={<><DrawerAction onClick={() => updateStatus.mutate({ id: selected.id, status: "in_review" })}><Clock3 size={15} /> Keep in review</DrawerAction><DrawerAction onClick={() => updateStatus.mutate({ id: selected.id, status: "archived" })}><Archive size={15} /> Archive</DrawerAction><DrawerAction primary onClick={() => updateStatus.mutate({ id: selected.id, status: "published" })}><Send size={15} /> Publish submission</DrawerAction></>}><div className="drawer-note-preview"><MessageCircle size={22} /><p>{selected.excerpt}</p><span>{selected.sender} · {selected.category}</span></div><DrawerMeta items={[{ label: "Category", value: selected.category }, { label: "Status", value: selected.status.replace("_", " ") }]} /><div className="drawer-section"><h3>Editor’s note</h3><p className="drawer-body-copy">Publishing makes this note visible to the wider community. Keep in review when you are still deciding.</p></div></DetailDrawer> : null}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}

export function MediaPage() {
  const { data, isLoading } = trpc.admin.media.useQuery();
  const photos = data?.photos ?? [];
  const eventImages = data?.eventImages ?? [];
  const [tab, setTab] = useState("All media");
  const [notice, setNotice] = useState<string | null>(null);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const items = [...eventImages.map((event) => ({ id: event.id, name: event.title, type: "Cover image", image: event.imageUrl ?? "", alt: event.imageAlt ?? "Cover image" })), ...photos.map((photo) => ({ id: photo.id, name: photo.imageUrl.split("/").pop() ?? "photo", type: "Event photo", image: photo.imageUrl ?? "", alt: photo.imageAlt }))];
  const visible = items.filter((item) => tab === "All media" || item.type === tab);
  return <div className="page-wrap section-page"><SectionHeader eyebrow="CONTENT  /  MEDIA" title="The shared album." description="Keep the library tidy, find the right image quickly, and make every recap feel considered." action={<ActionPill primary onClick={() => notify("Upload picker opened.")}><UploadCloud size={16} /> Upload media</ActionPill>} />
    <MetricStrip items={[{ label: "TOTAL ASSETS", value: String(items.length), icon: <ImageIcon size={18} />, tone: "orange" }, { label: "EVENT PHOTOS", value: String(photos.length), icon: <CloudUpload size={18} />, tone: "yellow" }, { label: "COVER IMAGES", value: String(eventImages.length), icon: <FileImage size={18} />, tone: "green" }]} />
    <div className="section-toolbar"><Tabs items={["All media", "Event photo", "Cover image"]} value={tab} onChange={setTab} /></div>
    <div className="media-upload surface-card"><div className="upload-icon"><ImagePlus size={22} /></div><div><strong>Drop files here to keep the story going</strong><p>JPG or PNG, max 5MB each. Uploads require storage to be configured on the server.</p></div><button className="button outline small" type="button" onClick={() => notify("Upload picker opened.")}><Plus size={15} /> Choose files</button></div>
    {isLoading ? <div className="empty-state surface-card"><ImageIcon size={30} /><h2>Loading media…</h2></div> : visible.length ? <div className="media-grid">{visible.map((item) => <div className="media-card surface-card" key={`${item.type}-${item.id}`}><div className="media-image">{item.image ? <img src={item.image} alt={item.alt} /> : <div className="media-empty"><ImageIcon size={20} /></div>}</div><div className="media-card-copy"><strong>{item.name}</strong><span>{item.type}</span></div></div>)}</div> : <EmptyState icon={ImageIcon} title="No media yet" copy="Uploaded event photos and cover images will appear here." />}
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}


export function NewsletterPage() {
  const { data: subscribers = [] } = trpc.admin.newsletter.list.useQuery();
  const { data: campaigns = [] } = trpc.admin.newsletter.campaigns.useQuery();
  const utils = trpc.useUtils();
  const [notice, setNotice] = useState<string | null>(null);
  const [subject, setSubject] = useState("A little room for good things");
  const [audience, setAudience] = useState("All subscribers");
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2500); };
  const createCampaign = trpc.admin.newsletter.createCampaign.useMutation({ onSuccess: async () => { await utils.admin.newsletter.campaigns.invalidate(); } });
  const activeSubscribers = subscribers.filter((item) => item.status === "subscribed").length;
  return <div className="page-wrap section-page"><SectionHeader eyebrow="AUDIENCE  /  NEWSLETTER" title="Stay in touch." description="Send a thoughtful note when there’s something worth gathering around." action={<ActionPill primary onClick={() => notify("Newsletter composer opened.")}><Plus size={16} /> New campaign</ActionPill>} />
    <MetricStrip items={[{ label: "SUBSCRIBERS", value: String(activeSubscribers), icon: <Mail size={18} />, tone: "orange" }, { label: "TOTAL CAMPAIGNS", value: String(campaigns.length), icon: <Send size={18} />, tone: "green" }, { label: "DRAFT CAMPAIGNS", value: String(campaigns.filter((item) => item.status === "draft").length), icon: <FileText size={18} />, tone: "yellow" }]} />
    <div className="newsletter-layout"><section className="surface-card campaign-card"><div className="card-heading"><h2>Recent campaigns</h2></div><div className="campaign-list">{campaigns.length ? campaigns.map((campaign) => <div className="campaign-row" key={campaign.id}><span className={cn("campaign-icon", campaign.status)}>{campaign.status === "sent" ? <Send size={16} /> : <FileText size={16} />}</span><div><strong>{campaign.subject}</strong><span>{campaign.audience} · {campaign.recipients} recipients</span></div><time>{campaign.status === "sent" && campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : "Draft"}</time></div>) : <div className="empty-state surface-card"><Send size={28} /><h2>No campaigns yet</h2><p>Save a draft or send your first campaign.</p></div>}</div></section><section className="surface-card newsletter-composer"><div className="card-heading"><h2>Quick compose</h2><span className="draft-chip">Draft</span></div><label className="field-label">Subject line<input value={subject} onChange={(event) => setSubject(event.target.value)} /></label><label className="field-label">Audience<div className="fake-select">All subscribers <ChevronDown size={15} /></div></label><div className="newsletter-preview"><span>PREVIEW</span><h3>{subject || "Your next note"}</h3><p>A short, warm note from Tagpuan can make the next gathering feel a little closer before anyone arrives.</p><div className="preview-line" /><small>Tagpuan Community · Keep the space warm.</small></div><div className="card-action-row"><ActionPill onClick={() => notify("Campaign saved as draft.")}><FileText size={15} /> Save draft</ActionPill><ActionPill primary onClick={async () => { try { await createCampaign.mutateAsync({ subject, audience, body: "A short, warm note from Tagpuan.", status: "draft" }); notify("Draft campaign saved."); } catch { notify("Timeline is offline. Campaign not saved."); } }}><Send size={15} /> New campaign</ActionPill></div></section></div>
    {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}</div>;
}
