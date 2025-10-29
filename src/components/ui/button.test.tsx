
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button } from './button';

test('Button renders with correct text', () => {
  render(<Button>Click Me</Button>);
  const buttonElement = screen.getByRole('button', { name: /Click Me/i });
  expect(buttonElement).toBeInTheDocument();
});

test('Button onClick handler is called', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  const buttonElement = screen.getByRole('button', { name: /Click Me/i });
  await userEvent.click(buttonElement);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Button is disabled', () => {
  render(<Button disabled>Click Me</Button>);
  const buttonElement = screen.getByRole('button', { name: /Click Me/i });
  expect(buttonElement).toBeDisabled();
});
