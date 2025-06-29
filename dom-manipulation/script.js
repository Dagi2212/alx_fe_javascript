let quotes = [];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts ";

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", lastModified: Date.now() },
      { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life", lastModified: Date.now() },
      { id: 3, text: "Success usually comes to those who are too busy to be looking for it.", category: "Success", lastModified: Date.now() }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    return data.map(post => ({
      id: post.id,
      text: post.body,
      category: "General",
      lastModified: Date.parse(post.updatedAt || post.createdAt || new Date())
    }));
  } catch (err) {
    console.error("Failed to fetch from server:", err);
    return [];
  }
}

// Post new quote to server
async function postQuoteToServer(newQuote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newQuote.category,
        body: newQuote.text
      })
    });

    const posted = await response.json();
    return {
      id: posted.id,
      text: newQuote.text,
      category: newQuote.category,
      lastModified: Date.now()
    };
  } catch (err) {
    throw new Error("Failed to post quote to server.");
  }
}

// Sync local data with server
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Merge data using server wins strategy
    const merged = mergeLocalAndServerData([...quotes], [...serverQuotes]);

    quotes = merged;
    saveQuotes();
    populateCategories();

    // Notify user about successful sync
    notifyUser("Quotes synced with server!");

    // Push any local-only quotes to server
    const newQuotes = quotes.filter(q => q.localOnly);
    for (const quote of newQuotes) {
      try {
        const posted = await postQuoteToServer(quote);
        quote.id = posted.id;
        delete quote.localOnly;
      } catch (e) {
        console.error("Failed to upload quote:", quote.text);
      }
    }

    saveQuotes();

  } catch (err) {
    notifyUser("Sync failed: " + err.message, true);
  }
}

// Conflict resolution: server wins
function mergeLocalAndServerData(local, remote) {
  const map = new Map();

  [...local, ...remote].forEach(q => {
    if (!map.has(q.id)) {
      map.set(q.id, q);
    } else {
      const existing = map.get(q.id);
      if (q.lastModified > existing.lastModified) {
        map.set(q.id, q);
      }
    }
  });

  return Array.from(map.values());
}

// Populate categories dynamically
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  while (filter.options.length > 1) filter.remove(1);

  const categories = [...new Set(quotes.map(q => q.category))].sort();

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  const last = localStorage.getItem("lastFilter") || "all";
  filter.value = last;
  filterQuotes();
}

// Filter quotes based on selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selected);

  if (selected === "all") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === selected);
  }

  showRandomQuote();
}

// Show random quote
let filteredQuotes = [];

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");

  if (filteredQuotes.length === 0) {
    display.innerHTML = "<p>No quotes match this category.</p>";
    return;
  }

  const rand = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[rand];

  display.innerHTML = `
    <p>"${quote.text}"</p>
    <small>— ${quote.category}</small>
  `;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !cat) {
    alert("Both fields are required!");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category: cat,
    lastModified: Date.now(),
    localOnly: true
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  notifyUser("New quote added (will sync shortly).");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export to JSON
function exportToJsonFile() {
  if (quotes.length === 0) return alert("No quotes to export.");

  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);

      if (Array.isArray(imported) && imported.every(q => q.text && q.category)) {
        quotes.push(...imported.map(q => ({
          ...q,
          id: q.id || Date.now(),
          lastModified: Date.now()
        })));
        saveQuotes();
        populateCategories();
        notifyUser(`${imported.length} quote(s) imported.`);
        showRandomQuote();
      } else {
        alert("Invalid format. Must include 'text' and 'category'.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };

  reader.readAsText(file);
}

// Notify user
function notifyUser(message, isError = false) {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.className = "notification" + (isError ? " error" : "");
  notif.style.display = "block";

  setTimeout(() => notif.style.display = "none", 5000);
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("syncButton").addEventListener("click", syncQuotes);

// Initialize
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
};

// Auto-sync every 30s
setInterval(syncQuotes, 30000);
