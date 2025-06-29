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

// Populate categories in dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options except 'All Categories'
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Sort alphabetically
  categories.sort();

  // Add each category as option
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore previously selected filter
  const lastFilter = localStorage.getItem("lastFilter") || "all";
  categoryFilter.value = lastFilter;

  // Apply filter again after updating categories
  filterQuotes();
}

// Show random quote from filtered list
let filteredQuotes = [];

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  // Update localStorage
  localStorage.setItem("lastFilter", selectedCategory);

  // Filter quotes
  if (selectedCategory === "all") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  // Show a random quote from filtered list
  showRandomQuote();
}

// Show random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes match this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

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

  // Repopulate categories in case a new one was added
  populateCategories();

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
        populateCategories(); // Refresh categories
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
  populateCategories();
  filterQuotes(); // This will also call showRandomQuote()
};
