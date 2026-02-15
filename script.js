const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.getElementById("year");
const projectGrid = document.getElementById("project-grid");
const tagFilters = document.getElementById("tag-filters");
const projectSearch = document.getElementById("project-search");
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
const timelineFilterButtons = document.querySelectorAll(".timeline-filter-btn[data-filter]");

let projects = [];

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

let activeTag = "All";
let searchTerm = "";

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const tagsHtml = project.tags.map((tag) => `<span>${tag}</span>`).join("");
  const highlightsHtml = project.highlights
    .map((item) => `<li>${item}</li>`)
    .join("");

  const links = [];
  if (project.links?.repo) {
    links.push(
      `<a href="${project.links.repo}" target="_blank" rel="noreferrer">Repository ↗</a>`,
    );
  }
  if (project.links?.demo) {
    links.push(
      `<a href="${project.links.demo}" target="_blank" rel="noreferrer">Live page ↗</a>`,
    );
  }

  card.innerHTML = `
    <div class="tag-row">${tagsHtml}</div>
    <h3>${project.title}</h3>
    <ul class="project-highlights">${highlightsHtml}</ul>
    <div class="project-links">${links.join("")}</div>
  `;

  return card;
}

function projectMatches(project) {
  const tagMatch = activeTag === "All" || project.tags.includes(activeTag);
  if (!tagMatch) {
    return false;
  }

  if (!searchTerm) {
    return true;
  }

  const haystack = [project.title, ...project.tags, ...project.highlights]
    .join(" ")
    .toLowerCase();
  return haystack.includes(searchTerm);
}

function renderProjects() {
  if (!projectGrid) {
    return;
  }

  const filtered = projects.filter(projectMatches);
  projectGrid.innerHTML = "";

  if (filtered.length === 0) {
    projectGrid.innerHTML =
      '<p class="muted">No projects matched your filter. Try another tag or search term.</p>';
    return;
  }

  filtered.forEach((project) => {
    projectGrid.appendChild(createProjectCard(project));
  });
}

function renderFilters() {
  if (!tagFilters) {
    return;
  }

  const tags = new Set(["All"]);
  projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)));

  tagFilters.innerHTML = "";
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-btn${tag === activeTag ? " active" : ""}`;
    button.textContent = tag;
    button.setAttribute("aria-pressed", String(tag === activeTag));

    button.addEventListener("click", () => {
      activeTag = tag;
      renderFilters();
      renderProjects();
    });

    tagFilters.appendChild(button);
  });
}

async function loadProjects() {
  if (!projectGrid) {
    return;
  }

  projectGrid.innerHTML = '<p class="muted">Loading projects...</p>';

  const response = await fetch("data/projects.json");
  projects = await response.json();

  renderFilters();
  renderProjects();
}

if (projectSearch) {
  projectSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderProjects();
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

  const setDetail = (button) => {
    timelineButtonList.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    timelineDetailType.textContent = button.dataset.type || "Timeline";
    timelineDetailTitle.textContent = button.dataset.title || "";
    timelineDetailPeriod.textContent = button.dataset.period || "";
    timelineDetailDescription.textContent = button.dataset.description || "";

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
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
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
      const nextIndex = event.key === "ArrowRight"
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

loadProjects();
