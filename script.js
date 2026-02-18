const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const year = document.getElementById('year');
const contactForm = document.getElementById('contact-form');
const contactSubmit = document.getElementById('contact-submit');
const formStatus = document.getElementById('form-status');
const copyEmailButton = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
const emailLink = document.getElementById('email-link');
const themeToggle = document.getElementById('theme-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (!themeToggle) return;
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

applyTheme(getPreferredTheme());
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}

if (year) year.textContent = String(new Date().getFullYear());

if (navToggle && navLinks) {
  let previousFocus = null;
  const navItems = [...navLinks.querySelectorAll('a')];

  const closeNav = ({ returnFocus = false } = {}) => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
    if (returnFocus && previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  };

  const openNav = () => {
    previousFocus = document.activeElement;
    navLinks.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.textContent = '✕';
    navItems[0]?.focus();
  };

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeNav({ returnFocus: true });
    else openNav();
  });

  navItems.forEach((link) => link.addEventListener('click', () => closeNav()));

  document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      closeNav({ returnFocus: true });
    }
  });
}

if (navAnchors.length) {
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const setActiveNav = (id) => {
    navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveNav(visible.target.id);
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.35, 0.65] },
  );

  sections.forEach((section) => observer.observe(section));

  navAnchors.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
    });
  });
}

if (contactForm && contactSubmit && formStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    if (String(formData.get('website') || '').trim() !== '') {
      formStatus.textContent = 'Submission blocked.';
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = 'Sending...';
    formStatus.textContent = '';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        formStatus.textContent = 'Thanks! Your message was sent.';
        contactForm.reset();
      } else {
        formStatus.textContent = 'Sorry, something went wrong. Please email me directly.';
      }
    } catch (_error) {
      formStatus.textContent = 'Sorry, something went wrong. Please email me directly.';
    }

    contactSubmit.disabled = false;
    contactSubmit.textContent = 'Send message';
  });
}

const timelineItems = [...document.querySelectorAll('.timeline-item')];
const timelineFilterButtons = [...document.querySelectorAll('.timeline-filter-btn[data-filter]')];
if (timelineItems.length) {
  const setExpanded = (button, expanded) => {
    const detail = button.parentElement.querySelector('.timeline-detail');
    button.setAttribute('aria-expanded', String(expanded));
    button.classList.toggle('is-active', expanded);
    if (detail) detail.hidden = !expanded;
  };

  const collapseAll = () => {
    timelineItems.forEach((item) => {
      const button = item.querySelector('.timeline-item-btn');
      if (button) setExpanded(button, false);
    });
  };

  timelineItems.forEach((item) => {
    const button = item.querySelector('.timeline-item-btn');
    if (!button) return;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      collapseAll();
      setExpanded(button, !isExpanded);
    });
  });

  const defaultCurrent = timelineItems.find((item) => item.querySelector('.timeline-item-btn')?.dataset.period?.includes('current'));
  const defaultButton = defaultCurrent?.querySelector('.timeline-item-btn') || timelineItems[0]?.querySelector('.timeline-item-btn');
  if (defaultButton) setExpanded(defaultButton, true);

  const applyFilter = (filter) => {
    timelineItems.forEach((item) => {
      const match = filter === 'all' || item.dataset.type === filter;
      item.classList.toggle('is-hidden', !match);
    });

    const visibleExpanded = timelineItems.find(
      (item) => !item.classList.contains('is-hidden') && item.querySelector('.timeline-item-btn')?.getAttribute('aria-expanded') === 'true',
    );

    if (!visibleExpanded) {
      const firstVisible = timelineItems.find((item) => !item.classList.contains('is-hidden'));
      const button = firstVisible?.querySelector('.timeline-item-btn');
      if (button) {
        collapseAll();
        setExpanded(button, true);
      }
    }
  };

  timelineFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      timelineFilterButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      applyFilter(button.dataset.filter || 'all');
    });
  });
}

const skillNodes = [...document.querySelectorAll('.skill-node[data-skill]')];
const skillPanelTitle = document.getElementById('skill-panel-title');
const skillPanelDescription = document.getElementById('skill-panel-description');
const skillPanelPoints = document.getElementById('skill-panel-points');
const skillContent = {
  'java-core': {
    title: 'Java Core',
    description:
      'I solve backend problems with strong Java/Spring foundations, building stable APIs and production services.',
    points: ['Enterprise backend design and API architecture.', 'Production reliability, maintainability, and clean delivery.'],
  },
  'python-ai': {
    title: 'Python + AI',
    description:
      'My current focus is Python-first backend delivery and practical AI model development for real products.',
    points: [
      'Model training and adaptation workflows inspired by openWakeWord.',
      'From-scratch experimentation with custom environments using Gymnasium.',
    ],
  },
  'go-systems': {
    title: 'Go Systems',
    description:
      'I am actively building toward efficient, concurrency-aware Go services for high-performance backend systems.',
    points: ['Service design with scalability and reliability in mind.', 'Strong emphasis on simple architecture and operational clarity.'],
  },
  'delivery-toolkit': {
    title: 'Delivery Toolkit',
    description:
      'Across all stacks, I rely on a practical delivery toolkit that helps teams ship and maintain production software.',
    points: ['Docker, Git, Linux, CI/CD workflows, and code quality practices.', 'Collaboration, mentoring, and communication with cross-functional teams.'],
  },
};

