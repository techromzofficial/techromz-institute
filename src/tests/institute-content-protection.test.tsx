import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InstituteContentProtection from '@/features/education/components/InstituteContentProtection';

function Fixture() {
  return <InstituteContentProtection>
    <p data-testid="protected">Protected information</p>
    <img data-testid="image" src="/images/institute/example.webp" alt="Example workshop" />
    <a href="mailto:info@techromzit.com">info@techromzit.com</a>
    <input aria-label="Enquiry" defaultValue="Editable enquiry" />
    <span data-copyable>Copyable reference</span>
  </InstituteContentProtection>;
}

describe('Institute content protection', () => {
  it('discourages context-menu, copy, keyboard-copy and image dragging on protected content', () => {
    render(<Fixture />);
    const protectedText = screen.getByTestId('protected');
    const image = screen.getByTestId('image');

    expect(fireEvent.contextMenu(protectedText)).toBe(false);
    expect(fireEvent.copy(protectedText)).toBe(false);
    expect(fireEvent.keyDown(protectedText, { key: 'c', ctrlKey: true })).toBe(false);
    expect(fireEvent.keyDown(protectedText, { key: 'p', ctrlKey: true })).toBe(true);
    expect(fireEvent.dragStart(image)).toBe(false);
  });

  it('preserves copying, editing, context menus and keyboard interaction for exceptions', () => {
    render(<Fixture />);
    const email = screen.getByRole('link', { name: 'info@techromzit.com' });
    const input = screen.getByRole('textbox', { name: 'Enquiry' });
    const copyable = screen.getByText('Copyable reference');

    for (const element of [email, input, copyable]) {
      expect(fireEvent.contextMenu(element)).toBe(true);
      expect(fireEvent.copy(element)).toBe(true);
      expect(fireEvent.keyDown(element, { key: 'c', metaKey: true })).toBe(true);
    }
    fireEvent.change(input, { target: { value: 'Updated enquiry' } });
    expect(input).toHaveValue('Updated enquiry');
  });

  it('does not install document-global event handlers', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    render(<Fixture />);
    expect(addEventListener).not.toHaveBeenCalledWith('contextmenu', expect.any(Function));
  });
});
