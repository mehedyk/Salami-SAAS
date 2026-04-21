export interface CursorEffect {
  cursor: string;
  cursorUrl?: string;
  interactive?: string;
}

export function getTheme1Cursor(): CursorEffect {
  return {
    cursor: "pointer",
    interactive: "pointer",
  };
}
