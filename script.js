// theme
const body = document.body;
const toggleBtn = document.getElementById("theme-toggle");

if (toggleBtn) {
    toggleBtn.onclick = () => {
        const current = body.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        body.setAttribute("data-theme", next);
        toggleBtn.textContent = next === "dark" ? "Light Mode" : "Dark Mode";
        localStorage.setItem("theme", next);
    };
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    body.setAttribute("data-theme", savedTheme);
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
    }
}


// markdown
function mdToHtml(md) {
    return md
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/---/gim, "<hr>")
        .replace(/\n/gim, "<br>");
}


// index.json
async function loadIndex(type) {
    const url = `https://raw.githubusercontent.com/decredim/decredim.github.io/main/${type}/index.json?cb=${Date.now()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}


// fetch
async function loadMarkdown(type, filename) {
    const url = `https://raw.githubusercontent.com/decredim/decredim.github.io/main/${type}/${filename}`;
    const res = await fetch(url);
    return await res.text();
}


// latest
async function loadLatest() {
    const postsArea = document.getElementById("latest-posts");
    const extrasArea = document.getElementById("latest-extras");

    if (!postsArea && !extrasArea) return;

    let posts = await loadIndex("posts");
    let extras = await loadIndex("extras");

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    extras.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (postsArea) {
        postsArea.innerHTML = posts.slice(0, 2).map(p => `
            <div class="card">
                <a href="view.html?type=posts&file=${p.filename}">
                    <h4>${p.title}</h4>
                    <p class="card-date">${p.date}</p>
                </a>
            </div>
        `).join("");
    }

    if (extrasArea) {
        extrasArea.innerHTML = extras.slice(0, 2).map(e => `
            <div class="card">
                <a href="view.html?type=extras&file=${e.filename}">
                    <h4>${e.title}</h4>
                    <p class="card-date">${e.date}</p>
                </a>
            </div>
        `).join("");
    }
}


// list pages
document.querySelectorAll('[data-type]').forEach(container => {
    if (container.id === "latest-posts" || container.id === "latest-extras") return;

    const type = container.dataset.type;

    loadIndex(type).then(items => {
        items
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(item => {
                const div = document.createElement("div");
                div.className = "card";

                div.innerHTML = `
                    <a href="view.html?type=${type}&file=${item.filename}">
                        <h4>${item.title}</h4>
                        <p class="card-date">${item.date}</p>
                    </a>
                `;

                container.appendChild(div);
            });
    });
});


// view page
const viewContent = document.getElementById("view-content");
if (viewContent) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const file = params.get("file");

    loadMarkdown(type, file).then(md => {
        document.getElementById("view-title").textContent =
            file.replace(".md", "").replace(/-/g, " ");
        viewContent.innerHTML = mdToHtml(md);
    });
}


// load
loadLatest();

async function loadMarkdown(type, filename) {
    const url = `https://raw.githubusercontent.com/decredim/decredim.github.io/main/${type}/${filename}`;
    const res = await fetch(url);
    return await res.text();
}


// latest
async function loadLatest() {
    const postsArea = document.getElementById("latest-posts");
    const extrasArea = document.getElementById("latest-extras");

    if (!postsArea && !extrasArea) return;

    let posts = await loadIndex("posts");
    let extras = await loadIndex("extras");

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    extras.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (postsArea) {
        postsArea.innerHTML = posts
            .slice(0, 2)
            .map(p => `
                <div class="card">
                    <a href="view.html?type=posts&file=${p.filename}">
                        <h4>${p.title}</h4>
                        <p class="card-date">${p.date}</p>
                    </a>
                </div>
            `)
            .join("");
    }

    if (extrasArea) {
        extrasArea.innerHTML = extras
            .slice(0, 2)
            .map(e => `
                <div class="card">
                    <a href="view.html?type=extras&file=${e.filename}">
                        <h4>${e.title}</h4>
                        <p class="card-date">${e.date}</p>
                    </a>
                </div>
            `)
            .join("");
    }
}


// list pages
const MAX_ITEMS = {
    posts: 6,
    extras: 4
};

if (document.body.classList.contains("list-page")) {
    document.querySelectorAll('[data-type]').forEach(container => {
        const type = container.dataset.type;

        loadIndex(type).then(items => {
            container.innerHTML = "";

            items
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, MAX_ITEMS[type] || items.length)
                .forEach(item => {
                    const div = document.createElement("div");
                    div.classList.add("card");

                    div.innerHTML = `
                        <a href="view.html?type=${type}&file=${item.filename}">
                            <h4>${item.title}</h4>
                            <p class="card-date">${item.date}</p>
                        </a>
                    `;

                    container.appendChild(div);
                });
        });
    });
}

// view page
const viewContent = document.getElementById("view-content");
if (viewContent) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const file = params.get("file");

    loadMarkdown(type, file).then(md => {
        document.getElementById("view-title").textContent =
            file.replace(".md", "").replace(/-/g, " ");
        viewContent.innerHTML = mdToHtml(md);
    });
}

loadLatest();

