import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

// Mock the TasksPage component
vi.mock('../pages/TasksPage', () => ({
  TasksPage: () => <div data-testid="mock-tasks-page">TasksPage Mock</div>,
}));

describe('App', () => {
  it('renders the TasksPage component', () => {
    render(<App />);

    expect(screen.getByTestId('mock-tasks-page')).toBeInTheDocument();
  });
});
