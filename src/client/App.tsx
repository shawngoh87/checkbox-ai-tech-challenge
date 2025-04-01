import { TasksPage } from './pages/TasksPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, AppShell, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.layer.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
    },
  },
});

export function App() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AppShell>
          <Container size="lg" py="xl">
            <TasksPage />
          </Container>
        </AppShell>
      </QueryClientProvider>
    </MantineProvider>
  );
}
