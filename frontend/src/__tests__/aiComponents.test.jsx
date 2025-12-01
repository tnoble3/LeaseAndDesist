import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChallengeButton from '../components/AIChallengeButton.jsx';
import AIChallengeModal from '../components/AIChallengeModal.jsx';
import AIFeedbackForm from '../components/AIFeedbackForm.jsx';

// Mock the goalService API hooks used by the components
vi.mock('../api/goalService.js', () => ({
  generateChallenge: vi.fn(),
  submitForFeedback: vi.fn(),
}));

import * as goalService from '../api/goalService.js';

describe('AI UI components', () => {
  it('opens modal from button and displays generated challenge', async () => {
    // mock generateChallenge to return a typical response
    goalService.generateChallenge.mockResolvedValue({ generated: { title: 'T1', description: 'Desc1' } });

    render(<AIChallengeButton />);

    // open modal
    const btn = screen.getByRole('button', { name: /generate challenge \(ai\)/i });
    fireEvent.click(btn);

    // modal should show input and generate button
    expect(screen.getByText(/ai: generate challenge/i)).toBeTruthy();

    const generateBtn = screen.getByRole('button', { name: /generate challenge$/i });
    fireEvent.click(generateBtn);

    // wait for result to appear
    await waitFor(() => expect(screen.getByText('T1')).toBeInTheDocument());
    expect(screen.getByText('Desc1')).toBeInTheDocument();
  });

  it('modal generates using AIChallengeModal directly', async () => {
    goalService.generateChallenge.mockResolvedValue({ generated: { title: 'T2', description: 'D2' } });
    render(<AIChallengeModal onClose={() => {}} />);

    const generateBtn = screen.getByRole('button', { name: /generate challenge$/i });
    fireEvent.click(generateBtn);

    await waitFor(() => expect(screen.getByText('T2')).toBeInTheDocument());
  });

  it('AIFeedbackForm submits and displays feedback', async () => {
    const feedback = { score: 80, summary: 'Nice job' };
    goalService.submitForFeedback.mockResolvedValue({ feedback });

    render(<AIFeedbackForm />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'some submission content' } });

    const submitBtn = screen.getByRole('button', { name: /submit for feedback/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(screen.getByText(/ai feedback/i)).toBeInTheDocument());
    expect(screen.getByText(/nice job/i)).toBeInTheDocument();
  });
});
