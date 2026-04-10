import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  BookmarkPlus,
  Bookmark,
  Library,
  X,
  Trash2,
  Archive,
  ArchiveRestore,
  Check,
  RotateCcw,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";

const SEED_STORY = {
  id: "morning",
  title: "დილა თბილისში",
  titleEn: "A Morning in Tbilisi",
  description: "A short slice-of-life about waking up in the city",
  difficulty: "A2",
  source: "seed",
  sentences: [
    {
      words: [
        { word: "დილაა", gloss: "it is morning (დილა = morning + ა = is)" },
        { word: "და", gloss: "and" },
        { word: "თბილისი", gloss: "Tbilisi" },
        { word: "იღვიძებს", gloss: "wakes up / is waking up" },
      ],
      trailing: ".",
      english: "It is morning and Tbilisi is waking up.",
    },
    {
      words: [
        { word: "ნინო", gloss: "Nino (name)" },
        { word: "ფანჯარასთან", gloss: "by the window (ფანჯარა = window + სთან = next to)" },
        { word: "დგას", gloss: "stands / is standing" },
        { word: "და", gloss: "and" },
        { word: "ქუჩას", gloss: "the street (dative case)" },
        { word: "უყურებს", gloss: "looks at / is watching" },
      ],
      trailing: ".",
      english: "Nino is standing by the window and looking at the street.",
    },
    {
      words: [
        { word: "ხალხი", gloss: "people" },
        { word: "სამსახურში", gloss: "to work (სამსახური = work/job + ში = into)" },
        { word: "მიდის", gloss: "goes / is going" },
      ],
      trailing: ".",
      english: "People are going to work.",
    },
    {
      words: [
        { word: "ნინოს", gloss: "Nino (dative — to Nino)" },
        { word: "ყავა", gloss: "coffee" },
        { word: "უნდა", gloss: "wants (literally: is wanted)" },
      ],
      trailing: ".",
      english: "Nino wants coffee.",
    },
    {
      words: [
        { word: "ის", gloss: "he / she / it" },
        { word: "სამზარეულოში", gloss: "to the kitchen" },
        { word: "მიდის", gloss: "goes" },
        { word: "და", gloss: "and" },
        { word: "ყავას", gloss: "coffee (dative)" },
        { word: "ამზადებს", gloss: "prepares / makes" },
      ],
      trailing: ".",
      english: "She goes to the kitchen and makes coffee.",
    },
    {
      words: [
        { word: "გარეთ", gloss: "outside" },
        { word: "ცივა", gloss: "it is cold" },
      ],
      midPunctuation: { afterIndex: 1, mark: "," },
      extraWords: [
        { word: "მაგრამ", gloss: "but" },
        { word: "მზე", gloss: "the sun" },
        { word: "ანათებს", gloss: "shines / is shining" },
      ],
      trailing: ".",
      english: "It is cold outside, but the sun is shining.",
    },
    {
      words: [
        { word: "ნინო", gloss: "Nino" },
        { word: "იღიმება", gloss: "smiles / is smiling" },
      ],
      trailing: ".",
      english: "Nino smiles.",
    },
    {
      words: [
        { word: "დღე", gloss: "day" },
        { word: "კარგი", gloss: "good" },
        { word: "იქნება", gloss: "will be" },
      ],
      trailing: ".",
      english: "The day will be good.",
    },
  ],
};

const TOPICS = [
  { id: "daily", label: "daily life", georgian: "ყოველდღიური ცხოვრება", hint: "ordinary moments — waking up, commuting, errands, evenings at home" },
  { id: "food", label: "food & cooking", georgian: "საჭმელი", hint: "Georgian food, cooking, eating with family or friends, a market visit" },
  { id: "travel", label: "travel in Georgia", georgian: "მოგზაურობა", hint: "a trip somewhere in Georgia — Kakheti, Svaneti, the Black Sea, a marshrutka ride" },
  { id: "village", label: "village life", georgian: "სოფელი", hint: "rural Georgia, grandparents' house, working the land, slow days" },
  { id: "family", label: "family", georgian: "ოჯახი", hint: "family scenes — a meal, a phone call, a memory of a parent or grandparent" },
  { id: "weather", label: "weather & seasons", georgian: "ამინდი", hint: "the weather, the season, how it shapes the day" },
  { id: "memory", label: "a memory", georgian: "მოგონება", hint: "a small remembered moment from childhood or recent past" },
  { id: "football", label: "football", georgian: "ფეხბურთი", hint: "playing or watching football — a match, a goal, a favorite player" },
  { id: "dialogue", label: "a conversation", georgian: "საუბარი", hint: "two people talking — a short dialogue scene" },
];

