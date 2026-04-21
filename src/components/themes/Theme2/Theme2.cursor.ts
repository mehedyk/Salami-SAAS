export interface CursorEffect {
  cursor: string;
  interactive?: string;
}

export function getTheme2Cursor(): CursorEffect {
  return {
    cursor: "pointer",
    interactive: "pointer",
  };
}
