import { CONFIG } from "./config.js";

// Fetch books from the API by URL
export function fetchBooks(url) {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error("Error fetching books:", error));
}

// Toggle wishlist - add/remove book ID from localStorage
export function toggleWishlist(bookId) {
  const wishlistedBooks = getWishlist();

  const updatedWishlist = wishlistedBooks.includes(bookId)
    ? wishlistedBooks.filter((id) => id !== bookId)
    : [...wishlistedBooks, bookId];

  localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  updateWishlistCount();
  displayWishlist();
}

// Get current wishlist from localStorage
export function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

// Display books in a list, used for both main page and wishlist
export function displayBooks(books, containerId) {
  const bookList = document.getElementById(containerId);
  bookList.innerHTML = "";

  books.forEach((book) => {
    const bookItem = createBookItem(book);
    bookList.appendChild(bookItem);
  });

  // Add event listener for wishlist buttons
  document.querySelectorAll(".wishlist").forEach((btn) => {
    btn.addEventListener("click", handleWishlistToggle);
  });
}

// Create individual book item element
function createBookItem(book) {
  const bookItem = document.createElement("div");
  bookItem.classList.add("book-item");

  const bookImage =
    book.formats["image/jpeg"] || "https://via.placeholder.com/150";
  const bookAuthors = book.authors.map((author) => author.name).join(", ");
  const bookSubjects = book.subjects.join(", ");
  const isWishlisted = getWishlist().includes(book.id);

  bookItem.innerHTML = `
    <div>
      <img src="${bookImage}" alt="${book.title}">
      <h5>${book.title}</h5>
      <p>Author: ${bookAuthors}</p>
      <p>Genre: ${bookSubjects}</p>
    </div>
    <div>
      <button data-book-id="${book.id}" class="wishlist ${
    isWishlisted ? "active" : ""
  }"> ♥ </button>
      <a href="book-details.html?id=${book.id}" class="btn">View Details</a>
    </div>
  `;
  return bookItem;
}

// Handle wishlist toggle event
function handleWishlistToggle(e) {
  const bookId = e.target.dataset.bookId;
  toggleWishlist(Number(bookId));
  e.target.classList.toggle("active");
}

// Update wishlist count
export function updateWishlistCount() {
  document.getElementById("wishlistCount").textContent = getWishlist().length;
}

// Display wishlist
export function displayWishlist() {
  const wishlist = getWishlist();
  const wishlistContainer = document.getElementById("wishlist");

  if (!wishlistContainer) {
    return;
  }

  if (!wishlist.length) {
    wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
    hideLoader("wishlist");
    return;
  }

  // Fetch and display books in the wishlist
  Promise.all(
    wishlist.map((bookId) => fetchBooks(`${CONFIG?.API_URL}/${bookId}`))
  )
    .then((books) => {
      showLoader("wishlist");
      displayBooks(books, "wishlist");
    })
    .catch(() => {
      showError("Failed to load books.", "wishlist");
    })
    .finally(() => {
      hideLoader("wishlist");
    });
}

// Show loader
export function showLoader(containerId) {
  document.getElementById("loader").style.display = "block";
  document.getElementById(containerId).style.display = "none";
}

// Hide loader
export function hideLoader(containerId) {
  document.getElementById("loader").style.display = "none";
  document.getElementById(containerId).style.display = "grid";
}

// Show error message
export function showError(message, containerId) {
  document.getElementById(containerId).innerHTML = `<p>${message}</p>`;
}
