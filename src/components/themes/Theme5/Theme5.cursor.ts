export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme5Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