if (skillNodes.length && skillPanelTitle && skillPanelDescription && skillPanelPoints) {
  const setSkill = (button) => {
    const key = button.dataset.skill;
    const content = skillContent[key];
    if (!content) return;

    skillNodes.forEach((node) => {
      const active = node === button;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-selected', String(active));
    });

    skillPanelTitle.textContent = content.title;
    skillPanelDescription.textContent = content.description;
    skillPanelPoints.innerHTML = content.points.map((point) => `<li>${point}</li>`).join('');

    button.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  skillNodes.forEach((button, index) => {
    button.addEventListener('click', () => setSkill(button));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const nextIndex = event.key === 'ArrowRight' ? Math.min(index + 1, skillNodes.length - 1) : Math.max(index - 1, 0);
      const nextButton = skillNodes[nextIndex];
      nextButton.focus();
      setSkill(nextButton);
    });
  });

  const initial = skillNodes.find((node) => node.classList.contains('is-active')) || skillNodes[0];
  setSkill(initial);
}

const projectGrid = document.getElementById('project-grid');
const projectTags = document.getElementById('project-tags');
const projectSearch = document.getElementById('project-search');
const clearSearch = document.getElementById('clear-search');
const projectEmpty = document.getElementById('project-empty');
const clearProjectFilters = document.getElementById('clear-project-filters');

if (projectGrid && projectTags && projectSearch && clearSearch && projectEmpty) {
  let projects = [
    {
      title: 'Backend + AI product currently in implementation phase.',
      description: 'In progress project focused on backend architecture and AI integration.',
      tags: ['Backend', 'AI'],
      highlights: ['Implementation phase', 'Production-focused architecture'],
      links: [],
    },
    {
      title: 'Model training and experimentation project in active R&D.',
      description: 'Active R&D initiative around iterative model training and experiments.',
      tags: ['AI', 'R&D'],
      highlights: ['Training workflows', 'Experiment tracking'],
      links: [],
    },
  ];

  let activeTag = 'All';
  let query = '';

  const debounce = (fn, delay = 200) => {
    let timeout;
    return (...args) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => fn(...args), delay);
    };
  };

  const renderProjects = () => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const matchesTag = activeTag === 'All' || project.tags.includes(activeTag);
      const searchable = `${project.title} ${project.description} ${project.tags.join(' ')}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesTag && matchesQuery;
    });

    clearSearch.hidden = !query;

    if (!filtered.length) {
      projectGrid.innerHTML = '';
      projectEmpty.hidden = false;
      return;
    }

    projectEmpty.hidden = true;
    projectGrid.innerHTML = filtered
      .map(
        (project) => `
      <article class="project-card card">
        <h3>${project.title}</h3>
        <p class="muted">${project.description}</p>
        <div class="tag-row">${project.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <ul class="project-highlights">${project.highlights.map((item) => `<li>${item}</li>`).join('')}</ul>
      </article>
    `,
      )
      .join('');
  };

  const renderTags = () => {
    const tags = ['All', ...new Set(projects.flatMap((project) => project.tags))];
    projectTags.innerHTML = tags
      .map((tag) => `<button type="button" class="filter-btn ${tag === activeTag ? 'active' : ''}" data-tag="${tag}" aria-pressed="${tag === activeTag}">${tag}</button>`)
      .join('');

    [...projectTags.querySelectorAll('.filter-btn')].forEach((button) => {
      button.addEventListener('click', () => {
        activeTag = button.dataset.tag || 'All';
        renderTags();
        renderProjects();
      });
    });
  };

  fetch('data/projects.json')
    .then((response) => (response.ok ? response.json() : []))
    .then((data) => {
      if (Array.isArray(data) && data.length) projects = data;
      renderTags();
      renderProjects();
    })
    .catch(() => {
      renderTags();
      renderProjects();
    });

  projectSearch.addEventListener(
    'input',
    debounce((event) => {
      query = event.target.value;
      renderProjects();
    }, 200),
  );

  clearSearch.addEventListener('click', () => {
    query = '';
    projectSearch.value = '';
    renderProjects();
    projectSearch.focus();
  });

  clearProjectFilters?.addEventListener('click', () => {
    query = '';
    activeTag = 'All';
    projectSearch.value = '';
    renderTags();
    renderProjects();
  });
}

if (copyEmailButton && copyStatus && emailLink) {
  copyEmailButton.addEventListener('click', async () => {
    const href = emailLink.getAttribute('href') || '';
    const email = href.startsWith('mailto:') ? href.replace('mailto:', '') : emailLink.textContent.trim();

    try {
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = 'Email copied to clipboard.';
    } catch (_error) {
      copyStatus.textContent = 'Could not copy automatically. Please copy the email address manually.';
    }

    window.setTimeout(() => {
      copyStatus.textContent = '';
    }, 2200);
  });
}
