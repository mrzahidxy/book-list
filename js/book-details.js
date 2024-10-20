import { getWishlist, toggleWishlist, fetchBooks, showLoader, hideLoader, showError } from "./utils.js";
import { CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  updateWishlistCount();
  showLoader("book-details-container");
  displayBookDetails();
});

// Update the wishlist count display
function updateWishlistCount() {
  document.getElementById("wishlistCount").textContent = getWishlist().length;
}

// Fetch and display book details
async function displayBookDetails() {
  const bookId = getBookIdFromURL();

  if (!bookId) return showError("Book not found.", "book-details-container");

  try {
    const book = await fetchBooks(`${CONFIG.API_URL}/${bookId}`);
    renderBookDetails(book);
  } catch {
    showError("Failed to load book details.", "book-details-container");
  } finally {
    hideLoader("book-details-container");
  }
}

// Get the book ID from the URL parameters
function getBookIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

// Render book details in the DOM
function renderBookDetails(book) {
  const isWishlisted = getWishlist().includes(book.id);
  document.getElementById("book-details").innerHTML = generateBookDetailsHTML(book, isWishlisted);
  attachWishlistButtonHandler(book.id);
}

// Generate the HTML for book details
function generateBookDetailsHTML(book, isWishlisted) {
  const { formats, title, authors, subjects, download_count, languages } = book;
  return `
    <div class="book-detail-item">
      <img src="${formats["image/jpeg"] || "https://via.placeholder.com/150"}" alt="${title}">
      <h1>${title}</h1>
      <p><strong>Author:</strong> ${authors.map(author => author.name).join(", ")}</p>
      <p><strong>Genre:</strong> ${subjects.join(", ")}</p>
      <p><strong>Download Count:</strong> ${download_count}</p>
      <p><strong>Languages:</strong> ${languages.join(", ")}</p>
      <button id="wishlistButton" class="btn">${isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}</button>
    </div>
  `;
}

// Attach event handler for the wishlist button
function attachWishlistButtonHandler(bookId) {
  const wishlistButton = document.getElementById("wishlistButton");

  wishlistButton?.addEventListener("click", () => {
    toggleWishlist(bookId);
    updateWishlistButtonText(bookId);
    updateWishlistCount();
  });
}

// Update the wishlist button text based on the current state
function updateWishlistButtonText(bookId) {
  const isWishlisted = getWishlist().includes(bookId);
  const wishlistButton = document.getElementById("wishlistButton");
  if (wishlistButton) {
    wishlistButton.textContent = isWishlisted ? "Remove from Wishlist" : "Add to Wishlist";
  }
}
