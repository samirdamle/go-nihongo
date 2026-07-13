"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TermEntry } from "@/types/lookup";
import { isFavorite, toggleFavorite } from "@/features/history/storage";

const VISIBLE_SENSES = 3;

type Props = {
  entry: TermEntry;
  showFurigana: boolean;
  onFavoriteChange?: () => void;
};

export function TermCard({ entry, showFurigana, onFavoriteChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(() => isFavorite(entry.id));

  const senses = useMemo(() => {
    if (expanded) return entry.senses;
    return entry.senses.slice(0, VISIBLE_SENSES);
  }, [entry.senses, expanded]);

  const hasKanji = /[\u4e00-\u9fff]/.test(entry.japanese);
  const reading = entry.readings[0];

  function onStar() {
    toggleFavorite({
      entryId: entry.id,
      japanese: entry.japanese,
      romaji: entry.romaji,
      gloss: entry.senses[0]?.gloss ?? "",
    });
    setStarred(isFavorite(entry.id));
    onFavoriteChange?.();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-medium tracking-tight">
            {showFurigana && hasKanji && reading ? (
              <ruby>
                {entry.japanese}
                <rp>(</rp>
                <rt className="text-xs font-normal text-muted-foreground">
                  {reading}
                </rt>
                <rp>)</rp>
              </ruby>
            ) : (
              entry.japanese
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{entry.romaji}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={starred ? "Remove favorite" : "Add favorite"}
          onClick={onStar}
        >
          <Star
            className={starred ? "fill-amber-400 text-amber-500" : undefined}
          />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {senses.map((s, i) => (
            <li key={`${s.gloss}-${i}`}>
              {s.gloss}
              {s.pos?.length ? (
                <span className="ml-2 text-muted-foreground">
                  {s.pos.join(", ")}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        {entry.senses.length > VISIBLE_SENSES ? (
          <Button
            type="button"
            variant="link"
            className="h-auto px-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show fewer meanings" : "More meanings"}
          </Button>
        ) : null}
        {entry.tags?.length ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
