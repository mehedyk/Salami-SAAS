export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme3Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
