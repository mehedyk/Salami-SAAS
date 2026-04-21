"use client";

import { useEffect, useState } from "react";
import styles from "./Theme1.module.css";
import { getTheme1Cursor } from "./Theme1.cursor";
import { Dua } from "@/lib/duas";

interface Theme1Props {
  eidType: string;
  recipientName?: string;
  customMessage: string;
  phone: string;
  duas: Dua[];
}

export default function Theme1({
  eidType,
  recipientName,
  customMessage,
  phone,
  duas,
}: Theme1Props) {
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const cursorEffect = getTheme1Cursor();

  useEffect(() => {
    document.body.style.cursor = cursorEffect.cursor;

    const interval = setInterval(() => {
      setCurrentDuaIndex((prev) => (prev + 1) % duas.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [duas.length, cursorEffect.cursor]);

  const eidTitle = eidType === "eid_al_fitr" ? "Eid Al-Fitr" : "Eid Al-Adha";
  const subtitle = eidType === "eid_al_fitr"
    ? " Mubarak!"
    : " Kareem!";

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push(
        <div
          key={i}
          className={styles.star}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      );
    }
    return <div className={styles.stars}>{stars}</div>;
  };

  return (
    <div className={styles.container}>
      {renderStars()}
      <div className={`${styles.card} ${styles.floating}`}>
        <div className={styles.moon} />
        <h1 className={styles.eidTitle}>{eidTitle}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {recipientName && (
          <p className={styles.recipient}>Dear {recipientName}</p>
        )}

        <p className={styles.message}>{customMessage}</p>

        <p className={styles.phone}>{phone}</p>

        <div className={styles.duaContainer}>
          <p className={styles.duaArabic}>{duas[currentDuaIndex]?.arabic}</p>
          <p className={styles.duaTranslation}>
            &ldquo;{duas[currentDuaIndex]?.translation}&rdquo;
          </p>
          <p className={styles.duaSource}>
            Source: {duas[currentDuaIndex]?.source}
          </p>
        </div>
      </div>
    </div>
  );
}
