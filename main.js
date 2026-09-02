/* =========================================================
   LEGA — MAIN.JS
   Prototype 1 — Flexible Reflection Data Model
========================================================= */

(() => {
  "use strict";

  /* =====================================================
       1. CONSTANTS
    ====================================================== */

  const LEGA_DAY_RESET_HOUR = 3;

  const CLOCK_TICK_INTERVAL = 250;

  const STORAGE_KEYS = {
    entries: "lega.entries.v1",

    onboarding: "lega.onboarding.v1",

    settings: "lega.settings.v1",
  };

  const VALID_THEMES = [
    "soft",
    "sage-light",
    "sage-deep",
    "blue-soft",
    "lavender-soft",
    "dark",
    "high-contrast",
    "true-black",
  ];

  const VALID_TEXT_SIZES = ["standard", "large", "extra-large"];

  const VALID_TYPOGRAPHIES = ["clean", "friendly", "scrapbook"];

  const LEGACY_COLOURS = {
    peach: "#eebea8",

    yellow: "#e7d27f",

    green: "#abcba9",

    blue: "#a9cadb",

    lavender: "#c4b9d6",

    pink: "#ddb2c5",
  };

  const DEFAULT_SETTINGS = {
    theme: "soft",

    showMoodPatterns: true,

    textSize: "standard",

    typography: "clean",
  };

  /* =====================================================
       2. STATE
    ====================================================== */

  const state = {
    entries: [],

    settings: {
      ...DEFAULT_SETTINGS,
    },

    activeDayKey: null,

    currentLegaDayKey: null,

    currentDate: new Date(),

    clockInterval: null,

    lastTimelineRefreshMinute: null,

    initialized: false,
  };

  /* =====================================================
       3. DOM
    ====================================================== */

  const dom = {};

  function cacheDOM() {
    dom.currentWeekday = document.getElementById("currentWeekday");

    dom.currentDate = document.getElementById("currentDate");

    dom.digitalClock = document.getElementById("digitalClock");

    dom.digitalClockTime = document.getElementById("digitalClockTime");

    dom.digitalClockPeriod = document.getElementById("digitalClockPeriod");

    dom.todayEntryList = document.getElementById("todayEntryList");

    dom.todayEntryCount = document.getElementById("todayEntryCount");

    dom.totalEntriesToday = document.getElementById("totalEntriesToday");

    dom.dimensionsUsedToday = document.getElementById("dimensionsUsedToday");

    dom.timelineRecordedToday = document.getElementById(
      "timelineRecordedToday",
    );

    dom.firstEntryTime = document.getElementById("firstEntryTime");

    dom.latestEntryTime = document.getElementById("latestEntryTime");

    dom.weeklyEntryCount = document.getElementById("weeklyEntryCount");

    dom.weeklyOverview = document.getElementById("weeklyOverview");

    dom.timePatternChart = document.getElementById("timePatternChart");

    dom.dimensionSummary = document.getElementById("dimensionSummary");

    dom.monthlyEntryCount = document.getElementById("monthlyEntryCount");

    dom.monthlyOverview = document.getElementById("monthlyOverview");

    dom.monthlyTimePatternChart = document.getElementById(
      "monthlyTimePatternChart",
    );

    dom.monthlyDimensionSummary = document.getElementById(
      "monthlyDimensionSummary",
    );

    dom.monthlyReflectionSummary = document.getElementById(
      "monthlyReflectionSummary",
    );
  }

  /* =====================================================
       4. UTILITIES
    ====================================================== */

  function clone(value) {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }

  function padNumber(number) {
    return String(number).padStart(2, "0");
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  function generateID() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return (
      "lega-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  /* =====================================================
       5. STORAGE
    ====================================================== */

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.warn(`[Lega] Could not read ${key}.`, error);

      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));

      return true;
    } catch (error) {
      console.warn(`[Lega] Could not save ${key}.`, error);

      return false;
    }
  }

  /* =====================================================
       6. DAY KEYS
    ====================================================== */

  function formatDateKey(date) {
    return [
      date.getFullYear(),
      padNumber(date.getMonth() + 1),
      padNumber(date.getDate()),
    ].join("-");
  }

  function getLegaDayKey(date = new Date()) {
    const working = new Date(date.getTime());

    if (working.getHours() < LEGA_DAY_RESET_HOUR) {
      working.setDate(working.getDate() - 1);
    }

    return formatDateKey(working);
  }

  function dateFromDayKey(dayKey) {
    const parts = String(dayKey).split("-").map(Number);

    if (parts.length !== 3) {
      return null;
    }

    const [year, month, day] = parts;

    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (!isValidDate(date)) {
      return null;
    }

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function getLegaDayStart(dayKey) {
    const date = dateFromDayKey(dayKey);

    if (!date) {
      return null;
    }

    date.setHours(LEGA_DAY_RESET_HOUR, 0, 0, 0);

    return date;
  }

  function getLegaDayEnd(dayKey) {
    const start = getLegaDayStart(dayKey);

    if (!start) {
      return null;
    }

    const end = new Date(start.getTime());

    end.setDate(end.getDate() + 1);

    return end;
  }

  function isCurrentLegaDay(dayKey) {
    return dayKey === getLegaDayKey(new Date());
  }

  /* =====================================================
       7. DATE DISPLAY
    ====================================================== */

  function formatDisplayDate(dayKey) {
    const date = dateFromDayKey(dayKey);

    if (!date) {
      return {
        weekday: "",
        date: "",
      };
    }

    return {
      weekday: new Intl.DateTimeFormat("en-AU", {
        weekday: "long",
      }).format(date),

      date: new Intl.DateTimeFormat("en-AU", {
        day: "numeric",

        month: "long",

        year: "numeric",
      }).format(date),
    };
  }

  function updateDateDisplay() {
    const formatted = formatDisplayDate(state.activeDayKey);

    if (dom.currentWeekday) {
      dom.currentWeekday.textContent = formatted.weekday;
    }

    if (dom.currentDate) {
      dom.currentDate.textContent = formatted.date;
    }
  }

  /* =====================================================
       8. CLOCK FORMATTING
    ====================================================== */

  function formatClockTime(date) {
    let hours = date.getHours();

    const minutes = padNumber(date.getMinutes());

    const period = hours >= 12 ? "PM" : "AM";

    hours %= 12;

    if (hours === 0) {
      hours = 12;
    }

    return {
      time: `${padNumber(hours)}:${minutes}`,

      period,
    };
  }

  function formatEntryTime(timestamp) {
    const date = new Date(timestamp);

    if (!isValidDate(date)) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",

      minute: "2-digit",

      hour12: true,
    }).format(date);
  }

  /* =====================================================
       9. CLOCK ANGLES
    ====================================================== */

  function getMinutesSinceMidnight(date) {
    return (
      date.getHours() * 60 +
      date.getMinutes() +
      date.getSeconds() / 60 +
      date.getMilliseconds() / 60000
    );
  }

  function minutesToDegrees(minutes) {
    return (minutes / 1440) * 360;
  }

  function get24HourClockAngle(date) {
    return minutesToDegrees(getMinutesSinceMidnight(date));
  }

  function getMinuteHandAngle(date) {
    const minute =
      date.getMinutes() +
      date.getSeconds() / 60 +
      date.getMilliseconds() / 60000;

    return (minute / 60) * 360;
  }

  function getSecondHandAngle(date) {
    const second = date.getSeconds() + date.getMilliseconds() / 1000;

    return (second / 60) * 360;
  }

  function getClockAngles(date = new Date()) {
    return {
      hourAngle: get24HourClockAngle(date),

      minuteAngle: getMinuteHandAngle(date),

      secondAngle: getSecondHandAngle(date),
    };
  }

  /* =====================================================
       10. COLOUR NORMALISATION
    ====================================================== */

  function isHexColour(colour) {
    return typeof colour === "string" && /^#[0-9a-f]{6}$/i.test(colour);
  }

  function normaliseColour(colour) {
    if (!colour) {
      return null;
    }

    if (isHexColour(colour)) {
      return colour.toLowerCase();
    }

    if (LEGACY_COLOURS[colour]) {
      return LEGACY_COLOURS[colour];
    }

    return null;
  }

  /* =====================================================
       11. FLEXIBLE REFLECTION DIMENSIONS
       -----------------------------------------------------
       Any slider ID is accepted.

       Example:
       {
           "mental-load": 67,
           "social-energy": 32,
           "sleepiness": 90
       }
    ====================================================== */

  function normaliseDimensions(dimensions = {}) {
    if (
      !dimensions ||
      typeof dimensions !== "object" ||
      Array.isArray(dimensions)
    ) {
      return {};
    }

    const result = {};

    Object.entries(dimensions).forEach(([rawKey, rawValue]) => {
      const key = String(rawKey).trim();

      if (!key) {
        return;
      }

      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return;
      }

      const value = Number(rawValue);

      if (!Number.isFinite(value)) {
        return;
      }

      result[key] = clamp(value, 0, 100);
    });

    return result;
  }

  function formatDimensionName(dimensionID) {
    return String(dimensionID)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  /* =====================================================
       12. ENTRY NORMALISATION
    ====================================================== */

  function normaliseEntry(entry) {
    if (!entry) {
      return null;
    }

    const timestamp = Number(entry.timestamp);

    const date = new Date(timestamp);

    if (!Number.isFinite(timestamp) || !isValidDate(date)) {
      return null;
    }

    let endTimestamp = null;

    if (entry.endTimestamp !== null && entry.endTimestamp !== undefined) {
      const possibleEnd = Number(entry.endTimestamp);

      if (Number.isFinite(possibleEnd) && possibleEnd > timestamp) {
        endTimestamp = possibleEnd;
      }
    }

    return {
      id: entry.id || generateID(),

      timestamp,

      endTimestamp,

      dayKey: getLegaDayKey(date),

      createdAt: entry.createdAt || new Date().toISOString(),

      updatedAt: entry.updatedAt || null,

      title: String(entry.title || "").trim(),

      note: String(entry.note || "").trim(),

      emoji: String(entry.emoji || "").trim(),

      colour: normaliseColour(entry.colour),

      dimensions: normaliseDimensions(entry.dimensions),
    };
  }

  /* =====================================================
       13. ENTRIES STORAGE
    ====================================================== */

  function loadEntries() {
    const stored = readStorage(STORAGE_KEYS.entries, []);

    if (!Array.isArray(stored)) {
      state.entries = [];

      return;
    }

    state.entries = stored
      .map(normaliseEntry)
      .filter(Boolean)
      .sort((first, second) => first.timestamp - second.timestamp);

    /*
           Re-save migrated legacy colour names as
           actual colours.
        */

    saveEntries();
  }

  function saveEntries() {
    writeStorage(STORAGE_KEYS.entries, state.entries);
  }

  function sortEntries() {
    state.entries.sort((first, second) => first.timestamp - second.timestamp);
  }

  /* =====================================================
       14. CRUD
    ====================================================== */

  function createEntry(data = {}) {
    const timestamp =
      data.timestamp !== undefined ? Number(data.timestamp) : Date.now();

    const entry = normaliseEntry({
      id: generateID(),

      timestamp,

      endTimestamp: data.endTimestamp ?? null,

      title: data.title,

      note: data.note,

      emoji: data.emoji,

      colour: data.colour,

      dimensions: data.dimensions,

      createdAt: new Date().toISOString(),
    });

    if (!entry) {
      return null;
    }

    state.entries.push(entry);

    sortEntries();

    saveEntries();

    refreshActiveDay();

    dispatchLegaEvent("entry-created", clone(entry));

    return clone(entry);
  }

  function updateEntry(entryID, changes = {}) {
    const index = state.entries.findIndex((entry) => entry.id === entryID);

    if (index === -1) {
      return null;
    }

    const existing = state.entries[index];

    const updated = normaliseEntry({
      ...existing,

      ...changes,

      id: existing.id,

      createdAt: existing.createdAt,

      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return null;
    }

    state.entries[index] = updated;

    sortEntries();

    saveEntries();

    refreshActiveDay();

    dispatchLegaEvent("entry-updated", clone(updated));

    return clone(updated);
  }

  function deleteEntry(entryID) {
    const previousLength = state.entries.length;

    state.entries = state.entries.filter((entry) => entry.id !== entryID);

    if (state.entries.length === previousLength) {
      return false;
    }

    saveEntries();

    refreshActiveDay();

    dispatchLegaEvent("entry-deleted", {
      id: entryID,
    });

    return true;
  }

  function getEntry(entryID) {
    const entry = state.entries.find((item) => item.id === entryID);

    return entry ? clone(entry) : null;
  }

  function getAllEntries() {
    return clone(state.entries);
  }

  /* =====================================================
       15. DAY QUERIES
    ====================================================== */

  function getEntriesForDay(dayKey) {
    return state.entries
      .filter((entry) => entry.dayKey === dayKey)
      .sort((first, second) => first.timestamp - second.timestamp)
      .map(clone);
  }

  function getActiveDayEntries() {
    return getEntriesForDay(state.activeDayKey);
  }

  /* =====================================================
       16. TIMELINE
    ====================================================== */

  function buildMoodTimeline(dayKey = state.activeDayKey) {
    const entries = getEntriesForDay(dayKey);

    if (!entries.length) {
      return [];
    }

    const dayEnd = getLegaDayEnd(dayKey);

    if (!dayEnd) {
      return [];
    }

    const now = new Date();

    const timelineLimit = isCurrentLegaDay(dayKey)
      ? now.getTime()
      : dayEnd.getTime();

    const segments = [];

    entries.forEach((entry, index) => {
      if (entry.timestamp > timelineLimit) {
        return;
      }

      const nextEntry = entries[index + 1];

      let segmentEnd = nextEntry ? nextEntry.timestamp : timelineLimit;

      if (entry.endTimestamp && entry.endTimestamp < segmentEnd) {
        segmentEnd = entry.endTimestamp;
      }

      segmentEnd = Math.min(segmentEnd, timelineLimit);

      if (segmentEnd <= entry.timestamp) {
        return;
      }

      const startDate = new Date(entry.timestamp);

      const endDate = new Date(segmentEnd);

      const startDegree = minutesToDegrees(getMinutesSinceMidnight(startDate));

      const endDegree = minutesToDegrees(getMinutesSinceMidnight(endDate));

      const crossesMidnight =
        formatDateKey(startDate) !== formatDateKey(endDate) ||
        endDegree < startDegree;

      segments.push({
        id: entry.id,

        entryID: entry.id,

        startTimestamp: entry.timestamp,

        endTimestamp: segmentEnd,

        durationMinutes: (segmentEnd - entry.timestamp) / 60000,

        startDegree,

        endDegree,

        crossesMidnight,

        colour: entry.colour,

        emoji: entry.emoji,

        title: entry.title,
      });
    });

    return segments;
  }

  /* =====================================================
       17. ENTRY LIST
    ====================================================== */

  function renderEntryList() {
    if (!dom.todayEntryList) {
      return;
    }

    const entries = getActiveDayEntries();

    dom.todayEntryList.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement("div");

      empty.className = "empty-state";

      const icon = document.createElement("span");

      icon.className = "empty-state__icon";

      icon.textContent = "◌";

      const title = document.createElement("p");

      title.textContent = "Nothing here yet.";

      const description = document.createElement("span");

      description.textContent =
        "Your moments will appear here as you add them.";

      empty.append(icon, title, description);

      dom.todayEntryList.append(empty);

      return;
    }

    entries.forEach((entry) => {
      const card = document.createElement("button");

      card.type = "button";

      card.className = "entry-card";

      card.dataset.entryId = entry.id;

      const visual = document.createElement("span");

      visual.className = "entry-card__visual";

      visual.textContent = entry.emoji || "◌";

      if (entry.colour) {
        visual.style.background = entry.colour;
      }

      const information = document.createElement("span");

      information.style.minWidth = "0";

      const title = document.createElement("span");

      title.className = "entry-card__title";

      title.textContent = entry.title || entry.note || "A moment";

      const time = document.createElement("span");

      time.className = "entry-card__time";

      time.textContent = formatEntryTime(entry.timestamp);

      information.append(title, time);

      card.append(visual, information);

      dom.todayEntryList.append(card);
    });
  }

  /* =====================================================
       18. DIMENSION HELPERS
    ====================================================== */

  function getDimensionsUsed(entries) {
    const used = new Set();

    entries.forEach((entry) => {
      Object.keys(entry.dimensions || {}).forEach((dimension) =>
        used.add(dimension),
      );
    });

    return Array.from(used);
  }

  function getDimensionAverages(entries) {
    const totals = {};
    const counts = {};

    entries.forEach((entry) => {
      Object.entries(entry.dimensions || {}).forEach(([dimension, value]) => {
        if (typeof value !== "number") {
          return;
        }

        totals[dimension] = (totals[dimension] || 0) + value;

        counts[dimension] = (counts[dimension] || 0) + 1;
      });
    });

    const averages = {};

    Object.keys(totals).forEach((dimension) => {
      averages[dimension] = Math.round(totals[dimension] / counts[dimension]);
    });

    return averages;
  }

  /* =====================================================
       19. DURATION
    ====================================================== */

  function getTimelineRecordedMinutes(dayKey) {
    return buildMoodTimeline(dayKey).reduce(
      (total, segment) => total + segment.durationMinutes,
      0,
    );
  }

  function formatDurationMinutes(totalMinutes) {
    const rounded = Math.max(0, Math.round(totalMinutes));

    if (rounded <= 0) {
      return "—";
    }

    const hours = Math.floor(rounded / 60);

    const minutes = rounded % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    }

    return `${hours} ${hours === 1 ? "hr" : "hrs"} ${minutes} min`;
  }

  /* =====================================================
       20. DAILY SUMMARY
    ====================================================== */

  function renderDailySummary() {
    const entries = getActiveDayEntries();

    const count = entries.length;

    if (dom.todayEntryCount) {
      dom.todayEntryCount.textContent = `${count} ${
        count === 1 ? "entry" : "entries"
      }`;
    }

    if (dom.totalEntriesToday) {
      dom.totalEntriesToday.textContent = String(count);
    }

    const dimensions = getDimensionsUsed(entries);

    if (dom.dimensionsUsedToday) {
      dom.dimensionsUsedToday.textContent = String(dimensions.length);
    }

    if (dom.timelineRecordedToday) {
      dom.timelineRecordedToday.textContent = formatDurationMinutes(
        getTimelineRecordedMinutes(state.activeDayKey),
      );
    }

    if (!entries.length) {
      if (dom.firstEntryTime) {
        dom.firstEntryTime.textContent = "—";
      }

      if (dom.latestEntryTime) {
        dom.latestEntryTime.textContent = "—";
      }

      return;
    }

    if (dom.firstEntryTime) {
      dom.firstEntryTime.textContent = formatEntryTime(entries[0].timestamp);
    }

    if (dom.latestEntryTime) {
      dom.latestEntryTime.textContent = formatEntryTime(
        entries[entries.length - 1].timestamp,
      );
    }
  }

  /* =====================================================
       21. WEEK
    ====================================================== */

  function getWeekStart(dayKey) {
    const date = dateFromDayKey(dayKey);

    if (!date) {
      return null;
    }

    const weekday = date.getDay();

    const offset = weekday === 0 ? 6 : weekday - 1;

    date.setDate(date.getDate() - offset);

    return date;
  }

  function getEntriesForWeek(dayKey) {
    const start = getWeekStart(dayKey);

    if (!start) {
      return [];
    }

    const end = new Date(start.getTime());

    end.setDate(end.getDate() + 7);

    return state.entries
      .filter((entry) => {
        const day = dateFromDayKey(entry.dayKey);

        return day && day >= start && day < end;
      })
      .sort((first, second) => first.timestamp - second.timestamp)
      .map(clone);
  }

  function getMonthStart(dayKey) {
    const date = dateFromDayKey(dayKey);

    if (!date) {
      return null;
    }

    date.setDate(1);

    return date;
  }

  function getEntriesForMonth(dayKey) {
    const start = getMonthStart(dayKey);

    if (!start) {
      return [];
    }

    const end = new Date(start.getTime());

    end.setMonth(end.getMonth() + 1);

    return state.entries
      .filter((entry) => {
        const day = dateFromDayKey(entry.dayKey);

        return day && day >= start && day < end;
      })
      .sort((first, second) => first.timestamp - second.timestamp)
      .map(clone);
  }

  function getTimeDistribution(entries) {
    const periods = {
      "Early morning": 0,
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      "Late night": 0,
    };

    entries.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();

      if (hour >= 3 && hour < 7) {
        periods["Early morning"]++;
      } else if (hour < 12) {
        periods["Morning"]++;
      } else if (hour < 17) {
        periods["Afternoon"]++;
      } else if (hour < 22) {
        periods["Evening"]++;
      } else {
        periods["Late night"]++;
      }
    });

    return periods;
  }

  /* =====================================================
       22. INSIGHTS
    ====================================================== */

  function getMostUsedDimensions(entries, limit = 3) {
    const counts = {};

    entries.forEach((entry) => {
      Object.keys(entry.dimensions || {}).forEach((dimension) => {
        counts[dimension] = (counts[dimension] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((first, second) => {
        if (second[1] !== first[1]) {
          return second[1] - first[1];
        }

        return first[0].localeCompare(second[0]);
      })
      .slice(0, limit)
      .map(([dimension, count]) => ({
        id: dimension,
        count,
      }));
  }

  function getMostCommonTimePeriod(entries) {
    if (!entries.length) {
      return null;
    }

    const distribution = getTimeDistribution(entries);

    const sorted = Object.entries(distribution).sort(
      (first, second) => second[1] - first[1],
    );

    if (!sorted.length || sorted[0][1] <= 0) {
      return null;
    }

    return {
      label: sorted[0][0],
      count: sorted[0][1],
    };
  }

  function buildMonthlyReflectionSummary(entries) {
    if (!entries.length) {
      return "Your monthly reflection will appear here as more moments are recorded.";
    }

    const activeDays = new Set(entries.map((entry) => entry.dayKey)).size;

    const parts = [
      `You recorded ${entries.length} ${
        entries.length === 1 ? "moment" : "moments"
      } across ${activeDays} ${activeDays === 1 ? "day" : "days"} this month.`,
    ];

    const mostCommonTime = getMostCommonTimePeriod(entries);

    if (entries.length >= 2 && mostCommonTime) {
      parts.push(
        `You most often recorded moments during ${mostCommonTime.label.toLowerCase()}.`,
      );
    }

    const recurringDimensions = getMostUsedDimensions(entries, 3);

    if (recurringDimensions.length) {
      const labels = recurringDimensions.map((item) =>
        formatDimensionName(item.id),
      );

      if (labels.length === 1) {
        parts.push(`The dimension you returned to most was ${labels[0]}.`);
      } else {
        const finalLabel = labels.pop();

        parts.push(
          `Dimensions you returned to often included ${labels.join(", ")} and ${finalLabel}.`,
        );
      }
    }

    parts.push(
      "Use these patterns as prompts for reflection rather than labels or conclusions.",
    );

    return parts.join(" ");
  }

  function renderInsights() {
    const entries = getEntriesForWeek(state.activeDayKey);

    if (dom.weeklyEntryCount) {
      dom.weeklyEntryCount.textContent = String(entries.length);
    }

    if (dom.weeklyOverview) {
      if (!entries.length) {
        dom.weeklyOverview.textContent =
          "Your weekly visualisation will appear here as you add moments.";
      } else {
        const activeDays = new Set(entries.map((entry) => entry.dayKey)).size;

        dom.weeklyOverview.textContent = `${activeDays} ${
          activeDays === 1 ? "day" : "days"
        } with recorded moments this week.`;
      }
    }

    if (dom.timePatternChart) {
      if (entries.length < 2) {
        dom.timePatternChart.textContent = "Not enough entries yet.";
      } else {
        const distribution = getTimeDistribution(entries);

        const highest = Object.entries(distribution).sort(
          (first, second) => second[1] - first[1],
        )[0];

        dom.timePatternChart.textContent = `Most recorded entries: ${highest[0].toLowerCase()}.`;
      }
    }

    if (dom.dimensionSummary) {
      const averages = getDimensionAverages(entries);

      const dimensions = Object.entries(averages);

      if (!dimensions.length) {
        dom.dimensionSummary.textContent = "No reflection slider data yet.";
      } else {
        dom.dimensionSummary.textContent = dimensions
          .map(([id, value]) => `${formatDimensionName(id)}: ${value}`)
          .join("  ·  ");
      }
    }

    const monthlyEntries = getEntriesForMonth(state.activeDayKey);

    if (dom.monthlyEntryCount) {
      dom.monthlyEntryCount.textContent = String(monthlyEntries.length);
    }

    if (dom.monthlyOverview) {
      if (!monthlyEntries.length) {
        dom.monthlyOverview.textContent =
          "Your monthly visualisation will appear here as you add moments.";
      } else {
        const activeDays = new Set(monthlyEntries.map((entry) => entry.dayKey))
          .size;

        const monthDate = getMonthStart(state.activeDayKey);

        const monthName = monthDate
          ? new Intl.DateTimeFormat("en-AU", {
              month: "long",
              year: "numeric",
            }).format(monthDate)
          : "this month";

        dom.monthlyOverview.textContent = `${activeDays} ${
          activeDays === 1 ? "day" : "days"
        } with recorded moments across ${monthName}.`;
      }
    }

    if (dom.monthlyTimePatternChart) {
      if (monthlyEntries.length < 2) {
        dom.monthlyTimePatternChart.textContent = "Not enough entries yet.";
      } else {
        const mostCommonTime = getMostCommonTimePeriod(monthlyEntries);

        dom.monthlyTimePatternChart.textContent = mostCommonTime
          ? `You most often recorded moments during ${mostCommonTime.label.toLowerCase()}.`
          : "No clear reflection rhythm yet.";
      }
    }

    if (dom.monthlyDimensionSummary) {
      const averages = getDimensionAverages(monthlyEntries);

      const dimensions = Object.entries(averages);

      if (!dimensions.length) {
        dom.monthlyDimensionSummary.textContent =
          "No reflection slider data yet.";
      } else {
        dom.monthlyDimensionSummary.textContent = dimensions
          .map(([id, value]) => `${formatDimensionName(id)}: ${value}`)
          .join("  ·  ");
      }
    }

    if (dom.monthlyReflectionSummary) {
      dom.monthlyReflectionSummary.textContent =
        buildMonthlyReflectionSummary(monthlyEntries);
    }
  }

  /* =====================================================
       23. ONBOARDING
    ====================================================== */

  function hasCompletedOnboarding() {
    const value = readStorage(STORAGE_KEYS.onboarding, null);

    return Boolean(value && value.completed === true);
  }

  function completeOnboarding() {
    const value = {
      completed: true,

      completedAt: new Date().toISOString(),
    };

    writeStorage(STORAGE_KEYS.onboarding, value);

    dispatchLegaEvent("onboarding-completed", clone(value));
  }

  function resetOnboarding() {
    localStorage.removeItem(STORAGE_KEYS.onboarding);
  }

  /* =====================================================
       24. SETTINGS
    ====================================================== */

  function normaliseSettings(settings = {}) {
    return {
      theme: VALID_THEMES.includes(settings.theme)
        ? settings.theme
        : DEFAULT_SETTINGS.theme,

      showMoodPatterns:
        typeof settings.showMoodPatterns === "boolean"
          ? settings.showMoodPatterns
          : DEFAULT_SETTINGS.showMoodPatterns,

      textSize: VALID_TEXT_SIZES.includes(settings.textSize)
        ? settings.textSize
        : DEFAULT_SETTINGS.textSize,

      typography: VALID_TYPOGRAPHIES.includes(settings.typography)
        ? settings.typography
        : DEFAULT_SETTINGS.typography,
    };
  }

  function loadSettings() {
    state.settings = normaliseSettings(readStorage(STORAGE_KEYS.settings, {}));

    applyPreferences();

    /*
       Save the normalised shape so older stored settings gain
       newly introduced preferences without losing existing choices.
    */
    writeStorage(STORAGE_KEYS.settings, state.settings);
  }

  function applyPreferences() {
    const root = document.documentElement;

    root.dataset.theme = state.settings.theme;

    root.dataset.textSize = state.settings.textSize;

    root.dataset.typography = state.settings.typography;

    /*
       The original theme system inherits safely from <html>.
       The new accessibility and typography refinements are scoped
       to <body>, so mirror the preferences there as well.
    */
    if (document.body) {
      document.body.dataset.theme = state.settings.theme;

      document.body.dataset.textSize = state.settings.textSize;

      document.body.dataset.typography = state.settings.typography;
    }
  }

  function updateSetting(name, value) {
    if (name === "theme" && !VALID_THEMES.includes(value)) {
      return false;
    }

    if (name === "showMoodPatterns" && typeof value !== "boolean") {
      return false;
    }

    if (name === "textSize" && !VALID_TEXT_SIZES.includes(value)) {
      return false;
    }

    if (name === "typography" && !VALID_TYPOGRAPHIES.includes(value)) {
      return false;
    }

    state.settings[name] = value;

    applyPreferences();

    writeStorage(STORAGE_KEYS.settings, state.settings);

    dispatchLegaEvent("settings-changed", clone(state.settings));

    return true;
  }

  /* =====================================================
       25. DAY SELECTION
    ====================================================== */

  function setActiveDay(dayKey) {
    if (!dateFromDayKey(dayKey)) {
      return false;
    }

    if (dayKey > getLegaDayKey(new Date())) {
      return false;
    }

    state.activeDayKey = dayKey;

    refreshActiveDay();

    dispatchLegaEvent("day-changed", {
      dayKey,
    });

    return true;
  }

  function goToCurrentDay() {
    return setActiveDay(getLegaDayKey(new Date()));
  }

  /* =====================================================
       26. CLOCK UPDATE
    ====================================================== */

  function updateClock() {
    const now = new Date();

    state.currentDate = now;

    const currentKey = getLegaDayKey(now);

    const previousKey = state.currentLegaDayKey;

    state.currentLegaDayKey = currentKey;

    let dayChanged = false;

    if (state.activeDayKey === null) {
      state.activeDayKey = currentKey;

      dayChanged = true;
    } else if (
      previousKey &&
      previousKey !== currentKey &&
      state.activeDayKey === previousKey
    ) {
      state.activeDayKey = currentKey;

      dayChanged = true;
    }

    updateDateDisplay();

    const formatted = formatClockTime(now);

    if (dom.digitalClockTime) {
      dom.digitalClockTime.textContent = formatted.time;
    }

    if (dom.digitalClockPeriod) {
      dom.digitalClockPeriod.textContent = formatted.period;
    }

    if (dom.digitalClock) {
      dom.digitalClock.setAttribute("datetime", now.toISOString());
    }

    const angles = getClockAngles(now);

    dispatchLegaEvent("clock-tick", {
      date: now,

      angle: angles.hourAngle,

      ...angles,

      minutes: getMinutesSinceMidnight(now),

      currentDayKey: currentKey,
    });

    const minuteKey = [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
    ].join("-");

    if (dayChanged || state.lastTimelineRefreshMinute !== minuteKey) {
      state.lastTimelineRefreshMinute = minuteKey;

      refreshActiveDay();
    }
  }

  function startClock() {
    stopClock();

    updateClock();

    state.clockInterval = setInterval(updateClock, CLOCK_TICK_INTERVAL);
  }

  function stopClock() {
    if (state.clockInterval) {
      clearInterval(state.clockInterval);

      state.clockInterval = null;
    }
  }

  /* =====================================================
       27. REFRESH
    ====================================================== */

  function refreshActiveDay() {
    if (!state.activeDayKey) {
      return;
    }

    updateDateDisplay();

    renderEntryList();

    renderDailySummary();

    renderInsights();

    dispatchLegaEvent("timeline-changed", {
      dayKey: state.activeDayKey,

      entries: getActiveDayEntries(),

      segments: buildMoodTimeline(state.activeDayKey),
    });
  }

  /* =====================================================
       28. EVENTS
    ====================================================== */

  function dispatchLegaEvent(eventName, detail = {}) {
    window.dispatchEvent(
      new CustomEvent(`lega:${eventName}`, {
        detail,
      }),
    );
  }

  /* =====================================================
       29. DEVELOPMENT
    ====================================================== */

  function clearAllEntries() {
    state.entries = [];

    saveEntries();

    refreshActiveDay();

    dispatchLegaEvent("entries-cleared");
  }

  function createDemoEntries() {
    const base = dateFromDayKey(state.activeDayKey);

    if (!base) {
      return;
    }

    const demos = [
      {
        hour: 9,
        minute: 15,
        colour: "#a9cadb",
        emoji: "🌤️",
        title: "Slow start",
        dimensions: {
          "physical-energy": 35,
          "mental-clarity": 51,
        },
      },

      {
        hour: 12,
        minute: 0,
        colour: "#e7d27f",
        emoji: "☀️",
        title: "Meeting new friends",
        dimensions: {
          intensity: 70,
          "social-energy": 76,
          connectedness: 68,
        },
      },

      {
        hour: 14,
        minute: 0,
        colour: "#abcba9",
        emoji: "🌿",
        title: "Starting to feel tired",
        dimensions: {
          heaviness: 54,
          "physical-energy": 31,
          "need-for-space": 63,
        },
      },
    ];

    demos.forEach((demo) => {
      const date = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        demo.hour,
        demo.minute,
        0,
        0,
      );

      if (isCurrentLegaDay(state.activeDayKey) && date.getTime() > Date.now()) {
        return;
      }

      createEntry({
        timestamp: date.getTime(),

        colour: demo.colour,

        emoji: demo.emoji,

        title: demo.title,

        dimensions: demo.dimensions,
      });
    });
  }

  /* =====================================================
       30. PUBLIC API
    ====================================================== */

  window.LegaApp = {
    getState() {
      return {
        entries: clone(state.entries),

        settings: clone(state.settings),

        activeDayKey: state.activeDayKey,

        currentLegaDayKey: state.currentLegaDayKey,

        currentDate: new Date(state.currentDate),
      };
    },

    getLegaDayKey,

    getLegaDayStart,

    getLegaDayEnd,

    getActiveDayKey() {
      return state.activeDayKey;
    },

    setActiveDay,

    goToCurrentDay,

    isCurrentLegaDay,

    formatEntryTime,

    get24HourClockAngle,

    getMinuteHandAngle,

    getSecondHandAngle,

    getClockAngles,

    minutesToDegrees,

    createEntry,

    updateEntry,

    deleteEntry,

    getEntry,

    getAllEntries,

    getEntriesForDay,

    getActiveDayEntries,

    clearAllEntries,

    buildMoodTimeline,

    getTimelineRecordedMinutes,

    formatDurationMinutes,

    getDimensionsUsed,

    getDimensionAverages,

    getEntriesForWeek,

    getMonthStart,

    getEntriesForMonth,

    getTimeDistribution,

    getMostUsedDimensions,

    getMostCommonTimePeriod,

    buildMonthlyReflectionSummary,

    formatDimensionName,

    normaliseColour,

    hasCompletedOnboarding,

    completeOnboarding,

    resetOnboarding,

    getSettings() {
      return clone(state.settings);
    },

    updateSetting,

    refresh: refreshActiveDay,

    createDemoEntries,
  };

  /* =====================================================
       31. INITIALISE
    ====================================================== */

  function initialise() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    cacheDOM();

    loadSettings();

    loadEntries();

    state.currentLegaDayKey = getLegaDayKey(new Date());

    state.activeDayKey = state.currentLegaDayKey;

    refreshActiveDay();

    startClock();

    document.documentElement.dataset.legaReady = "true";

    dispatchLegaEvent("ready", {
      activeDayKey: state.activeDayKey,

      firstVisit: !hasCompletedOnboarding(),

      settings: clone(state.settings),

      clockAngles: getClockAngles(new Date()),
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, {
      once: true,
    });
  } else {
    initialise();
  }
})();
