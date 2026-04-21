export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme6Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
