import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { AdminPage, RegistrationPage } from "@/pages/RegisterAdmin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import {
  AboutPage,
  EventsPage,
  JoinPage,
  PeoplePage,
  ProjectsPage,
  WallPage,
} from "./pages/TagpuanPages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/wall" component={WallPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/people" component={PeoplePage} />
      <Route path="/join" component={JoinPage} />
      <Route path="/register" component={RegistrationPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
