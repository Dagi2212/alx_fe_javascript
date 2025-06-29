// Load quotes from localStorage or initialize an empty array
let quotes = [];

// Load saved quotes on page load
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Store last viewed quote in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));

  const quoteParagraph = document.createElement("p");
  quoteParagraph.textContent = `"${quote.text}"`;

  const categoryElement = document.createElement("small");
  categoryElement.textContent = `— ${quote.category}`;

  quoteDisplay.innerHTML = "";
  quoteDisplay.appendChild(quoteParagraph);
  quoteDisplay.appendChild(categoryElement);
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Both quote and category are required!");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  alert(`New quote added to "${newCategory}" category.`);
}

// Export quotes to JSON file
function exportToJsonFile() {
  if (quotes.length === 0) {
    alert("No quotes to export.");
    return;
  }

  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      // Validate imported data
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert(`${importedQuotes.length} quote(s) imported successfully!`);
        showRandomQuote(); // Show one of the new quotes
      } else {
        alert("Invalid JSON format. Please ensure the file contains an array of quote objects with 'text' and 'category'.");
      }
    } catch (error) {
      alert("Error reading JSON file: " + error.message);
    }
  };

  fileReader.readAsText(file);
}

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize app
window.onload = () => {
  loadQuotes();
  showRandomQuote();
};
