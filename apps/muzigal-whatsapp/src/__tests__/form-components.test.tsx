import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Select, Textarea, Button, Label } from '../components/ui/form';
import { Switch } from '../components/ui/Switch';

// ── Input ──
describe('Input', () => {
  it('renders as input element', () => {
    render(<Input data-testid="inp" />);
    expect(screen.getByTestId('inp').tagName).toBe('INPUT');
  });

  it('accepts value and onChange', async () => {
    const onChange = vi.fn();
    render(<Input data-testid="inp" value="hello" onChange={onChange} />);
    const el = screen.getByTestId('inp') as HTMLInputElement;
    expect(el.value).toBe('hello');
  });

  it('forwards className', () => {
    render(<Input data-testid="inp" className="extra-class" />);
    expect(screen.getByTestId('inp')).toHaveClass('extra-class');
  });

  it('supports disabled prop', () => {
    render(<Input data-testid="inp" disabled />);
    expect(screen.getByTestId('inp')).toBeDisabled();
  });

  it('has base styling classes', () => {
    render(<Input data-testid="inp" />);
    const el = screen.getByTestId('inp');
    expect(el.className).toContain('rounded-lg');
    expect(el.className).toContain('border');
  });
});

// ── Select ──
describe('Select', () => {
  it('renders as select element', () => {
    render(
      <Select data-testid="sel">
        <option value="a">A</option>
      </Select>
    );
    expect(screen.getByTestId('sel').tagName).toBe('SELECT');
  });

  it('has appearance-none class for custom chevron', () => {
    render(<Select data-testid="sel"><option>A</option></Select>);
    expect(screen.getByTestId('sel').className).toContain('appearance-none');
  });

  it('has pr-9 class for chevron spacing', () => {
    render(<Select data-testid="sel"><option>A</option></Select>);
    expect(screen.getByTestId('sel').className).toContain('pr-9');
  });

  it('renders children options', () => {
    render(
      <Select data-testid="sel">
        <option value="piano">Piano</option>
        <option value="guitar">Guitar</option>
      </Select>
    );
    const options = screen.getByTestId('sel').querySelectorAll('option');
    expect(options).toHaveLength(2);
  });
});

// ── Textarea ──
describe('Textarea', () => {
  it('renders as textarea', () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId('ta').tagName).toBe('TEXTAREA');
  });

  it('has resize-none class', () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId('ta').className).toContain('resize-none');
  });
});

// ── Button ──
describe('Button', () => {
  it('renders primary variant with bg-emerald-600', () => {
    render(<Button data-testid="btn">Click</Button>);
    expect(screen.getByTestId('btn').className).toContain('bg-emerald-600');
  });

  it('renders secondary variant with border', () => {
    render(<Button data-testid="btn" variant="secondary">Click</Button>);
    expect(screen.getByTestId('btn').className).toContain('border');
  });

  it('renders ghost variant without bg-emerald or border in its variant class', () => {
    render(<Button data-testid="btn" variant="ghost">Click</Button>);
    const cls = screen.getByTestId('btn').className;
    expect(cls).not.toContain('bg-emerald-600');
    expect(cls).not.toContain('bg-red-600');
  });

  it('renders danger variant with bg-red-600', () => {
    render(<Button data-testid="btn" variant="danger">Click</Button>);
    expect(screen.getByTestId('btn').className).toContain('bg-red-600');
  });

  it('supports disabled prop', () => {
    render(<Button data-testid="btn" disabled>Click</Button>);
    expect(screen.getByTestId('btn')).toBeDisabled();
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button data-testid="btn" onClick={onClick}>Click</Button>);
    await user.click(screen.getByTestId('btn'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has focus-visible ring classes', () => {
    render(<Button data-testid="btn">Click</Button>);
    const cls = screen.getByTestId('btn').className;
    expect(cls).toContain('focus-visible:ring-2');
    expect(cls).toContain('focus-visible:ring-emerald-500');
  });
});

// ── Label ──
describe('Label', () => {
  it('renders with text-sm font-medium text-zinc-700 classes', () => {
    render(<Label data-testid="lbl">Name</Label>);
    const cls = screen.getByTestId('lbl').className;
    expect(cls).toContain('text-sm');
    expect(cls).toContain('font-medium');
    expect(cls).toContain('text-zinc-700');
  });

  it('accepts className override', () => {
    render(<Label data-testid="lbl" className="text-red-500">Name</Label>);
    expect(screen.getByTestId('lbl').className).toContain('text-red-500');
  });

  it('renders as label element', () => {
    render(<Label data-testid="lbl">Name</Label>);
    expect(screen.getByTestId('lbl').tagName).toBe('LABEL');
  });
});

// ── Switch ──
describe('Switch', () => {
  it('has role="switch"', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('aria-checked toggles on click', async () => {
    const user = userEvent.setup();
    let checked = false;
    const { rerender } = render(
      <Switch checked={checked} onCheckedChange={(v) => { checked = v; }} />
    );
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');

    await user.click(sw);
    rerender(<Switch checked={checked} onCheckedChange={(v) => { checked = v; }} />);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('disabled prevents toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} disabled />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has focus-visible ring class', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    const cls = screen.getByRole('switch').className;
    expect(cls).toContain('focus-visible:ring-2');
    expect(cls).toContain('focus-visible:ring-emerald-500');
  });

  it('has h-5 w-9 sizing', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    const cls = screen.getByRole('switch').className;
    expect(cls).toContain('h-5');
    expect(cls).toContain('w-9');
  });
});