const GEORGIAN_RANGE = /^[\u10A0-\u10FF\u1C90-\u1CBF\u2D00-\u2D2F]+$/;

function isGeorgianWord(s) {
  const cleaned = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return GEORGIAN_RANGE.test(cleaned);
}

function validateStory(story) {
  if (!story || typeof story !== "object") throw new Error("not an object");
  if (!story.title || !story.titleEn || !story.sentences) throw new Error("missing required fields");
  if (!Array.isArray(story.sentences) || story.sentences.length === 0) throw new Error("no sentences");
  story.sentences.forEach((s, si) => {
    if (!Array.isArray(s.words) || s.words.length === 0) throw new Error(`sentence ${si}: no words`);
    if (!s.english) throw new Error(`sentence ${si}: missing english`);
    s.words.forEach((w, wi) => {
      if (!w.word || !w.gloss) throw new Error(`sentence ${si} word ${wi}: missing word or gloss`);
      if (!isGeorgianWord(w.word)) {
        throw new Error(`sentence ${si} word ${wi}: "${w.word}" contains non-Georgian characters`);
      }
    });
    if (s.trailing && /[a-zA-Z\u10A0-\u10FF]/.test(s.trailing)) {
      throw new Error(`sentence ${si}: trailing should be punctuation only, got "${s.trailing}"`);
    }
  });
  return true;
}

function buildPrompt({ topic, freeText, learningWords, difficulty }) {
  const learningContext = learningWords.length
    ? `\nThe learner is currently studying these words. Try to incorporate 2-3 of them naturally into the story, ideally in different grammatical forms than how they're shown here so the learner sees them in new contexts:\n${learningWords.map((w) => `- ${w.word} (${w.gloss})`).join("\n")}`
    : "";

  let topicLine;
  if (freeText) {
    topicLine = `Topic (from learner request): ${freeText}`;
  } else if (topic) {
    topicLine = `Topic: ${topic.label} — ${topic.hint}`;
  } else {
    topicLine = "Topic: any everyday Georgian scene";
  }

  return `You are a Georgian language tutor writing short reading passages for a heritage learner.

Learner profile:
- English-speaking, Georgian heritage, conversationally familiar with spoken Georgian
- Decoding mkhedruli script is improving but still slow
- Roughly A2 level for reading: knows basic verbs and everyday vocabulary
- Goal: build reading fluency through repeated exposure to common patterns

Difficulty: ${difficulty}
A2 means: 5-8 sentences, mostly present tense, sentence length 4-9 words, vocabulary from the most common ~800 Georgian words, at most 1-2 unfamiliar words per sentence, concrete everyday scenes.
B1 means: 6-10 sentences, mix of present and past, slightly longer sentences, broader vocabulary, can include short dialogue.

${topicLine}
${learningContext}

Write the story in natural Georgian that feels authentically Georgian (not translated-from-English). Prefer concrete, sensory, specific details over generic statements. Set scenes in real Georgian places when relevant.

Return ONLY valid JSON, no markdown fences, no preamble, no commentary. Schema:

{
  "id": "kebab-case-id-from-title",
  "title": "Georgian title",
  "titleEn": "English title",
  "description": "One short English sentence describing the story",
  "difficulty": "${difficulty}",
  "sentences": [
    {
      "words": [
        { "word": "georgianword", "gloss": "english meaning (grammar note if useful)" }
      ],
      "trailing": ".",
      "english": "Natural English translation of the whole sentence."
    }
  ]
}

CRITICAL RULES — violating these breaks the app:
1. Each "word" field must contain ONLY Georgian letters. No punctuation, no spaces, no Latin characters, no digits. Punctuation is NEVER attached to a word.
2. Sentence-ending punctuation (. ! ?) goes in "trailing".
3. If a sentence has a comma in the middle, split it: put the words before the comma in "words", add "midPunctuation": { "afterIndex": N, "mark": "," }, and put the words after the comma in "extraWords". (Only use this if needed.)
4. Every Georgian word that appears in the rendered sentence must appear in the words array, in order.
5. Glosses are short English. Include grammar hints in parentheses when useful (case, tense, person), e.g. "coffee (dative)" or "goes (3rd person sing)".
6. Repeat at least one or two words across multiple sentences in the story for reinforcement.

Now write the story.`;
}

