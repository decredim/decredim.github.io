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
    if (toggleBtn) toggleBtn.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
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

// json
async function loadIndex(type) {
    const url = `https://raw.githubusercontent.com/tug-g/decredim.github.io/main/${type}/index.json`;
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

// fetch md
async function loadMarkdown(type, filename) {
    const url = `https://raw.githubusercontent.com/tug-g/decredim.github.io/main/${type}/${filename}`;
    const res = await fetch(url);
    return await res.text();
}

// home page 2 post 2 extras
async function loadLatest() {
    const postsArea = document.getElementById("latest-posts");
    const extrasArea = document.getElementById("latest-extras");

    if (!postsArea && !extrasArea) return;

    let posts = await loadIndex("posts");
    let extras = await loadIndex("extras");

    posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    extras = extras.sort((a,b) => Date(b.date) - new Date(a.date));

    if (postsArea) {
        postsArea.innerHTML = posts
            .slice(0, 2)
            .map(p => `
                <div class="preview-item">
                    <a href="view.html?type=posts&file=${p.filename}"><h4>${p.title}</h4></a>
                    <p>${p.date}</p>
                </div>
            `).join("");
    }

    if (extrasArea) {
        extrasArea.innerHTML = extras
            .slice(0, 2)
            .map(e => `
                <div class="preview-item">
                    <a href="view.html?type=extras&file=${e.filename}"><h4>${e.title}</h4></a>
                    <p>${e.date}</p>
                </div>
            `).join("");
    }
}

// index + list pages
const MAX_ITEMS = {
    posts: 6,
    extras: 4
};

document.querySelectorAll('[data-type]').forEach(container => {
    const type = container.dataset.type;

    loadIndex(type).then(items => {
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

// view html
const viewContent = document.getElementById("view-content");
if (viewContent) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const file = params.get("file");

    loadMarkdown(type, file).then(md => {
        document.getElementById("view-title").textContent = file.replace(".md", "").replace(/-/g, " ");
        viewContent.innerHTML = mdToHtml(md);
    });
}

// load
loadLatest();
