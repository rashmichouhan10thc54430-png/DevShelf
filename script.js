const starterResources = [
  {
    id: "mdn",
    name: "MDN Web Docs",
    category: "Web Development",
    description: "Learn HTML, CSS and JavaScript with trusted developer documentation.",
    url: "https://developer.mozilla.org/",
    icon: "🌐"
  },
  {
    id: "freecodecamp",
    name: "freeCodeCamp",
    category: "Web Development",
    description: "Practice coding with free lessons and hands-on projects.",
    url: "https://www.freecodecamp.org/",
    icon: "💻"
  },
  {
    id: "flutter",
    name: "Flutter",
    category: "App Development",
    description: "Build apps for multiple platforms from one codebase.",
    url: "https://flutter.dev/",
    icon: "📱"
  },
  {
    id: "android",
    name: "Android Developers",
    category: "App Development",
    description: "Explore official Android guides, tools and learning resources.",
    url: "https://developer.android.com/",
    icon: "🤖"
  },
  {
    id: "kaggle",
    name: "Kaggle Learn",
    category: "AI & ML",
    description: "Start learning machine learning and data science with practical courses.",
    url: "https://www.kaggle.com/learn",
    icon: "🧠"
  },
  {
    id: "googleml",
    name: "Google ML Education",
    category: "AI & ML",
    description: "Understand machine learning concepts through guided lessons.",
    url: "https://developers.google.com/machine-learning",
    icon: "✨"
  },
  {
    id: "github",
    name: "GitHub",
    category: "Tools",
    description: "Save projects, track changes and collaborate with developers.",
    url: "https://github.com/",
    icon: "🐙"
  },
  {
    id: "figma",
    name: "Figma",
    category: "Tools",
    description: "Design and prototype user interfaces collaboratively.",
    url: "https://www.figma.com/",
    icon: "🎨"
  }
];

const grid = document.getElementById("resourceGrid");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const emptyMessage = document.getElementById("emptyMessage");
const resourceCount = document.getElementById("resourceCount");
const resourceForm = document.getElementById("resourceForm");
const formMessage = document.getElementById("formMessage");
const themeToggle = document.getElementById("themeToggle");

let resources = loadResources();
let activeCategory = "All";
let searchTerm = "";
let votes = loadVotes();

function loadResources() {
  try {
    const saved = localStorage.getItem("devshelf-resources");
    return saved ? JSON.parse(saved) : starterResources;
  } catch {
    return starterResources;
  }
}

function loadVotes() {
  try {
    return JSON.parse(localStorage.getItem("devshelf-votes") || "{}");
  } catch {
    return {};
  }
}

function saveResources() {
  localStorage.setItem("devshelf-resources", JSON.stringify(resources));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderResources() {
  const filtered = resources.filter(resource => {
    const matchesCategory =
      activeCategory === "All" || resource.category === activeCategory;

    const searchable =
      `${resource.name} ${resource.description} ${resource.category}`.toLowerCase();

    return matchesCategory && searchable.includes(searchTerm.toLowerCase());
  });

  grid.innerHTML = filtered.map(resource => `
    <article class="resource-card">
      <div class="card-top">
        <div class="resource-icon">${escapeHTML(resource.icon || "📚")}</div>
        <span class="category-tag">${escapeHTML(resource.category)}</span>
      </div>
      <h3>${escapeHTML(resource.name)}</h3>
      <p>${escapeHTML(resource.description)}</p>
      <div class="card-bottom">
        <a class="visit-link"
           href="${escapeHTML(resource.url)}"
           target="_blank"
           rel="noopener noreferrer">Explore resource ↗</a>
        <button class="vote-btn ${votes[resource.id] ? "voted" : ""}"
                data-vote="${escapeHTML(resource.id)}"
                aria-label="Upvote ${escapeHTML(resource.name)}">
          ${votes[resource.id] ? "♥" : "♡"} ${votes[resource.id] ? 1 : 0}
        </button>
      </div>
    </article>
  `).join("");

  emptyMessage.classList.toggle("hidden", filtered.length !== 0);
  resourceCount.textContent = resources.length;
}

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim();
  renderResources();
});

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  filters.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle("active", filter === button);
  });

  renderResources();
});

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-vote]");
  if (!button) return;

  const id = button.dataset.vote;
  votes[id] = !votes[id];
  localStorage.setItem("devshelf-votes", JSON.stringify(votes));
  renderResources();
});

resourceForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("resourceName").value.trim();
  const url = document.getElementById("resourceUrl").value.trim();
  const category = document.getElementById("resourceCategory").value;
  const description = document.getElementById("resourceDescription").value.trim();

  try {
    const parsedURL = new URL(url);

    if (!["https:", "http:"].includes(parsedURL.protocol)) {
      throw new Error("Invalid URL protocol");
    }

    const newResource = {
      id: `custom-${Date.now()}`,
      name,
      url: parsedURL.href,
      category,
      description,
      icon: "📌"
    };

    resources.unshift(newResource);
    saveResources();

    activeCategory = "All";
    searchTerm = "";
    searchInput.value = "";

    filters.querySelectorAll(".filter").forEach(button => {
      button.classList.toggle("active", button.dataset.category === "All");
    });

    renderResources();
    resourceForm.reset();
    formMessage.textContent = "✓ Resource added to your shelf!";
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
  } catch {
    formMessage.textContent = "Please enter a valid website URL.";
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀" : "☾";
  localStorage.setItem("devshelf-theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("devshelf-theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀";
}

renderResources();