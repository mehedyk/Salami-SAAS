import { Dua, eidAlFitrDuas } from "./eid-fitr";
import { eidAlAdhaDuas } from "./eid-adha";
import { ramadanDuas } from "./ramadan";
import { qurbaniDuas } from "./qurbani";
import { hajjDuas } from "./hajj";

export type { Dua };

export function getRandomDua(category: string): Dua {
  let duas: Dua[];

  switch (category) {
    case "eid_al_fitr":
      duas = eidAlFitrDuas;
      break;
    case "eid_al_adha":
      duas = eidAlAdhaDuas;
      break;
    case "ramadan":
      duas = ramadanDuas;
      break;
    case "qurbani":
      duas = qurbaniDuas;
      break;
    case "hajj":
      duas = hajjDuas;
      break;
    default:
      duas = [...eidAlFitrDuas, ...eidAlAdhaDuas];
  }

  return duas[Math.floor(Math.random() * duas.length)];
}

export function getRandomDuas(category: string, count: number = 3): Dua[] {
  let duas: Dua[];

  switch (category) {
    case "eid_al_fitr":
      duas = eidAlFitrDuas;
      break;
    case "eid_al_adha":
      duas = eidAlAdhaDuas;
      break;
    case "ramadan":
      duas = ramadanDuas;
      break;
    case "qurbani":
      duas = qurbaniDuas;
      break;
    case "hajj":
      duas = hajjDuas;
      break;
    default:
      duas = [...eidAlFitrDuas, ...eidAlAdhaDuas];
  }

  const shuffled = [...duas].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getEidTypeFromCard(eidType: string): string {
  switch (eidType) {
    case "eid_al_fitr":
      return "Eid Al-Fitr";
    case "eid_al_adha":
      return "Eid Al-Adha";
    default:
      return "Eid";
  }
}
