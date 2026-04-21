import Theme1 from "./Theme1/Theme1";
import Theme2 from "./Theme2/Theme2";
import Theme3 from "./Theme3/Theme3";
import Theme4 from "./Theme4/Theme4";
import Theme5 from "./Theme5/Theme5";
import Theme6 from "./Theme6/Theme6";
import Theme7 from "./Theme7/Theme7";
import Theme8 from "./Theme8/Theme8";
import Theme9 from "./Theme9/Theme9";
import Theme10 from "./Theme10/Theme10";
import { Dua } from "@/lib/duas";

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export const themes: ThemeConfig[] = [
  { id: "theme1", name: "Starlit Night", description: "Beautiful night sky with crescent moon", preview: "🌙" },
  { id: "theme2", name: "Lantern Glow", description: "Traditional Eid lanterns with warm lights", preview: "🏮" },
  { id: "theme3", name: "Sacred Mosque", description: "Elegant mosque architecture", preview: "🕌" },
  { id: "theme4", name: "Green Paradise", description: "Nature-inspired Islamic garden", preview: "🌿" },
  { id: "theme5", name: "Golden Elegance", description: "Luxurious gold accents", preview: "✨" },
  { id: "theme6", name: "Minimalist White", description: "Clean and modern", preview: "🤍" },
  { id: "theme7", name: "Crescent Dreams", description: "Soft pastel with crescent", preview: "🌙" },
  { id: "theme8", name: "Geometric Pattern", description: "Traditional Islamic geometry", preview: "⬡" },
  { id: "theme9", name: "Sunset Harmony", description: "Warm sunset colors", preview: "🌅" },
  { id: "theme10", name: "Modern Islamic", description: "Contemporary Islamic design", preview: "🕌" },
];

interface ThemeRendererProps {
  themeId: string;
  eidType: string;
  recipientName?: string;
  customMessage: string;
  phone: string;
  duas: Dua[];
}

export function renderTheme({ themeId, ...props }: ThemeRendererProps) {
  switch (themeId) {
    case "theme1":
      return <Theme1 {...props} />;
    case "theme2":
      return <Theme2 {...props} />;
    case "theme3":
      return <Theme3 {...props} />;
    case "theme4":
      return <Theme4 {...props} />;
    case "theme5":
      return <Theme5 {...props} />;
    case "theme6":
      return <Theme6 {...props} />;
    case "theme7":
      return <Theme7 {...props} />;
    case "theme8":
      return <Theme8 {...props} />;
    case "theme9":
      return <Theme9 {...props} />;
    case "theme10":
      return <Theme10 {...props} />;
    default:
      return <Theme1 {...props} />;
  }
}

export { Theme1, Theme2, Theme3, Theme4, Theme5, Theme6, Theme7, Theme8, Theme9, Theme10 };
