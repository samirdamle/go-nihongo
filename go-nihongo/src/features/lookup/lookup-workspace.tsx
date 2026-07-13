"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { TermCard } from "@/features/lookup/term-card";
import {
  clearHistory,
  loadFavorites,
  loadHistory,
  pushHistory,
  type FavoriteItem,
  type HistoryItem,
} from "@/features/history/storage";
import { lookup } from "@/lib/api-client/lookup";
import { detectInput } from "@/lib/detect/heuristics";
import type { InputMode, LookupKind, LookupResponse } from "@/types/lookup";

export function LookupWorkspace() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<InputMode>("romaji");
  const [kind, setKind] = useState<LookupKind>("term");
  const [modeLocked, setModeLocked] = useState(false);
  const [kindLocked, setKindLocked] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [includeFunctionWords, setIncludeFunctionWords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [panel, setPanel] = useState<"results" | "history" | "favorites">(
    "results",
  );

  useEffect(() => {
    setHistory(loadHistory());
    setFavorites(loadFavorites());
  }, []);

  // Auto-detect unless user overrode
  useEffect(() => {
    const detected = detectInput(q);
    if (!modeLocked) setMode(detected.mode);
    if (!kindLocked) setKind(detected.kind);
  }, [q, modeLocked, kindLocked]);

  const canSubmit = q.trim().length > 0 && !loading;

  const emptyHint = useMemo(
    () =>
      "Type romaji, Japanese, or English. Choose mode if auto-detect is wrong, then Look up.",
    [],
  );

  async function onSubmit(
    e?: React.FormEvent,
    overrides?: { kind?: LookupKind; mode?: InputMode },
  ) {
    e?.preventDefault();
    if (!q.trim()) {
      setError("Enter a word or sentence to look up.");
      return;
    }
    const submitMode = overrides?.mode ?? mode;
    const submitKind = overrides?.kind ?? kind;
    setLoading(true);
    setError(null);
    setPanel("results");
    try {
      const data = await lookup({
        q: q.trim(),
        mode: submitMode,
        kind: submitKind,
        options: { includeFunctionWords },
      });
      setResult(data);
      const summary =
        data.kind === "term"
          ? data.entries[0]
            ? `${data.entries[0].japanese} — ${data.entries[0].senses[0]?.gloss ?? ""}`
            : "No entries"
          : data.translation.text;
      setHistory(
        pushHistory({
          q: q.trim(),
          mode: submitMode,
          kind: submitKind,
          summary,
        }),
      );
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function tryAsSentence() {
    setKind("sentence");
    setKindLocked(true);
    void onSubmit(undefined, { kind: "sentence" });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Go Nihongo!</h1>
          <p className="text-muted-foreground text-sm">
            Japanese lookup for English speakers — terms and sentences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={panel === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setPanel("history")}
          >
            History
          </Button>
          <Button
            type="button"
            variant={panel === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFavorites(loadFavorites());
              setPanel("favorites");
            }}
          >
            Favorites
          </Button>
        </div>
      </header>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Mode</span>
            {!modeLocked ? (
              <Badge variant="secondary">Auto</Badge>
            ) : (
              <Badge variant="outline">Manual</Badge>
            )}
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as InputMode);
              setModeLocked(true);
            }}
          >
            <TabsList>
              <TabsTrigger value="romaji">Romaji</TabsTrigger>
              <TabsTrigger value="japanese">Japanese</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Lookup</span>
            {!kindLocked ? (
              <Badge variant="secondary">Auto</Badge>
            ) : (
              <Badge variant="outline">Manual</Badge>
            )}
          </div>
          <Tabs
            value={kind}
            onValueChange={(v) => {
              setKind(v as LookupKind);
              setKindLocked(true);
            }}
          >
            <TabsList>
              <TabsTrigger value="term">Term</TabsTrigger>
              <TabsTrigger value="sentence">Sentence</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Hajimemashite · ありがとう · hello"
          rows={3}
          className="min-h-[96px] resize-y text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit();
            }
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Looking up…" : "Look up"}
          </Button>
          <Toggle
            pressed={showFurigana}
            onPressedChange={setShowFurigana}
            aria-label="Toggle furigana"
          >
            Furigana
          </Toggle>
          {kind === "sentence" ? (
            <Toggle
              pressed={includeFunctionWords}
              onPressedChange={setIncludeFunctionWords}
              aria-label="Show function words in breakdown"
            >
              Function words
            </Toggle>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setModeLocked(false);
              setKindLocked(false);
            }}
          >
            Reset auto-detect
          </Button>
        </div>
      </form>

      <Separator />

      {panel === "history" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">History</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearHistory();
                setHistory([]);
              }}
            >
              Clear
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lookups yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border p-3 text-left text-sm hover:bg-muted/50"
                    onClick={() => {
                      setQ(h.q);
                      setMode(h.mode as InputMode);
                      setKind(h.kind as LookupKind);
                      setModeLocked(true);
                      setKindLocked(true);
                      setPanel("results");
                    }}
                  >
                    <div className="font-medium">{h.q}</div>
                    <div className="text-muted-foreground">{h.summary}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {panel === "favorites" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Favorites</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Star a term card to save it here.
            </p>
          ) : (
            <ul className="space-y-2">
              {favorites.map((f) => (
                <li key={f.entryId} className="rounded-lg border p-3 text-sm">
                  <div className="text-lg">{f.japanese}</div>
                  <div className="text-muted-foreground">{f.romaji}</div>
                  <div>{f.gloss}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {panel === "results" ? (
        <section className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Lookup error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!result && !error ? (
            <p className="text-sm text-muted-foreground">{emptyHint}</p>
          ) : null}

          {result?.kind === "term" ? (
            <div className="space-y-3">
              <h2 className="text-lg font-medium">
                Results{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  ({result.entries.length})
                </span>
              </h2>
              {result.entries.length === 0 ? (
                <div className="space-y-3">
                  <Alert>
                    <AlertTitle>No entry found</AlertTitle>
                    <AlertDescription>
                      Check spelling or try another mode.
                      {result.suggestions.length > 0 ? (
                        <span className="mt-2 block">
                          Did you mean:{" "}
                          {result.suggestions.map((s) => s.text).join(", ")}
                        </span>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                  {q.trim().length >= 8 || q.includes(" ") ? (
                    <Button type="button" variant="outline" onClick={tryAsSentence}>
                      Try as sentence
                    </Button>
                  ) : null}
                </div>
              ) : (
                result.entries.map((entry) => (
                  <TermCard
                    key={entry.id}
                    entry={entry}
                    showFurigana={showFurigana}
                    onFavoriteChange={() => setFavorites(loadFavorites())}
                  />
                ))
              )}
            </div>
          ) : null}

          {result?.kind === "sentence" ? (
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Translation</CardTitle>
                  <CardDescription>
                    via {result.translation.provider}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-base">
                  <p>{result.translation.text}</p>
                  {result.japaneseText ? (
                    <p className="text-muted-foreground">
                      Japanese: {result.japaneseText}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Word breakdown</CardTitle>
                  <CardDescription>
                    Morph enrichment arrives in milestone 3 — structure is ready.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.breakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No breakdown tokens yet (dictionary fixtures mode).
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {result.breakdown
                        .filter(
                          (t) => includeFunctionWords || !t.isFunctionWord,
                        )
                        .map((t, i) => (
                          <li
                            key={`${t.surface}-${i}`}
                            className="rounded border px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{t.surface}</span>
                            {t.romaji ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {t.romaji}
                              </span>
                            ) : null}
                            {t.gloss ? <span> — {t.gloss}</span> : null}
                          </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
