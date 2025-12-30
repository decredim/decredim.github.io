let ghUser = "";
let ghRepo = "";
let ghToken = "";


/* Authentication */

document.getElementById("auth-save").onclick = () => {
    ghUser = document.getElementById("gh-user").value.trim();
    ghRepo = document.getElementById("gh-repo").value.trim();
    ghToken = document.getElementById("gh-token").value.trim();

    if (!ghUser || !ghRepo || !ghToken) {
        document.querySelector(".auth-status").textContent = "Missing fields.";
        return;
    }

    document.querySelector(".auth-status").textContent =
        "Admin mode enabled.";
    document.getElementById("editor-section").style.display = "block";
};


/* Utiliy */

function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


/* Update index.json */

async function updateIndex(type, newEntry) {
    const indexPath = `${type}/index.json`;
    const url = `https://api.github.com/repos/${ghUser}/${ghRepo}/contents/${indexPath}`;

    // fetch
    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${ghToken}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch index.json");
    }

    const data = await res.json();
    const decoded = atob(data.content);
    const index = JSON.parse(decoded);

    // append new entry
    index.push(newEntry);

    const updatedContent = btoa(
        unescape(encodeURIComponent(JSON.stringify(index, null, 2)))
    );

    // PUT updated index.json
    const updateRes = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${ghToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: `Update ${type} index`,
            content: updatedContent,
            sha: data.sha
        })
    });

    if (!updateRes.ok) {
        throw new Error("Failed to update index.json");
    }
}


/* submit */

document.getElementById("submit-post").onclick = async () => {
    const type = document.getElementById("content-type").value;
    const title = document.getElementById("post-title").value.trim();
    const tags = document.getElementById("post-tags").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
        document.getElementById("editor-status").textContent =
            "Missing title or content.";
        return;
    }

    const slug = slugify(title);
    const filename = `${slug}.md`;
    const path = `${type}/${filename}`;

    const mdFile =
`# ${title}

**Tags:** ${tags}

---

${content}
`;

    const url = `https://api.github.com/repos/${ghUser}/${ghRepo}/contents/${path}`;

    const base64Content = btoa(
        unescape(encodeURIComponent(mdFile))
    );

    const body = {
        message: `Add ${type.slice(0, -1)}: ${title}`,
        content: base64Content
    };

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${ghToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
        }

        // update index.json
        await updateIndex(type, {
            title,
            filename,
            date: new Date().toISOString().split("T")[0]
        });

        document.getElementById("editor-status").textContent =
            "Published successfully.";

    } catch (err) {
        document.getElementById("editor-status").textContent =
            "Error: " + err.message;
    }
};
