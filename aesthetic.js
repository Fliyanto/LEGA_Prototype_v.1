/* =========================================================
   LEGA — AESTHETIC.JS
   Prototype 1 — Visual Behaviour
========================================================= */

(() => {
  "use strict";

  /* =====================================================
       1. STATE
    ====================================================== */

  const state = {
    initialized: false,

    selectedEntryID: null,

    latestTimeline: {
      entries: [],
      segments: [],
    },

    patternsEnabled: true,

    loadingFinished: false,
  };

  /* =====================================================
       2. DOM
    ====================================================== */

  const dom = {};

  function cacheDOM() {
    dom.loadingScreen = document.getElementById("loadingScreen");

    dom.loadingMark = document.querySelector(".loading-mark");

    dom.loadingRing = document.querySelector(".loading-mark__ring");

    dom.loadingDot = document.querySelector(".loading-mark__dot");

    dom.loadingLogo = document.querySelector(".loading-screen__logo");

    dom.loadingMessage = document.querySelector(".loading-screen__message");

    dom.clockHand = document.getElementById("clockHand");

    dom.minuteHand = document.getElementById("minuteHand");

    dom.secondHand = document.getElementById("secondHand");

    dom.radialClock = document.getElementById("radialClock");

    dom.moodRing = document.getElementById("moodRing");

    dom.moodMarkers = document.getElementById("moodMarkers");
  }

  /* =====================================================
       3. HELPERS
    ====================================================== */

  function getLegaAPI() {
    return window.LegaApp || null;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function degreesToRadians(degrees) {
    return (degrees - 90) * (Math.PI / 180);
  }

  function polarPosition(degree, radius, centre) {
    const radians = degreesToRadians(degree);

    return {
      x: centre + Math.cos(radians) * radius,

      y: centre + Math.sin(radians) * radius,
    };
  }

  /* =====================================================
       4. LOADING
    ====================================================== */

  function runLoadingSequence() {
    if (!dom.loadingScreen || state.loadingFinished) {
      return;
    }

    if (prefersReducedMotion()) {
      window.setTimeout(finishLoading, 300);

      return;
    }

    dom.loadingRing?.animate(
      [
        {
          transform: "rotate(0deg) scale(0.94)",

          opacity: 0.45,
        },

        {
          transform: "rotate(180deg) scale(1.04)",

          opacity: 1,
        },

        {
          transform: "rotate(360deg) scale(0.94)",

          opacity: 0.45,
        },
      ],
      {
        duration: 1650,

        iterations: Infinity,

        easing: "ease-in-out",
      },
    );

    dom.loadingDot?.animate(
      [
        {
          transform: "scale(0.8)",

          opacity: 0.55,
        },

        {
          transform: "scale(1.15)",

          opacity: 1,
        },

        {
          transform: "scale(0.8)",

          opacity: 0.55,
        },
      ],
      {
        duration: 1050,

        iterations: Infinity,

        easing: "ease-in-out",
      },
    );

    dom.loadingLogo?.animate(
      [
        {
          opacity: 0,
          transform: "translateY(8px)",
        },

        {
          opacity: 1,
          transform: "translateY(0)",
        },
      ],
      {
        duration: 600,

        fill: "both",

        easing: "ease-out",
      },
    );

    dom.loadingMessage?.animate(
      [
        {
          opacity: 0,
        },

        {
          opacity: 1,
        },
      ],
      {
        delay: 180,

        duration: 700,

        fill: "both",

        easing: "ease-out",
      },
    );

    window.setTimeout(finishLoading, 1050);
  }

  function finishLoading() {
    if (state.loadingFinished) {
      return;
    }

    state.loadingFinished = true;

    const complete = () => {
      if (dom.loadingScreen) {
        dom.loadingScreen.hidden = true;

        dom.loadingScreen.setAttribute("aria-hidden", "true");
      }

      document.documentElement.dataset.legaLoadingComplete = "true";

      window.dispatchEvent(new CustomEvent("lega:loading-complete"));
    };

    if (prefersReducedMotion() || !dom.loadingScreen) {
      complete();

      return;
    }

    const animation = dom.loadingScreen.animate(
      [
        {
          opacity: 1,
        },

        {
          opacity: 0,
        },
      ],
      {
        duration: 380,

        easing: "ease",

        fill: "forwards",
      },
    );

    animation.onfinish = complete;
  }

  /* =====================================================
       5. CLOCK HANDS
    ====================================================== */

  function updateClockHands(detail) {
    if (!detail) {
      return;
    }

    if (dom.clockHand && typeof detail.hourAngle === "number") {
      dom.clockHand.style.transform = `rotate(${detail.hourAngle}deg)`;
    }

    if (dom.minuteHand && typeof detail.minuteAngle === "number") {
      dom.minuteHand.style.transform = `rotate(${detail.minuteAngle}deg)`;
    }

    if (dom.secondHand && typeof detail.secondAngle === "number") {
      dom.secondHand.style.transform = `rotate(${detail.secondAngle}deg)`;
    }
  }

  function syncClockImmediately() {
    const lega = getLegaAPI();

    if (!lega) {
      return;
    }

    updateClockHands(lega.getClockAngles(new Date()));
  }

  /* =====================================================
       6. TIMELINE RANGES
    ====================================================== */

  function expandTimelineRanges(segments) {
    const ranges = [];

    segments.forEach((segment) => {
      if (!segment.colour) {
        return;
      }

      const start = clamp(segment.startDegree, 0, 360);

      const end = clamp(segment.endDegree, 0, 360);

      if (segment.crossesMidnight) {
        ranges.push({
          ...segment,
          rangeStart: start,

          rangeEnd: 360,
        });

        if (end > 0) {
          ranges.push({
            ...segment,
            rangeStart: 0,

            rangeEnd: end,
          });
        }
      } else if (end > start) {
        ranges.push({
          ...segment,
          rangeStart: start,

          rangeEnd: end,
        });
      }
    });

    return ranges.sort((first, second) => first.rangeStart - second.rangeStart);
  }

  /* =====================================================
       7. CONIC MOOD RING
    ====================================================== */

  function renderMoodColours(segments) {
    if (!dom.moodRing) {
      return;
    }

    const ranges = expandTimelineRanges(segments);

    if (!ranges.length) {
      dom.moodRing.style.background = "var(--background-card-solid)";

      return;
    }

    const stops = [];

    let cursor = 0;

    ranges.forEach((range) => {
      if (range.rangeStart > cursor) {
        stops.push(`transparent ${cursor}deg ${range.rangeStart}deg`);
      }

      stops.push(`${range.colour} ${range.rangeStart}deg ${range.rangeEnd}deg`);

      cursor = Math.max(cursor, range.rangeEnd);
    });

    if (cursor < 360) {
      stops.push(`transparent ${cursor}deg 360deg`);
    }

    dom.moodRing.style.background = `
                conic-gradient(
                    from 0deg,
                    ${stops.join(",")}
                ),
                var(--background-card-solid)
            `;
  }

  /* =====================================================
       8. MARKER POSITION
    ====================================================== */

  function calculateClockGeometry() {
    if (!dom.radialClock) {
      return null;
    }

    const size = dom.radialClock.getBoundingClientRect().width;

    return {
      size,

      centre: size / 2,

      markerRadius: size * 0.455,

      patternRadius: size * 0.455,
    };
  }

  /* =====================================================
       9. ENTRY MARKERS
    ====================================================== */

  function renderMoodMarkers(entries) {
    if (!dom.moodMarkers) {
      return;
    }

    dom.moodMarkers.replaceChildren();

    const geometry = calculateClockGeometry();

    if (!geometry) {
      return;
    }

    entries.forEach((entry) => {
      const date = new Date(entry.timestamp);

      const angle = getLegaAPI()?.get24HourClockAngle(date);

      if (typeof angle !== "number") {
        return;
      }

      const position = polarPosition(
        angle,
        geometry.markerRadius,
        geometry.centre,
      );

      const marker = document.createElement("span");

      marker.className = "mood-marker";

      marker.dataset.entryId = entry.id;

      marker.style.left = `${position.x}px`;

      marker.style.top = `${position.y}px`;

      marker.style.setProperty(
        "--marker-colour",
        entry.colour || "var(--accent-primary)",
      );

      marker.textContent = entry.emoji || "•";

      if (entry.id === state.selectedEntryID) {
        marker.classList.add("mood-marker--selected");
      }

      dom.moodMarkers.append(marker);
    });
  }

  /* =====================================================
       10. TIMELINE PATTERNS
    ====================================================== */

  function clearMoodPatterns() {
    dom.radialClock
      ?.querySelectorAll(".mood-pattern-icon")
      .forEach((icon) => icon.remove());
  }

  function renderMoodPatterns(segments) {
    clearMoodPatterns();

    if (!state.patternsEnabled || !dom.radialClock) {
      return;
    }

    const geometry = calculateClockGeometry();

    if (!geometry) {
      return;
    }

    segments.forEach((segment) => {
      const totalDegrees = segment.crossesMidnight
        ? 360 - segment.startDegree + segment.endDegree
        : segment.endDegree - segment.startDegree;

      if (totalDegrees <= 3) {
        return;
      }

      const iconCount = clamp(Math.floor(totalDegrees / 16), 1, 12);

      for (let index = 0; index < iconCount; index++) {
        const progress = (index + 0.5) / iconCount;

        const rawAngle = segment.startDegree + totalDegrees * progress;

        const angle = rawAngle % 360;

        const position = polarPosition(
          angle,
          geometry.patternRadius,
          geometry.centre,
        );

        const icon = document.createElement("span");

        icon.className = "mood-pattern-icon";

        icon.dataset.entryId = segment.entryID;

        icon.style.left = `${position.x}px`;

        icon.style.top = `${position.y}px`;

        icon.textContent = segment.emoji || "•";

        if (segment.entryID === state.selectedEntryID) {
          icon.classList.add("mood-pattern-icon--selected");
        }

        dom.radialClock.append(icon);
      }
    });
  }

  /* =====================================================
       11. FULL TIMELINE RENDER
    ====================================================== */

  function renderTimeline(timeline) {
    state.latestTimeline = {
      entries: timeline?.entries || [],

      segments: timeline?.segments || [],
    };

    renderMoodColours(state.latestTimeline.segments);

    renderMoodMarkers(state.latestTimeline.entries);

    renderMoodPatterns(state.latestTimeline.segments);
  }

  function refreshTimelineGeometry() {
    renderMoodMarkers(state.latestTimeline.entries);

    renderMoodPatterns(state.latestTimeline.segments);
  }

  /* =====================================================
       12. ENTRY SELECTION
    ====================================================== */

  function handleEntrySelected(event) {
    state.selectedEntryID = event.detail?.entryID || null;

    refreshTimelineGeometry();
  }

  /* =====================================================
       13. PATTERN SETTINGS
    ====================================================== */

  function syncPatternSetting() {
    const settings = getLegaAPI()?.getSettings();

    state.patternsEnabled = settings?.showMoodPatterns !== false;

    renderMoodPatterns(state.latestTimeline.segments);
  }

  function handleSettingsChanged() {
    syncPatternSetting();

    /*
         Text-size and typography changes can slightly alter
         the clock's rendered geometry at some responsive sizes.
         Reposition markers once the browser has applied the new
         styles, without changing the timeline data itself.
    */

    window.requestAnimationFrame(refreshTimelineGeometry);
  }

  /* =====================================================
       14. PAGE TRANSITIONS
    ====================================================== */

  function animateActivePage(event) {
    if (prefersReducedMotion()) {
      return;
    }

    const pageID = event.detail?.pageID;

    const page = document.getElementById(pageID);

    if (!page) {
      return;
    }

    page.animate(
      [
        {
          opacity: 0,
          transform: "translateY(7px)",
        },

        {
          opacity: 1,
          transform: "translateY(0)",
        },
      ],
      {
        duration: 260,

        easing: "ease-out",
      },
    );
  }

  /* =====================================================
       15. INITIAL TIMELINE
    ====================================================== */

  function syncInitialState() {
    const lega = getLegaAPI();

    if (!lega) {
      return;
    }

    const appState = lega.getState();

    state.patternsEnabled = appState.settings?.showMoodPatterns !== false;

    const dayKey = appState.activeDayKey;

    renderTimeline({
      entries: lega.getEntriesForDay(dayKey),

      segments: lega.buildMoodTimeline(dayKey),
    });

    syncClockImmediately();
  }

  /* =====================================================
       16. EVENTS
    ====================================================== */

  function bindEvents() {
    window.addEventListener("lega:clock-tick", (event) =>
      updateClockHands(event.detail),
    );

    window.addEventListener("lega:timeline-changed", (event) =>
      renderTimeline(event.detail),
    );

    window.addEventListener("lega:entry-selected", handleEntrySelected);

    window.addEventListener("lega:settings-changed", handleSettingsChanged);

    window.addEventListener("lega:mood-pattern-setting-changed", (event) => {
      state.patternsEnabled = event.detail?.enabled !== false;

      renderMoodPatterns(state.latestTimeline.segments);
    });

    window.addEventListener("lega:page-changed", animateActivePage);

    window.addEventListener("resize", refreshTimelineGeometry);
  }

  /* =====================================================
       17. INITIALISE
    ====================================================== */

  function initialiseAesthetics() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    cacheDOM();

    bindEvents();

    syncInitialState();

    runLoadingSequence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseAesthetics, {
      once: true,
    });
  } else {
    initialiseAesthetics();
  }
})();
