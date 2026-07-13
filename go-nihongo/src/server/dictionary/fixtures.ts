import type { TermEntry } from "@/types/lookup";

/** Small fixture dictionary for M1 UI + tests (not full JMdict). */
export const FIXTURE_ENTRIES: TermEntry[] = [
  {
    id: "hajimemashite",
    japanese: "初めまして",
    readings: ["はじめまして"],
    romaji: "hajimemashite",
    senses: [
      { gloss: "How do you do?", pos: ["expression"] },
      { gloss: "Pleased to meet you", pos: ["expression"] },
    ],
    commonality: 90,
    tags: ["common"],
  },
  {
    id: "arigatou",
    japanese: "ありがとう",
    readings: ["ありがとう"],
    romaji: "arigatō",
    senses: [{ gloss: "thank you", pos: ["expression"] }],
    commonality: 95,
    tags: ["common"],
  },
  {
    id: "konnichiwa",
    japanese: "こんにちは",
    readings: ["こんにちは"],
    romaji: "konnichiwa",
    senses: [{ gloss: "hello", pos: ["expression"] }, { gloss: "good day" }],
    commonality: 95,
    tags: ["common"],
  },
  {
    id: "hashi-bridge",
    japanese: "橋",
    readings: ["はし"],
    romaji: "hashi",
    senses: [{ gloss: "bridge", pos: ["noun"] }],
    commonality: 80,
  },
  {
    id: "hashi-chopsticks",
    japanese: "箸",
    readings: ["はし"],
    romaji: "hashi",
    senses: [{ gloss: "chopsticks", pos: ["noun"] }],
    commonality: 75,
  },
  {
    id: "hashi-edge",
    japanese: "端",
    readings: ["はし"],
    romaji: "hashi",
    senses: [{ gloss: "end", pos: ["noun"] }, { gloss: "edge" }, { gloss: "tip" }],
    commonality: 60,
  },
  {
    id: "toukyou",
    japanese: "東京",
    readings: ["とうきょう"],
    romaji: "Tōkyō",
    senses: [{ gloss: "Tokyo", pos: ["noun"] }],
    commonality: 99,
  },
];
