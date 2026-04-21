"use client";

import { useEffect, useState } from "react";
import styles from "./Theme6.module.css";
import { getTheme6Cursor } from "./Theme6.cursor";
import { Dua } from "@/lib/duas";

interface Theme6Props {
  eidType: string;
  recipientName?: string;
  customMessage: string;
  phone: string;
  duas: Dua[];
}

export default function Theme6({ eidType, recipientName, customMessage, phone, duas }: Theme6Props) {
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const cursorEffect = getTheme6Cursor();

  useEffect(() => {
    document.body.style.cursor = cursorEffect.cursor;
    const interval = setInterval(() => setCurrentDuaIndex((prev) => (prev + 1) % duas.length), 8000);
    return () => clearInterval(interval);
  }, [duas.length, cursorEffect.cursor]);

  const eidTitle = eidType === "eid_al_fitr" ? "Eid Al-Fitr" : "Eid Al-Adha";
  const subtitle = eidType === "eid_al_fitr" ? " Mubarak!" : " Kareem!";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>🤍</div>
        <h1 className={styles.eidTitle}>{eidTitle}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {recipientName && <p className={styles.recipient}>Dear {recipientName}</p>}
        <p className={styles.message}>{customMessage}</p>
        <p className={styles.phone}>{phone}</p>
        <div className={styles.duaContainer}>
          <p className={styles.duaArabic}>{duas[currentDuaIndex]?.arabic}</p>
          <p className={styles.duaTranslation}>&ldquo;{duas[currentDuaIndex]?.translation}&rdquo;</p>
          <p className={styles.duaSource}>Source: {duas[currentDuaIndex]?.source}</p>
        </div>
      </div>
    </div>
  );
}
