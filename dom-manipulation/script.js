// Local quotes array
let quotes = [];

// Simulated server endpoint
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts ";

// Load saved quotes from localStorage or use defaults
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert server data to our format
    const formattedServerData = serverData.map(post => ({
      id: post.id,
      text: post.body,
      category: "General",
      lastModified: Date.parse(post.updatedAt || post.createdAt)
    }));

    return formattedServerData;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    throw error;
  }
}

// Post a new quote to the server
async function postQuoteToServer(newQuote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: newQuote.category,
        body: newQuote.text
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to post quote: ${response.statusText}`);
    }

    const postedData = await response.json();
    return {
      id: postedData.id,
      text: newQuote.text,
      category: newQuote.category,
      lastModified: Date.now()
    };
  } catch (error) {
    console.error("Error posting quote to server:", error);
    throw error;
  }
}

// Sync quotes with the server
async function syncQuotes() {
  try {
    // Step 1: Fetch latest quotes from the server
    const serverQuotes = await fetchQuotesFromServer();

    // Step 2: Merge server data with local data
    const mergedQuotes = mergeLocalAndServerData(quotes, serverQuotes);

    // Step 3: Replace local data with merged result
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    notifyUser("Quotes synced with server.");

    // Step 4: Post any new local-only quotes to the server
    const localOnlyQuotes = quotes.filter(q => q.localOnly);
    for (const quote of localOnlyQuotes) {
      try {
        const serverResponse = await postQuoteToServer(quote);
        quote.id = serverResponse.id; // Update local ID with server ID
        delete quote.localOnly; // Remove localOnly flag
      } catch (error) {
        notifyUser(`Failed to sync new quote: ${quote.text}`, true);
      }
    }

  } catch (err) {
    notifyUser("Failed to sync with server.", true);
    console.error("Sync failed:", err);
  }
}

// Conflict resolution strategy: server wins
function mergeLocalAndServerData(local, remote) {
  const map = new Map();

  [...local, ...remote].forEach(quote => {
    const key = quote.id;

    if (!map.has(key)) {
      map.set(key, quote);
    } else {
      const existing = map.get(key);
      if (quote.lastModified > existing.lastModified) {
        map.set(key, quote); // server version is newer
      }
    }
  });

  return Array.from(map.values());
}

// Notify user of sync events
function notifyUser(message, isError = false) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = "notification" + (isError ? " error" : "");
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// Event listener for manual sync
document.getElementById("syncButton").addEventListener("click", syncQuotes);

// Initialize app
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes(); // This will also call showRandomQuote()
};
