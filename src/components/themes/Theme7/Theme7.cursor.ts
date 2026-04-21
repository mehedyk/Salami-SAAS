export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme7Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
