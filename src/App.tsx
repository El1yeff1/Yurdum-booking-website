import { Route, Switch, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import { LangProvider } from '@/lib/i18n';

function App() {
  return (
    <LangProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </LangProvider>
  );
}

export default App;
