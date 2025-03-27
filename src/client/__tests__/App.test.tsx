import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { App } from '../App';

vi.mock('../pages/TasksPage', () => ({
  TasksPage: () => <div data-testid="mock-tasks-page">TasksPage Mock</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('App', () => {
  it('renders the TasksPage component', () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('mock-tasks-page')).toBeInTheDocument();
  });
});
