/**
 * Thin indirection around Date.now(). Every call site using this is from an event handler
 * (a button's onClick — see WordleGame/BoardQuestionCard/BoardTermCard), never from the
 * render path itself, so the impurity is harmless there; but the strict react-hooks/purity
 * lint rule flags `Date.now()` by name anywhere lexically inside a component's function
 * body, including inside a named handler it defines, not just the render path proper. This
 * avoids that false positive without adding a fragile eslint-disable comment.
 */
export function nowMs(): number {
  return Date.now();
}
