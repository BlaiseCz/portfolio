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

let projects = [];
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
