import { TasksPage } from './pages/TasksPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <TasksPage />
      </div>
    </QueryClientProvider>
  );
}
