export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme10Cursor(): CursorEffect {
  return { cursor: "pointer", interactive: "pointer" };
}
