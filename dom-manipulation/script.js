// Initial quote array with categories
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
];

const quoteDisplay = document.getElementById("quoteDisplay");

// Function to display a random quote from the quotes array
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Create elements dynamically
  const quoteParagraph = document.createElement("p");
  quoteParagraph.textContent = `"${quote.text}"`;

  const categoryElement = document.createElement("small");
  categoryElement.textContent = `— ${quote.category}`;

  // Clear previous content and append new quote
  quoteDisplay.innerHTML = "";
  quoteDisplay.appendChild(quoteParagraph);
  quoteDisplay.appendChild(categoryElement);
}

// Function to add a new quote from user input
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Both quote and category are required!");
    return;
  }

  // Add new quote to the array
  quotes.push({ text: newText, category: newCategory });

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  // Optionally show success message or updated count
  alert(`New quote added to "${newCategory}" category.`);
}

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Automatically show a quote when the page loads
window.onload = showRandomQuote;
