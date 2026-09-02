import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Everything except the landing page and 404 is code-split: the admin panel and
// its stylesheet, the login/registration screens, and the secondary public
// pages all load on demand instead of shipping in the first paint.
const AdminWorkspace = lazy(() => import("./admin/AdminWorkspace"));
const Login = lazy(() => import("./pages/Login"));
const RegistrationPage = lazy(() =>
  import("./pages/RegisterAdmin").then(m => ({ default: m.RegistrationPage }))
);
const AboutPage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.AboutPage }))
);
const EventsPage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.EventsPage }))
);
const WallPage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.WallPage }))
);
const ProjectsPage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.ProjectsPage }))
);
const PeoplePage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.PeoplePage }))
);
const JoinPage = lazy(() =>
  import("./pages/TagpuanPages").then(m => ({ default: m.JoinPage }))
);

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        color: "#8a7a68",
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: "0.85rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Loading…
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/wall" component={WallPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/people" component={PeoplePage} />
        <Route path="/join" component={JoinPage} />
        <Route path="/register" component={RegistrationPage} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminWorkspace} />
        <Route path="/admin/*" component={AdminWorkspace} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