async function callApi(prompt) {
  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (e) {
    throw new Error(`network error: ${e.message}`);
  }
  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch (e) {}
    throw new Error(`API ${response.status}: ${detail.slice(0, 200)}`);
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("could not parse API response as JSON");
  }
  if (data.error) {
    throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  if (!data.content || !Array.isArray(data.content)) {
    throw new Error(`unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`);
  }
  if (data.stop_reason === "max_tokens") {
    throw new Error("response cut off — story too long");
  }
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text.replace(/```json\s*|```\s*/g, "").trim();
}

async function generateStory({ topic, freeText, learningWords, difficulty }) {
  const prompt = buildPrompt({ topic, freeText, learningWords, difficulty });
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const retryNote =
        attempt > 0 && lastError
          ? `\n\nYour previous response failed validation: ${lastError.message}. Fix this and try again. Remember: word fields contain ONLY Georgian letters, never punctuation or Latin characters.`
          : "";
      const fullPrompt = prompt + retryNote;
      const raw = await callApi(fullPrompt);
      const parsed = JSON.parse(raw);
      validateStory(parsed);
      parsed.source = "generated";
      parsed.id = parsed.id + "-" + Date.now().toString(36);
      return parsed;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("generation failed");
}

function normalizeSentence(sentence) {
  if (sentence.midPunctuation && sentence.extraWords) {
    const tokens = [];
    sentence.words.forEach((w, i) => {
      tokens.push({ type: "word", ...w });
      if (i === sentence.midPunctuation.afterIndex) {
        tokens.push({ type: "punct", text: sentence.midPunctuation.mark });
      }
    });
    sentence.extraWords.forEach((w) => tokens.push({ type: "word", ...w }));
    if (sentence.trailing) tokens.push({ type: "punct", text: sentence.trailing });
    return tokens;
  }
  const tokens = sentence.words.map((w) => ({ type: "word", ...w }));
  if (sentence.trailing) tokens.push({ type: "punct", text: sentence.trailing });
  return tokens;
}

const SAVED_WORDS_KEY = "saved-words";
const STORIES_KEY = "stories";
const ARCHIVED_KEY = "archived-story-ids";

const ENABLE_API_GENERATION = false;

