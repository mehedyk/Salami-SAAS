export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme9Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
