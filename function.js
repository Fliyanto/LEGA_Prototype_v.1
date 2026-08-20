/* =========================================================
   LEGA — FUNCTION.JS
   Prototype 1 — Flexible Entry System

   Responsibilities:
   - Onboarding
   - Navigation
   - Modal behaviour
   - Entry starting menu
   - Lega templates
   - Personal templates
   - Template builder
   - Slider library
   - Slider explanations
   - Dynamic entry sliders
   - Emoji picker
   - Custom colour picker
   - Entry submission
   - Date selection
   - Settings
========================================================= */

(() => {
  "use strict";

  /* =====================================================
       1. STORAGE
    ====================================================== */

  const STORAGE_KEYS = {
    personalTemplates: "lega.personalTemplates.v1",

    recentEmojis: "lega.recentEmojis.v1",

    entryExtras: "lega.entryExtras.v1",
  };

  /* =====================================================
       2. LEGA TEMPLATE DEFINITIONS
    ====================================================== */

  const LEGA_TEMPLATES = {
    general: {
      id: "general",
      name: "General reflection",
      sliderIds: ["intensity", "physical-energy", "tension", "mental-load"],
    },

    "busy-day": {
      id: "busy-day",
      name: "Busy day",
      sliderIds: ["overwhelm", "mental-load", "physical-energy", "tension"],
    },

    "study-work": {
      id: "study-work",
      name: "Study or work",
      sliderIds: ["focus", "mental-clarity", "motivation", "effort"],
    },

    social: {
      id: "social",
      name: "Social moment",
      sliderIds: [
        "social-energy",
        "connectedness",
        "social-comfort",
        "need-for-space",
      ],
    },

    "before-sleep": {
      id: "before-sleep",
      name: "Before sleep",
      sliderIds: ["sleepiness", "restlessness", "tension", "thought-speed"],
    },

    "after-activity": {
      id: "after-activity",
      name: "After an activity",
      sliderIds: [
        "physical-energy",
        "tiredness",
        "physical-comfort",
        "intensity",
      ],
    },
  };

  /* =====================================================
       3. EMOJI LIBRARY
       -----------------------------------------------------
       Prototype library.

       Later we can replace this with a complete Unicode
       emoji dataset without changing the picker UI.
    ====================================================== */

  const EMOJI_LIBRARY = {
    faces: [
      ["😀", "grinning face"],
      ["😃", "happy face"],
      ["😄", "smiling face"],
      ["😁", "beaming face"],
      ["🙂", "slight smile"],
      ["😊", "warm smile"],
      ["☺️", "smiling face"],
      ["😌", "relieved"],
      ["🥰", "affection"],
      ["😍", "heart eyes"],
      ["🤩", "star struck"],
      ["🥳", "celebrating"],
      ["😎", "cool"],
      ["🤗", "hugging"],
      ["🤭", "shy laugh"],
      ["🤔", "thinking"],
      ["🫠", "melting"],
      ["😶", "quiet"],
      ["😐", "neutral"],
      ["😑", "expressionless"],
      ["🙃", "upside down"],
      ["😕", "confused"],
      ["🫤", "uncertain"],
      ["😟", "worried"],
      ["😔", "downcast"],
      ["😞", "disappointed"],
      ["😢", "crying"],
      ["😭", "crying heavily"],
      ["🥺", "pleading"],
      ["😩", "weary"],
      ["😫", "tired"],
      ["🥱", "yawning"],
      ["😴", "sleeping"],
      ["😤", "frustrated"],
      ["😠", "angry"],
      ["😡", "very angry"],
      ["🤯", "mind blown"],
      ["😵‍💫", "dizzy"],
      ["😬", "awkward"],
      ["😮", "surprised"],
      ["😲", "shocked"],
      ["😳", "flushed"],
      ["🥴", "woozy"],
    ],

    people: [
      ["👋", "wave"],
      ["🙌", "raised hands"],
      ["👏", "clapping"],
      ["🤝", "handshake"],
      ["🤲", "open hands"],
      ["🙏", "thankful"],
      ["💪", "strength"],
      ["🫶", "heart hands"],
      ["🤞", "fingers crossed"],
      ["✌️", "peace"],
      ["👌", "okay"],
      ["👍", "thumbs up"],
      ["👎", "thumbs down"],
      ["🧠", "brain"],
      ["👀", "eyes"],
      ["🫂", "hug"],
      ["🧘", "meditation"],
      ["🛌", "resting"],
      ["🚶", "walking"],
      ["🏃", "running"],
      ["💃", "dancing"],
      ["🕺", "dancing"],
      ["👥", "people together"],
    ],

    nature: [
      ["☀️", "sun"],
      ["🌤️", "partly cloudy"],
      ["⛅", "cloud"],
      ["☁️", "cloudy"],
      ["🌧️", "rain"],
      ["⛈️", "storm"],
      ["🌈", "rainbow"],
      ["🌙", "moon"],
      ["🌕", "full moon"],
      ["⭐", "star"],
      ["✨", "sparkles"],
      ["⚡", "lightning"],
      ["🔥", "fire"],
      ["💧", "water drop"],
      ["🌊", "wave"],
      ["🌱", "sprout"],
      ["🌿", "leaf"],
      ["🍃", "leaves"],
      ["🍂", "fallen leaf"],
      ["🌻", "sunflower"],
      ["🌸", "flower"],
      ["🌼", "flower"],
      ["🌹", "rose"],
      ["🌵", "cactus"],
      ["🌲", "tree"],
      ["🌳", "tree"],
      ["🍄", "mushroom"],
      ["🪨", "rock"],
      ["🏔️", "mountain"],
      ["🌅", "sunrise"],
      ["🌄", "morning"],
      ["🌇", "sunset"],
    ],

    food: [
      ["☕", "coffee"],
      ["🍵", "tea"],
      ["🧋", "bubble tea"],
      ["🥤", "drink"],
      ["💧", "water"],
      ["🍚", "rice"],
      ["🍜", "noodles"],
      ["🍲", "soup"],
      ["🍛", "curry"],
      ["🍱", "bento"],
      ["🥗", "salad"],
      ["🍳", "egg"],
      ["🥚", "egg"],
      ["🍞", "bread"],
      ["🥐", "croissant"],
      ["🍕", "pizza"],
      ["🍔", "burger"],
      ["🍟", "fries"],
      ["🍗", "chicken"],
      ["🥩", "steak"],
      ["🍎", "apple"],
      ["🍓", "strawberry"],
      ["🍊", "orange"],
      ["🍌", "banana"],
      ["🍉", "watermelon"],
      ["🍰", "cake"],
      ["🍫", "chocolate"],
      ["🍪", "cookie"],
      ["🍦", "ice cream"],
    ],

    activities: [
      ["🎧", "headphones"],
      ["🎵", "music"],
      ["🎶", "music"],
      ["🎤", "singing"],
      ["🎸", "guitar"],
      ["🎹", "piano"],
      ["🎮", "gaming"],
      ["🕹️", "gaming"],
      ["🎬", "movie"],
      ["📺", "television"],
      ["📚", "reading"],
      ["✏️", "writing"],
      ["🎨", "art"],
      ["📸", "photography"],
      ["🏋️", "gym"],
      ["🏃", "running"],
      ["🚴", "cycling"],
      ["🏊", "swimming"],
      ["🏀", "basketball"],
      ["🏐", "volleyball"],
      ["🎾", "tennis"],
      ["⚽", "football"],
      ["⛳", "golf"],
      ["🧘", "meditation"],
      ["🛍️", "shopping"],
      ["✈️", "travel"],
      ["🚗", "driving"],
      ["🚆", "train"],
      ["🏠", "home"],
      ["🏢", "work"],
    ],

    objects: [
      ["💡", "idea"],
      ["📱", "phone"],
      ["💻", "computer"],
      ["⌚", "watch"],
      ["⏰", "alarm"],
      ["🕯️", "candle"],
      ["🔑", "key"],
      ["🪞", "mirror"],
      ["🛏️", "bed"],
      ["🛋️", "sofa"],
      ["🚿", "shower"],
      ["🛁", "bath"],
      ["🎁", "gift"],
      ["📦", "box"],
      ["📝", "note"],
      ["📖", "book"],
      ["📌", "pin"],
      ["✂️", "scissors"],
      ["🧸", "teddy bear"],
      ["💊", "medicine"],
      ["🩹", "bandage"],
      ["🧳", "luggage"],
    ],

    symbols: [
      ["❤️", "red heart"],
      ["🩷", "pink heart"],
      ["🧡", "orange heart"],
      ["💛", "yellow heart"],
      ["💚", "green heart"],
      ["💙", "blue heart"],
      ["💜", "purple heart"],
      ["🤍", "white heart"],
      ["🩶", "grey heart"],
      ["🖤", "black heart"],
      ["💔", "broken heart"],
      ["💭", "thought"],
      ["💬", "speech"],
      ["❓", "question"],
      ["❗", "exclamation"],
      ["✅", "check"],
      ["❌", "cross"],
      ["⭕", "circle"],
      ["🔴", "red circle"],
      ["🟠", "orange circle"],
      ["🟡", "yellow circle"],
      ["🟢", "green circle"],
      ["🔵", "blue circle"],
      ["🟣", "purple circle"],
      ["⚪", "white circle"],
      ["⚫", "black circle"],
      ["⬆️", "up"],
      ["⬇️", "down"],
      ["↔️", "sideways"],
      ["♾️", "infinity"],
      ["💤", "sleep"],
      ["💯", "hundred"],
      ["🌟", "glowing star"],
    ],
  };

  /* =====================================================
       4. INTERACTION STATE
    ====================================================== */

  const state = {
    initialized: false,

    coreReady: false,

    loadingComplete: false,

    firstVisit: false,

    selectedEntryID: null,

    activeEmojiCategory: "recent",

    recentEmojis: [],

    personalTemplates: [],

    editingTemplateID: null,

    sliderSelectionContext: "entry",

    entryDraft: {
      templateId: null,
      templateName: null,
      sliderIds: [],
      sliderValues: {},
      sliderTouched: {},
      emoji: "",
      colour: null,
    },

    templateDraft: {
      sliderIds: [],
    },
  };

  const openModals = new Set();

  const previousFocus = new WeakMap();

  /* =====================================================
       5. DOM REFERENCES
    ====================================================== */

  const dom = {};

  function cacheDOM() {
    /* ---------- Loading ---------- */

    dom.loadingScreen = document.getElementById("loadingScreen");

    /* ---------- Onboarding ---------- */

    dom.onboardingModal = document.getElementById("onboardingModal");

    dom.onboardingWelcome = document.getElementById("onboardingWelcome");

    dom.onboardingWarning = document.getElementById("onboardingWarning");

    dom.continueToWarningButton = document.getElementById(
      "continueToWarningButton",
    );

    dom.backToWelcomeButton = document.getElementById("backToWelcomeButton");

    dom.onboardingAcknowledgement = document.getElementById(
      "onboardingAcknowledgement",
    );

    dom.enterLegaButton = document.getElementById("enterLegaButton");

    /* ---------- Navigation ---------- */

    dom.pageControls = document.querySelectorAll("[data-page-target]");

    dom.pages = document.querySelectorAll(".app-page");

    dom.navItems = document.querySelectorAll(".nav-item[data-page-target]");

    /* ---------- Main utility ---------- */

    dom.helpButton = document.getElementById("helpButton");

    dom.settingsButton = document.getElementById("settingsButton");

    dom.navigationSettingsButton = document.getElementById(
      "navigationSettingsButton",
    );

    /* ---------- Help ---------- */

    dom.helpModal = document.getElementById("helpModal");

    dom.closeHelpModalButton = document.getElementById("closeHelpModalButton");

    dom.helpBackdrop = document.querySelector("[data-close-help-modal]");

    /* ---------- Settings ---------- */

    dom.settingsModal = document.getElementById("settingsModal");

    dom.closeSettingsModalButton = document.getElementById(
      "closeSettingsModalButton",
    );

    dom.settingsBackdrop = document.querySelector(
      "[data-close-settings-modal]",
    );

    dom.themeButtons = document.querySelectorAll(".theme-option[data-theme]");

    dom.textSizeButtons = document.querySelectorAll(
      ".text-size-option[data-text-size]",
    );

    dom.showMoodPatternsSetting = document.getElementById(
      "showMoodPatternsSetting",
    );

    /* ---------- Main add button ---------- */

    dom.addEntryButton = document.getElementById("addEntryButton");

    /* ---------- Entry start ---------- */

    dom.entryStartModal = document.getElementById("entryStartModal");

    dom.closeEntryStartButton = document.getElementById(
      "closeEntryStartButton",
    );

    dom.entryStartBackdrop = document.querySelector("[data-close-entry-start]");

    dom.chooseLegaTemplateButton = document.getElementById(
      "chooseLegaTemplateButton",
    );

    dom.choosePersonalTemplateButton = document.getElementById(
      "choosePersonalTemplateButton",
    );

    dom.startBlankEntryButton = document.getElementById(
      "startBlankEntryButton",
    );

    /* ---------- Lega templates ---------- */

    dom.templateLibraryModal = document.getElementById("templateLibraryModal");

    dom.closeTemplateLibraryButton = document.getElementById(
      "closeTemplateLibraryButton",
    );

    dom.templateLibraryBackdrop = document.querySelector(
      "[data-close-template-library]",
    );

    dom.backFromTemplateLibraryButton = document.getElementById(
      "backFromTemplateLibraryButton",
    );

    dom.legaTemplateGrid = document.getElementById("legaTemplateGrid");

    /* ---------- Personal templates ---------- */

    dom.personalTemplatesModal = document.getElementById(
      "personalTemplatesModal",
    );

    dom.closePersonalTemplatesButton = document.getElementById(
      "closePersonalTemplatesButton",
    );

    dom.personalTemplatesBackdrop = document.querySelector(
      "[data-close-personal-templates]",
    );

    dom.backFromPersonalTemplatesButton = document.getElementById(
      "backFromPersonalTemplatesButton",
    );

    dom.createTemplateButton = document.getElementById("createTemplateButton");

    dom.personalTemplateList = document.getElementById("personalTemplateList");

    /* ---------- Template builder ---------- */

    dom.templateBuilderModal = document.getElementById("templateBuilderModal");

    dom.closeTemplateBuilderButton = document.getElementById(
      "closeTemplateBuilderButton",
    );

    dom.templateBuilderBackdrop = document.querySelector(
      "[data-close-template-builder]",
    );

    dom.templateBuilderForm = document.getElementById("templateBuilderForm");

    dom.templateName = document.getElementById("templateName");

    dom.templateDescription = document.getElementById("templateDescription");

    dom.chooseTemplateSlidersButton = document.getElementById(
      "chooseTemplateSlidersButton",
    );

    dom.templateSelectedSliders = document.getElementById(
      "templateSelectedSliders",
    );

    dom.cancelTemplateBuilderButton = document.getElementById(
      "cancelTemplateBuilderButton",
    );

    /* ---------- Entry editor ---------- */

    dom.entryModal = document.getElementById("entryModal");

    dom.entryBackdrop = document.querySelector("[data-close-entry-modal]");

    dom.closeEntryModalButton = document.getElementById(
      "closeEntryModalButton",
    );

    dom.cancelEntryButton = document.getElementById("cancelEntryButton");

    dom.entryForm = document.getElementById("entryForm");

    dom.entryTitle = document.getElementById("entryTitle");

    dom.entryNote = document.getElementById("entryNote");

    dom.entryTemplateIndicator = document.getElementById(
      "entryTemplateIndicator",
    );

    dom.entryTemplateName = document.getElementById("entryTemplateName");

    /* ---------- Entry timing ---------- */

    dom.entryDate = document.getElementById("entryDate");

    dom.entryTime = document.getElementById("entryTime");

    dom.customTimeFields = document.getElementById("customTimeFields");

    dom.timeModeRadios = document.querySelectorAll(
      'input[name="entryTimeMode"]',
    );

    /* ---------- Entry visual ---------- */

    dom.openEmojiPickerButton = document.getElementById(
      "openEmojiPickerButton",
    );

    dom.selectedEmojiPreview = document.getElementById("selectedEmojiPreview");

    dom.selectedEmoji = document.getElementById("selectedEmoji");

    dom.customColourPicker = document.getElementById("customColourPicker");

    dom.customColourPreview = document.getElementById("customColourPreview");

    dom.selectedColour = document.getElementById("selectedColour");

    /* ---------- Selected sliders ---------- */

    dom.chooseEntrySlidersButton = document.getElementById(
      "chooseEntrySlidersButton",
    );

    dom.selectedSliderCount = document.getElementById("selectedSliderCount");

    dom.selectedEntrySliders = document.getElementById("selectedEntrySliders");

    /* ---------- Emoji picker ---------- */

    dom.emojiPickerModal = document.getElementById("emojiPickerModal");

    dom.closeEmojiPickerButton = document.getElementById(
      "closeEmojiPickerButton",
    );

    dom.emojiPickerBackdrop = document.querySelector(
      "[data-close-emoji-picker]",
    );

    dom.emojiSearch = document.getElementById("emojiSearch");

    dom.emojiCategoryTabs = document.querySelectorAll(".emoji-category-tab");

    dom.emojiPickerGrid = document.getElementById("emojiPickerGrid");

    /* ---------- Slider library ---------- */

    dom.sliderLibraryModal = document.getElementById("sliderLibraryModal");

    dom.closeSliderLibraryButton = document.getElementById(
      "closeSliderLibraryButton",
    );

    dom.sliderLibraryBackdrop = document.querySelector(
      "[data-close-slider-library]",
    );

    dom.sliderSearch = document.getElementById("sliderSearch");

    dom.sliderLibrary = document.getElementById("sliderLibrary");

    dom.sliderCategories = document.querySelectorAll(".slider-category");

    dom.sliderOptions = document.querySelectorAll(".slider-option");

    dom.sliderLibrarySelectionCount = document.getElementById(
      "sliderLibrarySelectionCount",
    );

    dom.cancelSliderSelectionButton = document.getElementById(
      "cancelSliderSelectionButton",
    );

    dom.confirmSliderSelectionButton = document.getElementById(
      "confirmSliderSelectionButton",
    );

    /* ---------- Slider information ---------- */

    dom.sliderInfoModal = document.getElementById("sliderInfoModal");

    dom.sliderInfoBackdrop = document.querySelector("[data-close-slider-info]");

    dom.closeSliderInfoButton = document.getElementById(
      "closeSliderInfoButton",
    );

    dom.sliderInfoTitle = document.getElementById("sliderInfoTitle");

    dom.sliderInfoIcon = document.getElementById("sliderInfoIcon");

    dom.sliderInfoDescription = document.getElementById(
      "sliderInfoDescription",
    );

    /* ---------- Date ---------- */

    dom.dateDisplayButton = document.getElementById("dateDisplayButton");

    /* ---------- Today's entry list ---------- */

    dom.todayEntryList = document.getElementById("todayEntryList");
  }

  /* =====================================================
       6. GENERAL HELPERS
    ====================================================== */

  function getLegaAPI() {
    return window.LegaApp || null;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createID(prefix = "item") {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return (
      `${prefix}-` +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      return value === null ? fallback : JSON.parse(value);
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
       7. MODALS
    ====================================================== */

  function openModal(modal, focusTarget = null) {
    if (!modal) {
      return;
    }

    previousFocus.set(modal, document.activeElement);

    modal.hidden = false;

    modal.setAttribute("aria-hidden", "false");

    openModals.add(modal);

    updateScrollLock();

    requestAnimationFrame(() => {
      if (focusTarget) {
        focusTarget.focus();
        return;
      }

      const focusable = getFocusableElements(modal);

      focusable[0]?.focus();
    });
  }

  function closeModal(modal, restoreFocus = true) {
    if (!modal) {
      return;
    }

    modal.hidden = true;

    modal.setAttribute("aria-hidden", "true");

    openModals.delete(modal);

    updateScrollLock();

    if (!restoreFocus) {
      return;
    }

    const previous = previousFocus.get(modal);

    previous?.focus?.();
  }

  function switchModal(fromModal, toModal, focusTarget = null) {
    closeModal(fromModal, false);

    openModal(toModal, focusTarget);
  }

  function updateScrollLock() {
    document.body.style.overflow = openModals.size > 0 ? "hidden" : "";
  }

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        [
          "button:not([disabled])",
          "a[href]",
          "input:not([disabled])",
          "textarea:not([disabled])",
          "select:not([disabled])",
          '[tabindex]:not([tabindex="-1"])',
        ].join(","),
      ),
    ).filter((element) => !element.hidden && element.offsetParent !== null);
  }

  /* =====================================================
       8. ONBOARDING
    ====================================================== */

  function prepareOnboarding() {
    if (!dom.onboardingWelcome || !dom.onboardingWarning) {
      return;
    }

    dom.onboardingWelcome.hidden = false;

    dom.onboardingWarning.hidden = true;

    if (dom.onboardingAcknowledgement) {
      dom.onboardingAcknowledgement.checked = false;
    }

    if (dom.enterLegaButton) {
      dom.enterLegaButton.disabled = true;
    }
  }

  function showOnboarding() {
    prepareOnboarding();

    openModal(dom.onboardingModal, dom.continueToWarningButton);
  }

  function showWarningStep() {
    dom.onboardingWelcome.hidden = true;

    dom.onboardingWarning.hidden = false;

    requestAnimationFrame(() => dom.onboardingAcknowledgement?.focus());
  }

  function showWelcomeStep() {
    dom.onboardingWarning.hidden = true;

    dom.onboardingWelcome.hidden = false;

    requestAnimationFrame(() => dom.continueToWarningButton?.focus());
  }

  function handleAcknowledgement() {
    dom.enterLegaButton.disabled = !dom.onboardingAcknowledgement.checked;
  }

  function enterLega() {
    if (!dom.onboardingAcknowledgement?.checked) {
      return;
    }

    getLegaAPI()?.completeOnboarding();

    state.firstVisit = false;

    closeModal(dom.onboardingModal, false);

    window.dispatchEvent(new CustomEvent("lega:entered"));
  }

  /* =====================================================
       9. PAGE NAVIGATION
    ====================================================== */

  function switchPage(pageID) {
    const target = document.getElementById(pageID);

    if (!target) {
      return;
    }

    dom.pages.forEach((page) => {
      const active = page === target;

      page.hidden = !active;

      page.classList.toggle("app-page--active", active);
    });

    dom.navItems.forEach((item) => {
      const active = item.dataset.pageTarget === pageID;

      item.classList.toggle("nav-item--active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    window.dispatchEvent(
      new CustomEvent("lega:page-changed", {
        detail: {
          pageID,
        },
      }),
    );
  }

  /* =====================================================
       10. ENTRY START MENU
    ====================================================== */

  function openEntryStartMenu() {
    openModal(dom.entryStartModal, dom.chooseLegaTemplateButton);
  }

  function openLegaTemplates() {
    switchModal(dom.entryStartModal, dom.templateLibraryModal);
  }

  function openPersonalTemplates() {
    renderPersonalTemplates();

    switchModal(dom.entryStartModal, dom.personalTemplatesModal);
  }

  /* =====================================================
       11. SLIDER METADATA
    ====================================================== */

  function getSliderMeta(sliderID) {
    const option = document.querySelector(
      `.slider-option[data-slider-id="${CSS.escape(sliderID)}"]`,
    );

    if (!option) {
      return null;
    }

    return {
      id: sliderID,

      title:
        option
          .querySelector(".slider-option__content strong")
          ?.textContent.trim() || sliderID,

      helper:
        option
          .querySelector(".slider-option__content small")
          ?.textContent.trim() || "",

      description: option.dataset.description || "",

      icon:
        option.querySelector(".slider-option__icon")?.textContent.trim() || "◌",
    };
  }

  /* =====================================================
       12. START ENTRY
    ====================================================== */

  function resetEntryDraft() {
    state.entryDraft = {
      templateId: null,
      templateName: null,
      sliderIds: [],
      sliderValues: {},
      sliderTouched: {},
      emoji: "",
      colour: null,
    };
  }

  function resetEntryForm() {
    resetEntryDraft();

    dom.entryForm?.reset();

    if (dom.selectedEmoji) {
      dom.selectedEmoji.value = "";
    }

    if (dom.selectedEmojiPreview) {
      dom.selectedEmojiPreview.textContent = "+";
    }

    if (dom.customColourPicker) {
      dom.customColourPicker.value = "#abcba9";
    }

    if (dom.selectedColour) {
      dom.selectedColour.value = "";
    }

    updateColourPreview(null);

    dom.selectedEntrySliders?.replaceChildren();

    updateEntrySliderCount();

    if (dom.entryTemplateIndicator) {
      dom.entryTemplateIndicator.hidden = true;
    }

    prepareDefaultEntryTime();
  }

  function startBlankEntry() {
    resetEntryForm();

    switchModal(dom.entryStartModal, dom.entryModal, dom.entryTitle);
  }

  function startEntryFromTemplate(template, sourceModal) {
    resetEntryForm();

    state.entryDraft.templateId = template.id;

    state.entryDraft.templateName = template.name;

    state.entryDraft.sliderIds = [...template.sliderIds];

    if (dom.entryTemplateIndicator) {
      dom.entryTemplateIndicator.hidden = false;
    }

    if (dom.entryTemplateName) {
      dom.entryTemplateName.textContent = template.name;
    }

    renderSelectedEntrySliders();

    switchModal(sourceModal, dom.entryModal, dom.entryTitle);
  }

  /* =====================================================
       13. LEGA TEMPLATE SELECTION
    ====================================================== */

  function handleLegaTemplateClick(event) {
    const card = event.target.closest("[data-template-id]");

    if (!card) {
      return;
    }

    const template = LEGA_TEMPLATES[card.dataset.templateId];

    if (!template) {
      return;
    }

    startEntryFromTemplate(template, dom.templateLibraryModal);
  }

  /* =====================================================
       14. PERSONAL TEMPLATE STORAGE
    ====================================================== */

  function loadPersonalTemplates() {
    const stored = readStorage(STORAGE_KEYS.personalTemplates, []);

    state.personalTemplates = Array.isArray(stored) ? stored : [];
  }

  function savePersonalTemplates() {
    writeStorage(STORAGE_KEYS.personalTemplates, state.personalTemplates);
  }

  function getPersonalTemplate(templateID) {
    return (
      state.personalTemplates.find((template) => template.id === templateID) ||
      null
    );
  }

  /* =====================================================
       15. PERSONAL TEMPLATE LIST
    ====================================================== */

  function renderPersonalTemplates() {
    if (!dom.personalTemplateList) {
      return;
    }

    dom.personalTemplateList.replaceChildren();

    if (!state.personalTemplates.length) {
      const empty = document.createElement("div");

      empty.className = "empty-state";

      const icon = document.createElement("span");

      icon.className = "empty-state__icon";

      icon.textContent = "♡";

      const title = document.createElement("p");

      title.textContent = "No templates yet.";

      const description = document.createElement("span");

      description.textContent =
        "Create one using the sliders that are most useful to you.";

      empty.append(icon, title, description);

      dom.personalTemplateList.append(empty);

      return;
    }

    state.personalTemplates.forEach((template) => {
      const card = document.createElement("article");

      card.className = "personal-template-card";

      card.dataset.templateId = template.id;

      const mainButton = document.createElement("button");

      mainButton.type = "button";

      mainButton.className = "personal-template-card__main";

      const title = document.createElement("strong");

      title.textContent = template.name;

      const description = document.createElement("span");

      description.textContent =
        template.description || "Your saved reflection template";

      const sliderCount = document.createElement("small");

      sliderCount.textContent = `${template.sliderIds.length} ${
        template.sliderIds.length === 1 ? "slider" : "sliders"
      }`;

      mainButton.append(title, description, sliderCount);

      const actions = document.createElement("div");

      actions.className = "personal-template-card__actions";

      const edit = document.createElement("button");

      edit.type = "button";

      edit.dataset.action = "edit-template";

      edit.textContent = "Edit";

      const remove = document.createElement("button");

      remove.type = "button";

      remove.dataset.action = "delete-template";

      remove.textContent = "Delete";

      actions.append(edit, remove);

      card.append(mainButton, actions);

      dom.personalTemplateList.append(card);
    });
  }

  function handlePersonalTemplateClick(event) {
    const card = event.target.closest(".personal-template-card");

    if (!card) {
      return;
    }

    const template = getPersonalTemplate(card.dataset.templateId);

    if (!template) {
      return;
    }

    const action = event.target.dataset.action;

    if (action === "edit-template") {
      openTemplateBuilder(template);

      return;
    }

    if (action === "delete-template") {
      deletePersonalTemplate(template.id);

      return;
    }

    if (event.target.closest(".personal-template-card__main")) {
      startEntryFromTemplate(template, dom.personalTemplatesModal);
    }
  }

  function deletePersonalTemplate(templateID) {
    state.personalTemplates = state.personalTemplates.filter(
      (template) => template.id !== templateID,
    );

    savePersonalTemplates();

    renderPersonalTemplates();
  }

  /* =====================================================
       16. TEMPLATE BUILDER
    ====================================================== */

  function openTemplateBuilder(existingTemplate = null) {
    state.editingTemplateID = existingTemplate?.id || null;

    state.templateDraft.sliderIds = existingTemplate
      ? [...existingTemplate.sliderIds]
      : [];

    dom.templateBuilderForm?.reset();

    if (existingTemplate) {
      dom.templateName.value = existingTemplate.name;

      dom.templateDescription.value = existingTemplate.description || "";
    }

    renderTemplateSelectedSliders();

    switchModal(
      dom.personalTemplatesModal,
      dom.templateBuilderModal,
      dom.templateName,
    );
  }

  function renderTemplateSelectedSliders() {
    if (!dom.templateSelectedSliders) {
      return;
    }

    dom.templateSelectedSliders.replaceChildren();

    if (!state.templateDraft.sliderIds.length) {
      const empty = document.createElement("div");

      empty.className = "selected-slider-empty";

      empty.textContent = "No sliders chosen yet.";

      dom.templateSelectedSliders.append(empty);

      return;
    }

    state.templateDraft.sliderIds.forEach((sliderID) => {
      const meta = getSliderMeta(sliderID);

      if (!meta) {
        return;
      }

      const tag = document.createElement("span");

      tag.className = "selected-slider-tag";

      tag.textContent = `${meta.icon} ${meta.title}`;

      dom.templateSelectedSliders.append(tag);
    });
  }

  function handleTemplateBuilderSubmit(event) {
    event.preventDefault();

    const name = dom.templateName?.value.trim();

    if (!name) {
      dom.templateName?.focus();

      return;
    }

    if (!state.templateDraft.sliderIds.length) {
      renderTemplateSliderError();

      return;
    }

    const description = dom.templateDescription?.value.trim() || "";

    if (state.editingTemplateID) {
      const index = state.personalTemplates.findIndex(
        (template) => template.id === state.editingTemplateID,
      );

      if (index !== -1) {
        state.personalTemplates[index] = {
          ...state.personalTemplates[index],

          name,

          description,

          sliderIds: [...state.templateDraft.sliderIds],

          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      state.personalTemplates.push({
        id: createID("template"),

        name,

        description,

        sliderIds: [...state.templateDraft.sliderIds],

        createdAt: new Date().toISOString(),
      });
    }

    savePersonalTemplates();

    state.editingTemplateID = null;

    renderPersonalTemplates();

    switchModal(dom.templateBuilderModal, dom.personalTemplatesModal);
  }

  function renderTemplateSliderError() {
    dom.templateSelectedSliders.replaceChildren();

    const error = document.createElement("div");

    error.className = "selected-slider-error";

    error.textContent = "Choose at least one slider for this template.";

    dom.templateSelectedSliders.append(error);

    dom.chooseTemplateSlidersButton?.focus();
  }

  /* =====================================================
       17. SLIDER LIBRARY
    ====================================================== */

  function openSliderLibrary(context) {
    state.sliderSelectionContext = context;

    const selectedIDs =
      context === "template"
        ? state.templateDraft.sliderIds
        : state.entryDraft.sliderIds;

    dom.sliderOptions.forEach((option) => {
      const checkbox = option.querySelector('input[type="checkbox"]');

      checkbox.checked = selectedIDs.includes(option.dataset.sliderId);
    });

    if (dom.sliderSearch) {
      dom.sliderSearch.value = "";
    }

    filterSliders("");

    updateSliderLibraryCount();

    openModal(dom.sliderLibraryModal, dom.sliderSearch);
  }

  function getSliderLibrarySelection() {
    return Array.from(dom.sliderOptions)
      .filter(
        (option) => option.querySelector('input[type="checkbox"]')?.checked,
      )
      .map((option) => option.dataset.sliderId);
  }

  function updateSliderLibraryCount() {
    const count = getSliderLibrarySelection().length;

    if (dom.sliderLibrarySelectionCount) {
      dom.sliderLibrarySelectionCount.textContent = `${count} ${
        count === 1 ? "slider" : "sliders"
      } selected`;
    }
  }

  function confirmSliderSelection() {
    const selected = getSliderLibrarySelection();

    if (state.sliderSelectionContext === "template") {
      state.templateDraft.sliderIds = [...selected];

      renderTemplateSelectedSliders();
    } else {
      const previousValues = {
        ...state.entryDraft.sliderValues,
      };

      const previousTouched = {
        ...state.entryDraft.sliderTouched,
      };

      state.entryDraft.sliderIds = [...selected];

      state.entryDraft.sliderValues = {};

      state.entryDraft.sliderTouched = {};

      selected.forEach((sliderID) => {
        if (previousValues[sliderID] !== undefined) {
          state.entryDraft.sliderValues[sliderID] = previousValues[sliderID];
        }

        if (previousTouched[sliderID]) {
          state.entryDraft.sliderTouched[sliderID] = true;
        }
      });

      renderSelectedEntrySliders();
    }

    closeModal(dom.sliderLibraryModal);
  }

  function filterSliders(query) {
    const search = query.trim().toLowerCase();

    dom.sliderCategories.forEach((category) => {
      let visibleCount = 0;

      category.querySelectorAll(".slider-option").forEach((option) => {
        const meta = getSliderMeta(option.dataset.sliderId);

        const searchable = [meta?.title, meta?.helper, meta?.description]
          .join(" ")
          .toLowerCase();

        const visible = !search || searchable.includes(search);

        option.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      category.hidden = visibleCount === 0;
    });
  }

  /* =====================================================
       18. SLIDER INFORMATION
    ====================================================== */

  function openSliderInfo(sliderID) {
    const meta = getSliderMeta(sliderID);

    if (!meta) {
      return;
    }

    dom.sliderInfoTitle.textContent = meta.title;

    dom.sliderInfoIcon.textContent = meta.icon;

    dom.sliderInfoDescription.textContent = meta.description;

    openModal(dom.sliderInfoModal, dom.closeSliderInfoButton);
  }

  function handleSliderLibraryClick(event) {
    const infoButton = event.target.closest("[data-slider-info]");

    if (infoButton) {
      event.preventDefault();
      event.stopPropagation();

      openSliderInfo(infoButton.dataset.sliderInfo);
    }
  }

  /* =====================================================
       19. DYNAMIC ENTRY SLIDERS
    ====================================================== */

  function updateEntrySliderCount() {
    const count = state.entryDraft.sliderIds.length;

    if (dom.selectedSliderCount) {
      dom.selectedSliderCount.textContent =
        count === 0
          ? "No sliders selected"
          : `${count} ${count === 1 ? "slider" : "sliders"} selected`;
    }
  }

  function renderSelectedEntrySliders() {
    if (!dom.selectedEntrySliders) {
      return;
    }

    dom.selectedEntrySliders.replaceChildren();

    updateEntrySliderCount();

    state.entryDraft.sliderIds.forEach((sliderID) => {
      const meta = getSliderMeta(sliderID);

      if (!meta) {
        return;
      }

      const control = document.createElement("div");

      control.className = "entry-slider";

      control.dataset.sliderId = sliderID;

      /* ---------- Header ---------- */

      const header = document.createElement("div");

      header.className = "entry-slider__header";

      const identity = document.createElement("div");

      identity.className = "entry-slider__identity";

      const icon = document.createElement("span");

      icon.className = "entry-slider__icon";

      icon.textContent = meta.icon;

      const label = document.createElement("strong");

      label.textContent = meta.title;

      identity.append(icon, label);

      const actions = document.createElement("div");

      actions.className = "entry-slider__actions";

      const info = document.createElement("button");

      info.type = "button";

      info.className = "slider-info-button";

      info.textContent = "?";

      info.setAttribute("aria-label", `What does ${meta.title} mean?`);

      info.addEventListener("click", () => openSliderInfo(sliderID));

      const remove = document.createElement("button");

      remove.type = "button";

      remove.className = "entry-slider__remove";

      remove.textContent = "×";

      remove.setAttribute("aria-label", `Remove ${meta.title}`);

      remove.addEventListener("click", () => removeEntrySlider(sliderID));

      actions.append(info, remove);

      header.append(identity, actions);

      /* ---------- Range ---------- */

      const scale = document.createElement("div");

      scale.className = "entry-slider__scale";

      const less = document.createElement("span");

      less.textContent = "Less";

      const output = document.createElement("output");

      output.className = "entry-slider__value";

      output.textContent = state.entryDraft.sliderTouched[sliderID]
        ? String(state.entryDraft.sliderValues[sliderID])
        : "Not set";

      const more = document.createElement("span");

      more.textContent = "More";

      scale.append(less, output, more);

      const range = document.createElement("input");

      range.type = "range";

      range.min = "0";

      range.max = "100";

      range.step = "1";

      range.value = String(state.entryDraft.sliderValues[sliderID] ?? 50);

      range.setAttribute("aria-label", meta.title);

      range.addEventListener("input", () => {
        state.entryDraft.sliderTouched[sliderID] = true;

        state.entryDraft.sliderValues[sliderID] = Number(range.value);

        output.textContent = range.value;
      });

      control.append(header, scale, range);

      dom.selectedEntrySliders.append(control);
    });
  }

  function removeEntrySlider(sliderID) {
    state.entryDraft.sliderIds = state.entryDraft.sliderIds.filter(
      (id) => id !== sliderID,
    );

    delete state.entryDraft.sliderValues[sliderID];

    delete state.entryDraft.sliderTouched[sliderID];

    renderSelectedEntrySliders();
  }

  function collectEntrySliderValues() {
    const values = {};

    state.entryDraft.sliderIds.forEach((sliderID) => {
      if (!state.entryDraft.sliderTouched[sliderID]) {
        return;
      }

      values[sliderID] = Number(state.entryDraft.sliderValues[sliderID]);
    });

    return values;
  }

  /* =====================================================
       20. EMOJI PICKER
    ====================================================== */

  function loadRecentEmojis() {
    const stored = readStorage(STORAGE_KEYS.recentEmojis, []);

    state.recentEmojis = Array.isArray(stored) ? stored : [];
  }

  function saveRecentEmoji(emoji) {
    state.recentEmojis = [
      emoji,
      ...state.recentEmojis.filter((item) => item !== emoji),
    ].slice(0, 24);

    writeStorage(STORAGE_KEYS.recentEmojis, state.recentEmojis);
  }

  function getEmojiItems(category, search = "") {
    const query = search.trim().toLowerCase();

    if (query) {
      return Object.entries(EMOJI_LIBRARY)
        .flatMap(([group, items]) =>
          items.map((item) => ({
            emoji: item[0],
            name: item[1],
            category: group,
          })),
        )
        .filter(
          (item) => item.name.includes(query) || item.emoji.includes(query),
        );
    }

    if (category === "recent") {
      return state.recentEmojis.map((emoji) => {
        const match = Object.values(EMOJI_LIBRARY)
          .flat()
          .find((item) => item[0] === emoji);

        return {
          emoji,
          name: match?.[1] || "recent emoji",
          category: "recent",
        };
      });
    }

    return (EMOJI_LIBRARY[category] || []).map((item) => ({
      emoji: item[0],
      name: item[1],
      category,
    }));
  }

  function openEmojiPicker() {
    state.activeEmojiCategory = "recent";

    if (dom.emojiSearch) {
      dom.emojiSearch.value = "";
    }

    updateEmojiCategoryTabs();

    renderEmojiPicker();

    openModal(dom.emojiPickerModal, dom.emojiSearch);
  }

  function updateEmojiCategoryTabs() {
    dom.emojiCategoryTabs.forEach((tab) => {
      const active = tab.dataset.emojiCategory === state.activeEmojiCategory;

      tab.classList.toggle("emoji-category-tab--active", active);

      tab.setAttribute("aria-selected", String(active));
    });
  }

  function renderEmojiPicker() {
    if (!dom.emojiPickerGrid) {
      return;
    }

    const items = getEmojiItems(
      state.activeEmojiCategory,
      dom.emojiSearch?.value || "",
    );

    dom.emojiPickerGrid.replaceChildren();

    if (!items.length) {
      const empty = document.createElement("div");

      empty.className = "empty-state";

      empty.textContent =
        state.activeEmojiCategory === "recent"
          ? "Your recently used emojis will appear here."
          : "No emojis found.";

      dom.emojiPickerGrid.append(empty);

      return;
    }

    items.forEach((item) => {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "emoji-picker-item";

      button.dataset.emoji = item.emoji;

      button.title = item.name;

      button.setAttribute("aria-label", item.name);

      button.textContent = item.emoji;

      dom.emojiPickerGrid.append(button);
    });
  }

  function selectEmoji(emoji) {
    state.entryDraft.emoji = emoji;

    if (dom.selectedEmoji) {
      dom.selectedEmoji.value = emoji;
    }

    if (dom.selectedEmojiPreview) {
      dom.selectedEmojiPreview.textContent = emoji;
    }

    saveRecentEmoji(emoji);

    closeModal(dom.emojiPickerModal);
  }

  /* =====================================================
       21. CUSTOM COLOUR
    ====================================================== */

  function selectCustomColour(colour) {
    state.entryDraft.colour = colour;

    if (dom.selectedColour) {
      dom.selectedColour.value = colour;
    }

    updateColourPreview(colour);
  }

  function updateColourPreview(colour) {
    if (!dom.customColourPreview) {
      return;
    }

    if (!colour) {
      dom.customColourPreview.style.background = "transparent";

      dom.customColourPreview.style.opacity = "0.35";

      return;
    }

    dom.customColourPreview.style.background = colour;

    dom.customColourPreview.style.opacity = "1";
  }

  /* =====================================================
       22. TIME INPUT
    ====================================================== */

  function toDateInputValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function toTimeInputValue(date) {
    return [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
    ].join(":");
  }

  function prepareDefaultEntryTime() {
    const lega = getLegaAPI();

    const now = new Date();

    const activeDayKey = lega?.getActiveDayKey();

    const viewingToday = activeDayKey
      ? lega.isCurrentLegaDay(activeDayKey)
      : true;

    if (dom.entryDate) {
      dom.entryDate.value = activeDayKey || toDateInputValue(now);

      dom.entryDate.max = lega?.getLegaDayKey(now) || toDateInputValue(now);
    }

    if (dom.entryTime) {
      dom.entryTime.value = toTimeInputValue(now);
    }

    const nowRadio = document.querySelector(
      'input[name="entryTimeMode"][value="now"]',
    );

    const customRadio = document.querySelector(
      'input[name="entryTimeMode"][value="custom"]',
    );

    if (!viewingToday && customRadio) {
      customRadio.checked = true;

      if (nowRadio) {
        nowRadio.checked = false;
      }

      updateTimeMode("custom");
    } else {
      if (nowRadio) {
        nowRadio.checked = true;
      }

      if (customRadio) {
        customRadio.checked = false;
      }

      updateTimeMode("now");
    }
  }

  function updateTimeMode(mode) {
    const custom = mode === "custom";

    if (dom.customTimeFields) {
      dom.customTimeFields.hidden = !custom;
    }

    if (dom.entryDate) {
      dom.entryDate.required = custom;
    }

    if (dom.entryTime) {
      dom.entryTime.required = custom;
    }
  }

  function createLocalTimestamp(dateValue, timeValue) {
    if (!dateValue || !timeValue) {
      return null;
    }

    const [year, month, day] = dateValue.split("-").map(Number);

    const [hour, minute] = timeValue.split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute, 0, 0);

    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  function getSelectedEntryTimestamp() {
    const selectedMode = document.querySelector(
      'input[name="entryTimeMode"]:checked',
    )?.value;

    if (selectedMode !== "custom") {
      return Date.now();
    }

    const timestamp = createLocalTimestamp(
      dom.entryDate?.value,
      dom.entryTime?.value,
    );

    if (timestamp === null) {
      return null;
    }

    if (timestamp > Date.now()) {
      dom.entryTime?.setCustomValidity(
        "Choose a time that has already happened.",
      );

      dom.entryTime?.reportValidity();

      return null;
    }

    dom.entryTime?.setCustomValidity("");

    return timestamp;
  }

  /* =====================================================
       23. TEMPORARY ENTRY EXTRA STORAGE
       -----------------------------------------------------
       main.js still understands the original fixed
       dimensions + preset colours.

       Until main.js is expanded, store the complete new
       entry model separately so no prototype data is lost.
    ====================================================== */

  function saveEntryExtras(entryID, extras) {
    const existing = readStorage(STORAGE_KEYS.entryExtras, {});

    existing[entryID] = extras;

    writeStorage(STORAGE_KEYS.entryExtras, existing);
  }

  /* =====================================================
       24. ENTRY SUBMISSION
    ====================================================== */

  function handleEntrySubmit(event) {
    event.preventDefault();

    const lega = getLegaAPI();

    if (!lega) {
      return;
    }

    const timestamp = getSelectedEntryTimestamp();

    if (timestamp === null) {
      return;
    }

    const sliderValues = collectEntrySliderValues();

    const entry = lega.createEntry({
      timestamp,

      title: dom.entryTitle?.value.trim() || "",

      note: dom.entryNote?.value.trim() || "",

      emoji: state.entryDraft.emoji,

      /*
                   main.js will be expanded later to accept
                   arbitrary hex colours.
                */

      colour: state.entryDraft.colour,

      /*
                   main.js currently keeps the original
                   dimension names it knows.

                   The complete slider object is also stored
                   below in entryExtras.
                */

      dimensions: sliderValues,
    });

    if (!entry) {
      return;
    }

    saveEntryExtras(entry.id, {
      templateId: state.entryDraft.templateId,

      templateName: state.entryDraft.templateName,

      sliderIds: [...state.entryDraft.sliderIds],

      sliderValues: clone(sliderValues),

      colour: state.entryDraft.colour,

      emoji: state.entryDraft.emoji,

      savedAt: new Date().toISOString(),
    });

    closeModal(dom.entryModal);

    if (entry.dayKey && entry.dayKey !== lega.getActiveDayKey()) {
      lega.setActiveDay(entry.dayKey);
    }

    switchPage("homePage");

    window.dispatchEvent(
      new CustomEvent("lega:entry-saved", {
        detail: {
          entry,
        },
      }),
    );
  }

  /* =====================================================
       25. ENTRY LIST SELECTION
    ====================================================== */

  function handleEntryListClick(event) {
    const card = event.target.closest(".entry-card");

    if (!card) {
      return;
    }

    const entryID = card.dataset.entryId;

    if (!entryID) {
      return;
    }

    state.selectedEntryID = entryID;

    dom.todayEntryList?.querySelectorAll(".entry-card").forEach((entryCard) => {
      entryCard.classList.toggle("entry-card--selected", entryCard === card);
    });

    window.dispatchEvent(
      new CustomEvent("lega:entry-selected", {
        detail: {
          entryID,
        },
      }),
    );
  }

  /* =====================================================
       26. DAY PICKER
    ====================================================== */

  function openDayPicker() {
    const lega = getLegaAPI();

    if (!lega) {
      return;
    }

    let picker = document.getElementById("legaDayPicker");

    if (!picker) {
      picker = document.createElement("input");

      picker.id = "legaDayPicker";

      picker.type = "date";

      picker.setAttribute("aria-label", "Choose a day");

      Object.assign(picker.style, {
        position: "fixed",

        left: "50%",

        top: "50%",

        width: "1px",

        height: "1px",

        opacity: "0",

        pointerEvents: "none",
      });

      picker.addEventListener("change", () => {
        if (picker.value) {
          lega.setActiveDay(picker.value);

          switchPage("homePage");
        }
      });

      document.body.append(picker);
    }

    picker.value = lega.getActiveDayKey();

    picker.max = lega.getLegaDayKey(new Date());

    try {
      if (typeof picker.showPicker === "function") {
        picker.showPicker();
      } else {
        picker.click();
      }
    } catch {
      picker.click();
    }
  }

  /* =====================================================
       27. SETTINGS
    ====================================================== */

  function syncSettingsUI() {
    const lega = getLegaAPI();

    if (!lega) {
      return;
    }

    const settings = lega.getSettings();

    dom.themeButtons.forEach((button) => {
      const active = button.dataset.theme === settings.theme;

      button.classList.toggle("theme-option--selected", active);

      button.setAttribute("aria-pressed", String(active));
    });

    dom.textSizeButtons.forEach((button) => {
      const active = button.dataset.textSize === settings.textSize;

      button.classList.toggle("text-size-option--active", active);

      button.setAttribute("aria-pressed", String(active));
    });

    if (dom.showMoodPatternsSetting) {
      dom.showMoodPatternsSetting.checked = settings.showMoodPatterns !== false;
    }
  }

  function changeTheme(button) {
    getLegaAPI()?.updateSetting("theme", button.dataset.theme);

    syncSettingsUI();
  }

  function changeTextSize(button) {
    /*
           This saves the user's selection.

           The actual typography scale will be designed
           separately later, as planned.
        */

    getLegaAPI()?.updateSetting("textSize", button.dataset.textSize);

    syncSettingsUI();
  }

  function changePatternSetting() {
    getLegaAPI()?.updateSetting(
      "showMoodPatterns",
      dom.showMoodPatternsSetting.checked,
    );

    window.dispatchEvent(
      new CustomEvent("lega:mood-pattern-setting-changed", {
        detail: {
          enabled: dom.showMoodPatternsSetting.checked,
        },
      }),
    );
  }

  /* =====================================================
       28. LOADING / READY
    ====================================================== */

  function handleCoreReady(event) {
    state.coreReady = true;

    state.firstVisit = Boolean(event.detail?.firstVisit);

    syncSettingsUI();

    maybeShowOnboarding();
  }

  function handleLoadingComplete() {
    state.loadingComplete = true;

    maybeShowOnboarding();
  }

  function maybeShowOnboarding() {
    if (!state.coreReady || !state.loadingComplete) {
      return;
    }

    if (state.firstVisit) {
      showOnboarding();
    }
  }

  /* =====================================================
       29. KEYBOARD
    ====================================================== */

  function handleGlobalKeydown(event) {
    if (event.key === "Escape") {
      const visible = Array.from(openModals).filter((modal) => !modal.hidden);

      const top = visible[visible.length - 1];

      /*
               First-time onboarding cannot be escaped.
            */

      if (top && top !== dom.onboardingModal) {
        closeModal(top);

        return;
      }
    }

    if (event.key !== "Tab" || openModals.size === 0) {
      return;
    }

    const visible = Array.from(openModals).filter((modal) => !modal.hidden);

    const activeModal = visible[visible.length - 1];

    if (!activeModal) {
      return;
    }

    const focusable = getFocusableElements(activeModal);

    if (!focusable.length) {
      return;
    }

    const first = focusable[0];

    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();

      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();

      first.focus();
    }
  }

  /* =====================================================
       30. EVENT BINDINGS
    ====================================================== */

  function bindEvents() {
    /* ---------- Onboarding ---------- */

    dom.continueToWarningButton?.addEventListener("click", showWarningStep);

    dom.backToWelcomeButton?.addEventListener("click", showWelcomeStep);

    dom.onboardingAcknowledgement?.addEventListener(
      "change",
      handleAcknowledgement,
    );

    dom.enterLegaButton?.addEventListener("click", enterLega);

    /* ---------- Navigation ---------- */

    dom.pageControls.forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();

        if (control.dataset.pageTarget) {
          switchPage(control.dataset.pageTarget);
        }
      });
    });

    /* ---------- Help ---------- */

    dom.helpButton?.addEventListener("click", () =>
      openModal(dom.helpModal, dom.closeHelpModalButton),
    );

    dom.closeHelpModalButton?.addEventListener("click", () =>
      closeModal(dom.helpModal),
    );

    dom.helpBackdrop?.addEventListener("click", () =>
      closeModal(dom.helpModal),
    );

    /* ---------- Settings ---------- */

    const openSettings = () => {
      syncSettingsUI();

      openModal(dom.settingsModal, dom.closeSettingsModalButton);
    };

    dom.settingsButton?.addEventListener("click", openSettings);

    dom.navigationSettingsButton?.addEventListener("click", openSettings);

    dom.closeSettingsModalButton?.addEventListener("click", () =>
      closeModal(dom.settingsModal),
    );

    dom.settingsBackdrop?.addEventListener("click", () =>
      closeModal(dom.settingsModal),
    );

    dom.themeButtons.forEach((button) =>
      button.addEventListener("click", () => changeTheme(button)),
    );

    dom.textSizeButtons.forEach((button) =>
      button.addEventListener("click", () => changeTextSize(button)),
    );

    dom.showMoodPatternsSetting?.addEventListener(
      "change",
      changePatternSetting,
    );

    /* ---------- Start entry ---------- */

    dom.addEntryButton?.addEventListener("click", openEntryStartMenu);

    dom.closeEntryStartButton?.addEventListener("click", () =>
      closeModal(dom.entryStartModal),
    );

    dom.entryStartBackdrop?.addEventListener("click", () =>
      closeModal(dom.entryStartModal),
    );

    dom.chooseLegaTemplateButton?.addEventListener("click", openLegaTemplates);

    dom.choosePersonalTemplateButton?.addEventListener(
      "click",
      openPersonalTemplates,
    );

    dom.startBlankEntryButton?.addEventListener("click", startBlankEntry);

    /* ---------- Lega templates ---------- */

    dom.legaTemplateGrid?.addEventListener("click", handleLegaTemplateClick);

    dom.closeTemplateLibraryButton?.addEventListener("click", () =>
      closeModal(dom.templateLibraryModal),
    );

    dom.templateLibraryBackdrop?.addEventListener("click", () =>
      closeModal(dom.templateLibraryModal),
    );

    dom.backFromTemplateLibraryButton?.addEventListener("click", () =>
      switchModal(dom.templateLibraryModal, dom.entryStartModal),
    );

    /* ---------- Personal templates ---------- */

    dom.personalTemplateList?.addEventListener(
      "click",
      handlePersonalTemplateClick,
    );

    dom.createTemplateButton?.addEventListener("click", () =>
      openTemplateBuilder(),
    );

    dom.closePersonalTemplatesButton?.addEventListener("click", () =>
      closeModal(dom.personalTemplatesModal),
    );

    dom.personalTemplatesBackdrop?.addEventListener("click", () =>
      closeModal(dom.personalTemplatesModal),
    );

    dom.backFromPersonalTemplatesButton?.addEventListener("click", () =>
      switchModal(dom.personalTemplatesModal, dom.entryStartModal),
    );

    /* ---------- Template builder ---------- */

    dom.templateBuilderForm?.addEventListener(
      "submit",
      handleTemplateBuilderSubmit,
    );

    dom.chooseTemplateSlidersButton?.addEventListener("click", () =>
      openSliderLibrary("template"),
    );

    dom.closeTemplateBuilderButton?.addEventListener("click", () =>
      switchModal(dom.templateBuilderModal, dom.personalTemplatesModal),
    );

    dom.templateBuilderBackdrop?.addEventListener("click", () =>
      switchModal(dom.templateBuilderModal, dom.personalTemplatesModal),
    );

    dom.cancelTemplateBuilderButton?.addEventListener("click", () =>
      switchModal(dom.templateBuilderModal, dom.personalTemplatesModal),
    );

    /* ---------- Entry editor ---------- */

    dom.entryForm?.addEventListener("submit", handleEntrySubmit);

    dom.closeEntryModalButton?.addEventListener("click", () =>
      closeModal(dom.entryModal),
    );

    dom.cancelEntryButton?.addEventListener("click", () =>
      closeModal(dom.entryModal),
    );

    dom.entryBackdrop?.addEventListener("click", () =>
      closeModal(dom.entryModal),
    );

    /* ---------- Time ---------- */

    dom.timeModeRadios.forEach((radio) =>
      radio.addEventListener("change", () => {
        if (radio.checked) {
          updateTimeMode(radio.value);
        }
      }),
    );

    dom.entryTime?.addEventListener("input", () =>
      dom.entryTime.setCustomValidity(""),
    );

    /* ---------- Emoji ---------- */

    dom.openEmojiPickerButton?.addEventListener("click", openEmojiPicker);

    dom.closeEmojiPickerButton?.addEventListener("click", () =>
      closeModal(dom.emojiPickerModal),
    );

    dom.emojiPickerBackdrop?.addEventListener("click", () =>
      closeModal(dom.emojiPickerModal),
    );

    dom.emojiCategoryTabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        state.activeEmojiCategory = tab.dataset.emojiCategory;

        updateEmojiCategoryTabs();

        renderEmojiPicker();
      }),
    );

    dom.emojiSearch?.addEventListener("input", renderEmojiPicker);

    dom.emojiPickerGrid?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-emoji]");

      if (button) {
        selectEmoji(button.dataset.emoji);
      }
    });

    /* ---------- Colour ---------- */

    dom.customColourPicker?.addEventListener("input", () =>
      selectCustomColour(dom.customColourPicker.value),
    );

    /* ---------- Entry sliders ---------- */

    dom.chooseEntrySlidersButton?.addEventListener("click", () =>
      openSliderLibrary("entry"),
    );

    /* ---------- Slider library ---------- */

    dom.sliderLibrary?.addEventListener("change", updateSliderLibraryCount);

    dom.sliderLibrary?.addEventListener("click", handleSliderLibraryClick);

    dom.sliderSearch?.addEventListener("input", () =>
      filterSliders(dom.sliderSearch.value),
    );

    dom.confirmSliderSelectionButton?.addEventListener(
      "click",
      confirmSliderSelection,
    );

    dom.cancelSliderSelectionButton?.addEventListener("click", () =>
      closeModal(dom.sliderLibraryModal),
    );

    dom.closeSliderLibraryButton?.addEventListener("click", () =>
      closeModal(dom.sliderLibraryModal),
    );

    dom.sliderLibraryBackdrop?.addEventListener("click", () =>
      closeModal(dom.sliderLibraryModal),
    );

    /* ---------- Slider info ---------- */

    dom.closeSliderInfoButton?.addEventListener("click", () =>
      closeModal(dom.sliderInfoModal),
    );

    dom.sliderInfoBackdrop?.addEventListener("click", () =>
      closeModal(dom.sliderInfoModal),
    );

    /* ---------- Date ---------- */

    dom.dateDisplayButton?.addEventListener("click", openDayPicker);

    /* ---------- Today entries ---------- */

    dom.todayEntryList?.addEventListener("click", handleEntryListClick);

    /* ---------- Keyboard ---------- */

    document.addEventListener("keydown", handleGlobalKeydown);
  }

  /* =====================================================
       31. LEGA EVENTS
    ====================================================== */

  window.addEventListener("lega:ready", handleCoreReady);

  window.addEventListener("lega:loading-complete", handleLoadingComplete);

  window.addEventListener("lega:settings-changed", syncSettingsUI);

  /* =====================================================
       32. INITIALISE
    ====================================================== */

  function initialiseInteractions() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    cacheDOM();

    loadPersonalTemplates();

    loadRecentEmojis();

    bindEvents();

    prepareOnboarding();

    resetEntryDraft();

    updateColourPreview(null);

    /*
           Safety for situations where main.js or
           aesthetic.js finished before this script could
           observe their events.
        */

    if (document.documentElement.dataset.legaReady === "true") {
      state.coreReady = true;

      state.firstVisit = !getLegaAPI()?.hasCompletedOnboarding();

      syncSettingsUI();
    }

    if (document.documentElement.dataset.legaLoadingComplete === "true") {
      state.loadingComplete = true;
    }

    maybeShowOnboarding();
  }

  initialiseInteractions();
})();