export default function GeorgianReader() {
  const [view, setView] = useState("menu");
  const [stories, setStories] = useState([SEED_STORY]);
  const [archivedIds, setArchivedIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [popup, setPopup] = useState(null);
  const [savedWords, setSavedWords] = useState([]);
  const [showKnown, setShowKnown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [freeText, setFreeText] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeStory = stories.find((s) => s.id === activeStoryId);
  const sentence = activeStory?.sentences[sentenceIdx];
  const tokens = sentence ? normalizeSentence(sentence) : [];

  useEffect(() => {
    (async () => {
      try {
        const wordsResult = await window.storage.get(SAVED_WORDS_KEY);
        if (wordsResult?.value) setSavedWords(JSON.parse(wordsResult.value));
      } catch (e) {}
      try {
        const storiesResult = await window.storage.get(STORIES_KEY);
        if (storiesResult?.value) {
          const stored = JSON.parse(storiesResult.value);
          if (Array.isArray(stored) && stored.length > 0) {
            const hasSeed = stored.some((s) => s.id === SEED_STORY.id);
            setStories(hasSeed ? stored : [SEED_STORY, ...stored]);
          }
        }
      } catch (e) {}
      try {
        const archivedResult = await window.storage.get(ARCHIVED_KEY);
        if (archivedResult?.value) setArchivedIds(JSON.parse(archivedResult.value));
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    setShowTranslation(false);
    setPopup(null);
  }, [sentenceIdx, activeStoryId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (popup && !e.target.closest("[data-word]") && !e.target.closest("[data-popup]")) {
        setPopup(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [popup]);

  const isWordSaved = (word) => savedWords.some((w) => w.word === word);

  const persistWords = async (updated) => {
    setSavedWords(updated);
    try {
      await window.storage.set(SAVED_WORDS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const persistStories = async (updated) => {
    setStories(updated);
    try {
      const toStore = updated.filter((s) => s.source !== "seed");
      await window.storage.set(STORIES_KEY, JSON.stringify(toStore));
    } catch (e) {}
  };

  const persistArchived = async (updated) => {
    setArchivedIds(updated);
    try {
      await window.storage.set(ARCHIVED_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const saveWord = async (word, gloss) => {
    if (isWordSaved(word)) return;
    const sentenceContext = tokens
      .map((t) => (t.type === "word" ? t.word : t.text))
      .join(" ")
      .replace(/ ([.,!?])/g, "$1");
    const newEntry = {
      word,
      gloss,
      savedAt: new Date().toISOString(),
      sentenceContext,
      storyId: activeStoryId,
      status: "learning",
    };
    await persistWords([...savedWords, newEntry]);
  };

  const removeSavedWord = async (word) => {
    await persistWords(savedWords.filter((w) => w.word !== word));
  };

  const toggleWordStatus = async (word) => {
    const updated = savedWords.map((w) =>
      w.word === word ? { ...w, status: w.status === "known" ? "learning" : "known" } : w
    );
    await persistWords(updated);
  };

  const toggleArchive = async (storyId) => {
    const updated = archivedIds.includes(storyId)
      ? archivedIds.filter((id) => id !== storyId)
      : [...archivedIds, storyId];
    await persistArchived(updated);
  };

  const openStory = (id) => {
    setActiveStoryId(id);
    setSentenceIdx(0);
    setView("reader");
  };

  const backToMenu = () => {
    setView("menu");
    setActiveStoryId(null);
  };

  const nextSentence = () => {
    if (sentenceIdx < activeStory.sentences.length - 1) {
      setSentenceIdx(sentenceIdx + 1);
    }
  };

  const prevSentence = () => {
    if (sentenceIdx > 0) setSentenceIdx(sentenceIdx - 1);
  };

  const buildStoriesFromData = (data, sourceLabel, suffix = "") => {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      throw new Error("no stories found");
    }
    const newStories = [];
    items.forEach((item, idx) => {
      try {
        validateStory(item);
      } catch (e) {
        throw new Error(`story ${idx + 1}: ${e.message}`);
      }
      newStories.push({
        ...item,
        source: sourceLabel,
        id: (item.id || "imported") + "-" + Date.now().toString(36) + "-" + suffix + idx,
      });
    });
    return newStories;
  };

  const handleImport = async () => {
    setImportError(null);
    setImportSuccess(null);
    if (!importJson.trim()) {
      setImportError("paste some JSON first");
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(importJson);
    } catch (e) {
      setImportError(`not valid JSON: ${e.message}`);
      return;
    }
    try {
      const newStories = buildStoriesFromData(parsed, "imported");
      await persistStories([...stories, ...newStories]);
      setImportSuccess(`imported ${newStories.length} ${newStories.length === 1 ? "story" : "stories"}`);
      setImportJson("");
      setTimeout(() => {
        setShowImporter(false);
        setImportSuccess(null);
      }, 1200);
    } catch (e) {
      setImportError(e.message);
    }
  };

  const handleFileUpload = async (e) => {
    setImportError(null);
    setImportSuccess(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allNewStories = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (parseErr) {
          errors.push(`${file.name}: invalid JSON`);
          continue;
        }
        try {
          const built = buildStoriesFromData(parsed, "uploaded", `f${i}-`);
          allNewStories.push(...built);
        } catch (validErr) {
          errors.push(`${file.name}: ${validErr.message}`);
        }
      } catch (readErr) {
        errors.push(`${file.name}: could not read file`);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (allNewStories.length > 0) {
      await persistStories([...stories, ...allNewStories]);
      setImportSuccess(
        `imported ${allNewStories.length} ${allNewStories.length === 1 ? "story" : "stories"}` +
          (errors.length ? ` (${errors.length} failed)` : "")
      );
      if (errors.length === 0) {
        setTimeout(() => {
          setShowImporter(false);
          setImportSuccess(null);
        }, 1200);
      }
    }
    if (errors.length > 0) {
      setImportError(errors.join("; "));
    }
  };

  const handleGenerate = async ({ random = false } = {}) => {
    setGenError(null);
    setGenerating(true);
    try {
      const learningWords = savedWords.filter((w) => w.status !== "known");
      const topic = random
        ? TOPICS[Math.floor(Math.random() * TOPICS.length)]
        : selectedTopic;
      const story = await generateStory({
        topic,
        freeText: freeText.trim() || null,
        learningWords,
        difficulty: "A2",
      });
      await persistStories([...stories, story]);
      setShowGenerator(false);
      setFreeText("");
      setSelectedTopic(null);
    } catch (e) {
      setGenError(e.message || "generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const styles = {
    cream: "#f4ecdc",
    creamDark: "#ebe0c8",
    ink: "#2a1f17",
    inkSoft: "#5a4a3a",
    wine: "#7a1f2b",
    wineDark: "#5a141f",
    gold: "#b8893a",
  };

  const popupWordSaved = popup ? isWordSaved(popup.word) : false;

  const learningWords = [...savedWords]
    .filter((w) => w.status !== "known")
    .sort((a, b) => a.word.localeCompare(b.word, "ka"));
  const knownWords = [...savedWords]
    .filter((w) => w.status === "known")
    .sort((a, b) => a.word.localeCompare(b.word, "ka"));

  const visibleStories = stories.filter((s) => !archivedIds.includes(s.id));
  const archivedStories = stories.filter((s) => archivedIds.includes(s.id));

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, ${styles.cream} 0%, ${styles.creamDark} 100%)`,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        color: styles.ink,
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      <div style={{ position: "relative", maxWidth: "480px", margin: "0 auto", padding: "24px 20px 120px" }}>
        {view === "menu" && (
          <div>
            <header style={{ textAlign: "center", marginBottom: "40px", marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: styles.gold,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                Read · წაიკითხე
              </div>
              <h1
                style={{
                  fontSize: "44px",
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.05,
                  color: styles.wine,
                }}
              >
                ქართული
              </h1>
              <div style={{ width: "60px", height: "1px", background: styles.gold, margin: "16px auto" }} />
              <p
                style={{
                  fontSize: "14px",
                  color: styles.inkSoft,
                  fontFamily: "'DM Sans', sans-serif",
                  margin: 0,
                }}
              >
                tap a story to begin
              </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {visibleStories.map((story) => (
                <div
                  key={story.id}
                  style={{
                    background: "rgba(255, 252, 245, 0.6)",
                    border: `1px solid ${styles.creamDark}`,
                    borderRadius: "2px",
                    boxShadow: "0 1px 0 rgba(122, 31, 43, 0.04)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => openStory(story.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "24px 22px",
                      paddingRight: "52px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: styles.ink,
                      width: "100%",
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: styles.gold,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {story.difficulty}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: styles.inkSoft,
                          fontFamily: "'DM Sans', sans-serif",
                          marginRight: "30px",
                        }}
                      >
                        {story.sentences.length} sentences
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: styles.wine,
                        marginBottom: "4px",
                      }}
                    >
                      {story.title}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontStyle: "italic",
                        color: styles.inkSoft,
                        marginBottom: "10px",
                      }}
                    >
                      {story.titleEn}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: styles.inkSoft,
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.4,
                      }}
                    >
                      {story.description}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchive(story.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "16px",
                      background: "transparent",
                      border: "none",
                      color: styles.inkSoft,
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                    }}
                    aria-label="archive"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              ))}

              {ENABLE_API_GENERATION && (
                <button
                  onClick={() => setShowGenerator(!showGenerator)}
                  style={{
                    background: showGenerator ? styles.gold : "transparent",
                    border: `1px dashed ${styles.gold}`,
                    borderRadius: "2px",
                    padding: "20px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: showGenerator ? styles.ink : styles.gold,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <Sparkles size={14} />
                  {showGenerator ? "close" : "generate new story"}
                </button>
              )}

              {ENABLE_API_GENERATION && showGenerator && (
                <div
                  style={{
                    background: "rgba(255, 252, 245, 0.6)",
                    border: `1px solid ${styles.creamDark}`,
                    borderRadius: "2px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: styles.gold,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    pick a topic
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    {TOPICS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTopic(selectedTopic?.id === t.id ? null : t)}
                        style={{
                          background: selectedTopic?.id === t.id ? styles.wine : "transparent",
                          color: selectedTopic?.id === t.id ? styles.cream : styles.ink,
                          border: `1px solid ${selectedTopic?.id === t.id ? styles.wine : styles.creamDark}`,
                          borderRadius: "2px",
                          padding: "10px 8px",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: styles.gold,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    or describe one
                  </div>
                  <input
                    type="text"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="e.g. a rainy day in Batumi"
                    style={{
                      background: "rgba(255, 252, 245, 0.8)",
                      border: `1px solid ${styles.creamDark}`,
                      borderRadius: "2px",
                      padding: "12px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      color: styles.ink,
                      outline: "none",
                    }}
                  />

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => handleGenerate({ random: false })}
                      disabled={generating || (!selectedTopic && !freeText.trim())}
                      style={{
                        flex: 1,
                        background: styles.wine,
                        color: styles.cream,
                        border: `1px solid ${styles.wine}`,
                        borderRadius: "2px",
                        padding: "14px",
                        cursor:
                          generating || (!selectedTopic && !freeText.trim())
                            ? "not-allowed"
                            : "pointer",
                        opacity: generating || (!selectedTopic && !freeText.trim()) ? 0.4 : 1,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {generating ? "writing..." : "generate"}
                    </button>
                    <button
                      onClick={() => handleGenerate({ random: true })}
                      disabled={generating}
                      style={{
                        background: "transparent",
                        color: styles.gold,
                        border: `1px solid ${styles.gold}`,
                        borderRadius: "2px",
                        padding: "14px 18px",
                        cursor: generating ? "not-allowed" : "pointer",
                        opacity: generating ? 0.4 : 1,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Shuffle size={12} />
                      surprise
                    </button>
                  </div>

                  {genError && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: styles.wine,
                        fontFamily: "'DM Sans', sans-serif",
                        padding: "10px",
                        background: "rgba(122, 31, 43, 0.08)",
                        borderRadius: "2px",
                      }}
                    >
                      {genError}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowImporter(!showImporter)}
                style={{
                  background: showImporter ? styles.gold : "transparent",
                  border: `1px dashed ${styles.gold}`,
                  borderRadius: "2px",
                  padding: "20px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: showImporter ? styles.ink : styles.gold,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <Sparkles size={14} />
                {showImporter ? "close" : "import story"}
              </button>

              {showImporter && (
                <div
                  style={{
                    background: "rgba(255, 252, 245, 0.6)",
                    border: `1px solid ${styles.creamDark}`,
                    borderRadius: "2px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: styles.inkSoft,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    upload one or more JSON files, or paste a story below. each file can contain a single story object or an array of stories.
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "transparent",
                      color: styles.wine,
                      border: `1px dashed ${styles.wine}`,
                      borderRadius: "2px",
                      padding: "16px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Upload size={14} />
                    choose JSON file(s)
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: styles.inkSoft,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      margin: "4px 0",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", background: styles.creamDark }} />
                    or paste
                    <div style={{ flex: 1, height: "1px", background: styles.creamDark }} />
                  </div>

                  <textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder='{"id": "...", "title": "...", "sentences": [...]}'
                    rows={10}
                    style={{
                      background: "rgba(255, 252, 245, 0.8)",
                      border: `1px solid ${styles.creamDark}`,
                      borderRadius: "2px",
                      padding: "12px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: styles.ink,
                      outline: "none",
                      resize: "vertical",
                      minHeight: "120px",
                    }}
                  />
                  <button
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                    style={{
                      background: styles.wine,
                      color: styles.cream,
                      border: `1px solid ${styles.wine}`,
                      borderRadius: "2px",
                      padding: "14px",
                      cursor: importJson.trim() ? "pointer" : "not-allowed",
                      opacity: importJson.trim() ? 1 : 0.4,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    import pasted JSON
                  </button>
                  {importSuccess && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2a6e3f",
                        fontFamily: "'DM Sans', sans-serif",
                        padding: "10px",
                        background: "rgba(42, 110, 63, 0.08)",
                        borderRadius: "2px",
                      }}
                    >
                      ✓ {importSuccess}
                    </div>
                  )}
                  {importError && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: styles.wine,
                        fontFamily: "'DM Sans', sans-serif",
                        padding: "10px",
                        background: "rgba(122, 31, 43, 0.08)",
                        borderRadius: "2px",
                      }}
                    >
                      {importError}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setView("words")}
                style={{
                  background: "transparent",
                  border: `1px solid ${styles.creamDark}`,
                  borderRadius: "2px",
                  padding: "20px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: styles.inkSoft,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Library size={14} />
                saved words ({savedWords.length})
              </button>

              {archivedStories.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: styles.inkSoft,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 0",
                    }}
                  >
                    {showArchived ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    archived ({archivedStories.length})
                  </button>
                  {showArchived && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      {archivedStories.map((story) => (
                        <div
                          key={story.id}
                          style={{
                            background: "rgba(255, 252, 245, 0.3)",
                            border: `1px solid ${styles.creamDark}`,
                            borderRadius: "2px",
                            padding: "16px 18px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            opacity: 0.8,
                          }}
                        >
                          <button
                            onClick={() => openStory(story.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              flex: 1,
                              padding: 0,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: styles.wine,
                                fontFamily: "'Cormorant Garamond', serif",
                                marginBottom: "2px",
                              }}
                            >
                              {story.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: styles.inkSoft,
                                fontStyle: "italic",
                              }}
                            >
                              {story.titleEn}
                            </div>
                          </button>
                          <button
                            onClick={() => toggleArchive(story.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: styles.inkSoft,
                              cursor: "pointer",
                              padding: "6px",
                              display: "flex",
                            }}
                            aria-label="unarchive"
                          >
                            <ArchiveRestore size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "words" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                paddingTop: "8px",
              }}
            >
              <button
                onClick={() => setView("menu")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: styles.inkSoft,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  padding: "8px 0",
                }}
              >
                <ArrowLeft size={16} />
                back
              </button>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  color: styles.gold,
                  fontWeight: 600,
                }}
              >
                {learningWords.length} learning · {knownWords.length} known
              </div>
            </div>

            <h2
              style={{
                fontSize: "32px",
                fontWeight: 600,
                color: styles.wine,
                margin: "0 0 8px",
              }}
            >
              შენახული სიტყვები
            </h2>
            <div
              style={{
                fontSize: "14px",
                fontStyle: "italic",
                color: styles.inkSoft,
                marginBottom: "32px",
              }}
            >
              saved words
            </div>

            {savedWords.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: styles.inkSoft,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  border: `1px dashed ${styles.creamDark}`,
                  borderRadius: "2px",
                }}
              >
                tap a word while reading,
                <br />
                then save it to study later
              </div>
            ) : (
              <>
                {learningWords.length > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: styles.gold,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        marginBottom: "12px",
                      }}
                    >
                      learning
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {learningWords.map((w) => (
                        <WordCard
                          key={w.word + w.savedAt}
                          word={w}
                          styles={styles}
                          onToggleStatus={() => toggleWordStatus(w.word)}
                          onRemove={() => removeSavedWord(w.word)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {knownWords.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowKnown(!showKnown)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: styles.inkSoft,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "10px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 0",
                        marginBottom: "8px",
                      }}
                    >
                      {showKnown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      known ({knownWords.length})
                    </button>
                    {showKnown && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {knownWords.map((w) => (
                          <WordCard
                            key={w.word + w.savedAt}
                            word={w}
                            styles={styles}
                            onToggleStatus={() => toggleWordStatus(w.word)}
                            onRemove={() => removeSavedWord(w.word)}
                            muted
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "reader" && activeStory && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                paddingTop: "8px",
              }}
            >
              <button
                onClick={backToMenu}
                style={{
                  background: "transparent",
                  border: "none",
                  color: styles.inkSoft,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  padding: "8px 0",
                }}
              >
                <ArrowLeft size={16} />
                stories
              </button>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  color: styles.gold,
                  fontWeight: 600,
                }}
              >
                {sentenceIdx + 1} / {activeStory.sentences.length}
              </div>
            </div>

            <div style={{ display: "flex", gap: "3px", marginBottom: "48px" }}>
              {activeStory.sentences.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "2px",
                    background: i <= sentenceIdx ? styles.wine : styles.creamDark,
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>

            <div style={{ minHeight: "240px", position: "relative" }}>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: styles.gold,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                {activeStory.title}
              </div>

              <div
                style={{
                  fontSize: "30px",
                  lineHeight: 1.5,
                  color: styles.ink,
                  marginBottom: "32px",
                  fontWeight: 500,
                }}
              >
                {tokens.map((t, i) => {
                  if (t.type === "punct") {
                    return <span key={i}>{t.text}</span>;
                  }
                  const saved = isWordSaved(t.word);
                  const isActive = popup?.word === t.word;
                  const prevWasWord = i > 0 && tokens[i - 1].type === "word";
                  return (
                    <span key={i}>
                      {prevWasWord && " "}
                      <span
                        data-word
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const containerRect = containerRef.current.getBoundingClientRect();
                          setPopup({
                            word: t.word,
                            gloss: t.gloss,
                            left: rect.left - containerRect.left + rect.width / 2,
                            top: rect.bottom - containerRect.top + 8,
                          });
                        }}
                        style={{
                          cursor: "pointer",
                          borderBottom: isActive
                            ? `2px solid ${styles.wine}`
                            : saved
                            ? `2px solid ${styles.gold}`
                            : `1px dotted ${styles.gold}`,
                          padding: "0 1px",
                          transition: "all 0.15s",
                        }}
                      >
                        {t.word}
                      </span>
                    </span>
                  );
                })}
              </div>

              {showTranslation && (
                <div
                  style={{
                    fontSize: "16px",
                    fontStyle: "italic",
                    color: styles.inkSoft,
                    fontFamily: "'Cormorant Garamond', serif",
                    paddingLeft: "16px",
                    borderLeft: `2px solid ${styles.gold}`,
                    marginBottom: "32px",
                    lineHeight: 1.5,
                  }}
                >
                  {sentence.english}
                </div>
              )}

              <button
                onClick={() => setShowTranslation(!showTranslation)}
                style={{
                  background: "transparent",
                  border: `1px solid ${styles.creamDark}`,
                  borderRadius: "2px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: styles.inkSoft,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 500,
                }}
              >
                {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
                {showTranslation ? "hide" : "show"} translation
              </button>
            </div>

            {popup && (
              <div
                data-popup
                style={{
                  position: "absolute",
                  left: Math.min(Math.max(popup.left, 140), 340),
                  top: popup.top,
                  transform: "translateX(-50%)",
                  background: styles.ink,
                  color: styles.cream,
                  padding: "14px 16px",
                  borderRadius: "2px",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                  width: "260px",
                  zIndex: 100,
                  boxShadow: "0 8px 24px rgba(42, 31, 23, 0.3)",
                  lineHeight: 1.4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: styles.cream,
                    }}
                  >
                    {popup.word}
                  </div>
                  <button
                    onClick={() => setPopup(null)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: styles.creamDark,
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                    }}
                    aria-label="close"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ color: styles.creamDark, marginBottom: "12px" }}>{popup.gloss}</div>
                <button
                  onClick={() => {
                    if (popupWordSaved) {
                      removeSavedWord(popup.word);
                    } else {
                      saveWord(popup.word, popup.gloss);
                    }
                  }}
                  style={{
                    width: "100%",
                    background: popupWordSaved ? styles.gold : "transparent",
                    color: popupWordSaved ? styles.ink : styles.gold,
                    border: `1px solid ${styles.gold}`,
                    borderRadius: "2px",
                    padding: "10px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {popupWordSaved ? <Bookmark size={12} /> : <BookmarkPlus size={12} />}
                  {popupWordSaved ? "saved" : "save word"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {view === "reader" && activeStory && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(to top, ${styles.cream} 70%, transparent)`,
            padding: "20px 20px 32px",
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={prevSentence}
            disabled={sentenceIdx === 0}
            style={{
              flex: 1,
              maxWidth: "120px",
              background: "transparent",
              border: `1px solid ${styles.creamDark}`,
              borderRadius: "2px",
              padding: "16px",
              cursor: sentenceIdx === 0 ? "not-allowed" : "pointer",
              opacity: sentenceIdx === 0 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: styles.ink,
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSentence}
            disabled={sentenceIdx === activeStory.sentences.length - 1}
            style={{
              flex: 1,
              maxWidth: "120px",
              background: styles.wine,
              border: `1px solid ${styles.wine}`,
              borderRadius: "2px",
              padding: "16px",
              cursor:
                sentenceIdx === activeStory.sentences.length - 1 ? "not-allowed" : "pointer",
              opacity: sentenceIdx === activeStory.sentences.length - 1 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: styles.cream,
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function WordCard({ word, styles, onToggleStatus, onRemove, muted = false }) {
  return (
    <div
      style={{
        background: muted ? "rgba(255, 252, 245, 0.3)" : "rgba(255, 252, 245, 0.6)",
        border: `1px solid ${styles.creamDark}`,
        borderRadius: "2px",
        padding: "16px 18px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        opacity: muted ? 0.75 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: styles.wine,
            marginBottom: "4px",
          }}
        >
          {word.word}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: styles.ink,
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          {word.gloss}
        </div>
        {word.sentenceContext && (
          <div
            style={{
              fontSize: "13px",
              color: styles.inkSoft,
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            {word.sentenceContext}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <button
          onClick={onToggleStatus}
          style={{
            background: "transparent",
            border: "none",
            color: word.status === "known" ? styles.gold : styles.inkSoft,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={word.status === "known" ? "mark as learning" : "mark as known"}
          title={word.status === "known" ? "mark as learning" : "mark as known"}
        >
          {word.status === "known" ? <RotateCcw size={16} /> : <Check size={16} />}
        </button>
        <button
          onClick={onRemove}
          style={{
            background: "transparent",
            border: "none",
            color: styles.inkSoft,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="remove"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
