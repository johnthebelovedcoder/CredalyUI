/**
 * Accessibility utilities for CredalyUI.
 * Provides keyboard navigation support and focus management.
 */

/**
 * Generate ARIA attributes for a collapsible/accordion section.
 */
export function getAriaCollapsible(isExpanded: boolean) {
  return {
    'aria-expanded': isExpanded,
    'aria-hidden': !isExpanded,
  } as const;
}

/**
 * Generate ARIA attributes for a button that controls a region.
 */
export function getAriaControls(controlId: string, isExpanded: boolean) {
  return {
    'aria-controls': controlId,
    'aria-expanded': isExpanded,
  } as const;
}

/**
 * Generate ARIA live region attributes for announcements.
 */
export function getAriaLive(assertive = false) {
  return {
    'aria-live': assertive ? 'assertive' : 'polite',
    'aria-atomic': 'true',
  } as const;
}

/**
 * Keyboard event handler for making any element keyboard-activatable.
 * Use on elements with role="button" that aren't actual <button> elements.
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * Focus trap utility — returns a ref callback that traps focus within an element.
 * Useful for modals and dialogs.
 */
export function createFocusTrap() {
  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  let previousFocus: HTMLElement | null = null;

  function getFocusableElements(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
      .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }

  function trapFocus(event: KeyboardEvent, root: HTMLElement) {
    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(root);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: going backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  function onOpen(root: HTMLElement) {
    previousFocus = document.activeElement as HTMLElement;
    const focusableElements = getFocusableElements(root);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  function onClose() {
    if (previousFocus && document.body.contains(previousFocus)) {
      previousFocus.focus();
    }
  }

  return { trapFocus, onOpen, onClose };
}

/**
 * Skip link component for keyboard users.
 * Provides a "Skip to main content" link that is only visible on focus.
 */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-credaly-amber focus:text-credaly-bg focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
    >
      Skip to main content
    </a>
  );
}

/**
 * Visually hidden text for screen readers.
 */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
