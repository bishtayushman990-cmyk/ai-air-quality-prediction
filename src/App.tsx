import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Route,
  Switch,
  Router as WouterRouter,
} from 'wouter';
import { OverviewPage, ForecastPage, MapPage, HistoryPage, AlertsPage, CommandPage, SourcesPage, SettingsPage, AuthPage, NotFoundPage } from '@/pages/aerova-pages';
import { LocationProvider } from "@/location-context";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={OverviewPage} />
      <Route path="/my-air" component={OverviewPage} />
      <Route path="/forecast" component={ForecastPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/command" component={CommandPage} />
      <Route path="/sources" component={SourcesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/login"><AuthPage mode="login" /></Route>
      <Route path="/signup"><AuthPage mode="signup" /></Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
        </LocationProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
