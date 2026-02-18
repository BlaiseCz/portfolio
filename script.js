const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.getElementById("year");
const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contact-submit");
const formStatus = document.getElementById("form-status");
const copyEmailButton = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");
const emailLink = document.getElementById("email-link");
const themeToggle = document.getElementById("theme-toggle");
const skillMeters = document.querySelectorAll(".skill-meter");
const timelineButtons = document.querySelectorAll(".timeline-item-btn[data-period]");
const timelineDetailType = document.getElementById("timeline-detail-type");
const timelineDetailTitle = document.getElementById("timeline-detail-title");
const timelineDetailPeriod = document.getElementById("timeline-detail-period");
const timelineDetailDescription = document.getElementById("timeline-detail-description");
const timelineDetailCard = document.querySelector(".timeline-detail");
const timelineDetailHost = document.getElementById("timeline-detail-host");
const timelineFilterButtons = document.querySelectorAll(".timeline-filter-btn[data-filter]");
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const observedSections = navAnchors
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if (observedSections.length && navAnchors.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((e) => e.isIntersecting);
      if (!visible) return;

      const id = visible.target.id;
      navAnchors.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 },
  );

  observedSections.forEach((sec) => navObserver.observe(sec));
}


function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}


if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  const closeNav = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "☰";
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
    navToggle.textContent = expanded ? "☰" : "✕";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("open")) return;
    if (navLinks.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

if (contactForm && contactSubmit && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    if (String(formData.get("website") || "").trim() !== "") {
      formStatus.textContent = "Submission blocked.";
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Sending...";
    formStatus.textContent = "";

    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      formStatus.textContent = "Thanks! Your message was sent.";
      contactForm.reset();
    } else {
      formStatus.textContent =
        "Sorry, something went wrong. Please email me directly.";
    }

    contactSubmit.disabled = false;
    contactSubmit.textContent = "Send message";
  });
}

if (timelineButtons.length > 0 && timelineDetailType && timelineDetailTitle && timelineDetailPeriod && timelineDetailDescription) {
  const timelineButtonList = [...timelineButtons];
  const timelineItems = [...document.querySelectorAll(".timeline-item[data-type]")];
  let pinnedButton = timelineButtonList[0];

  const mobileTimelineQuery = window.matchMedia("(max-width: 760px)");

  const placeDetailCard = (button) => {
    if (!timelineDetailCard || !timelineDetailHost) {
      return;
    }

    if (mobileTimelineQuery.matches) {
      const activeItem = button.closest(".timeline-item");
      if (activeItem) {
        activeItem.appendChild(timelineDetailCard);
      }
      return;
    }

    timelineDetailHost.appendChild(timelineDetailCard);
  };

  const setDetail = (button) => {
    timelineButtonList.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    timelineDetailType.textContent = button.dataset.type || "Timeline";
    timelineDetailTitle.textContent = button.dataset.title || "";
    timelineDetailPeriod.textContent = button.dataset.period || "";
    timelineDetailDescription.textContent = button.dataset.description || "";

    placeDetailCard(button);

    if (timelineDetailCard) {
      timelineDetailCard.classList.remove("is-updated");
      window.requestAnimationFrame(() => timelineDetailCard.classList.add("is-updated"));
    }
  };

  const applyFilter = (filter) => {
    timelineItems.forEach((item) => {
      const itemType = item.dataset.type || "";
      const visible = filter === "all" || itemType === filter;
      item.classList.toggle("is-hidden", !visible);
    });

    const firstVisibleButton = timelineItems
      .find((item) => !item.classList.contains("is-hidden"))
      ?.querySelector(".timeline-item-btn");

    if (!firstVisibleButton) {
      return;
    }

    if (
      pinnedButton
      && pinnedButton.closest(".timeline-item")
      && !pinnedButton.closest(".timeline-item").classList.contains("is-hidden")
    ) {
      setDetail(pinnedButton);
      return;
    }

    pinnedButton = firstVisibleButton;
    setDetail(firstVisibleButton);
  };

  setDetail(pinnedButton);

  timelineButtonList.forEach((button) => {
    button.addEventListener("focus", () => setDetail(button));
    button.addEventListener("click", () => {
      pinnedButton = button;
      setDetail(button);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      const visibleButtons = timelineButtonList.filter(
        (item) => !item.closest(".timeline-item")?.classList.contains("is-hidden"),
      );
      const currentIndex = visibleButtons.indexOf(button);
      if (currentIndex === -1) {
        return;
      }

      event.preventDefault();
      const nextIndex = event.key === "ArrowDown"
        ? Math.min(currentIndex + 1, visibleButtons.length - 1)
        : Math.max(currentIndex - 1, 0);
      const nextButton = visibleButtons[nextIndex];
      pinnedButton = nextButton;
      nextButton.focus();
      setDetail(nextButton);
    });
  });

  timelineFilterButtons.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const filter = filterButton.dataset.filter || "all";
      timelineFilterButtons.forEach((button) => {
        const isActive = button === filterButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      applyFilter(filter);
    });
  });


  const handleTimelineBreakpointChange = () => {
    if (!pinnedButton) {
      return;
    }
    placeDetailCard(pinnedButton);
  };

  if (typeof mobileTimelineQuery.addEventListener === "function") {
    mobileTimelineQuery.addEventListener("change", handleTimelineBreakpointChange);
  } else if (typeof mobileTimelineQuery.addListener === "function") {
    mobileTimelineQuery.addListener(handleTimelineBreakpointChange);
  }

  applyFilter("all");
}

if (skillMeters.length > 0) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  skillMeters.forEach((meter) => observer.observe(meter));
}

if (copyEmailButton && copyStatus && emailLink) {
  copyEmailButton.addEventListener("click", async () => {
    const emailHref = emailLink.getAttribute("href") || "";
    const email = emailHref.startsWith("mailto:")
      ? emailHref.replace("mailto:", "")
      : emailLink.textContent.trim();
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Copied";

    window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 1600);
  });
}

