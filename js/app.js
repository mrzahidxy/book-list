import {
  fetchBooks,
  displayBooks,
  showLoader,
  hideLoader,
  showError,
  updateWishlistCount,
} from "./utils.js";
import { CONFIG } from "./config.js";

let books = [];
let nextPage = null;
let prevPage = null;

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  loadBooks(CONFIG.API_URL);
  addEventListeners();
  updateWishlistCount();
}

// Load books and update the UI
function loadBooks(url) {
  showLoader("book-list");
  fetchBooks(url)
    .then((data) => {
      updateBookData(data);
      hideLoader("book-list");
    })
    .catch(handleFetchError);
}

// Add all necessary event listeners
function addEventListeners() {
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("genreDropdown")
    .addEventListener("change", filterByGenre);
  document
    .getElementById("clearFilterBtn")
    .addEventListener("click", clearFilters);
  document
    .getElementById("nextBtn")
    .addEventListener("click", () => handlePagination(nextPage, "nextBtn"));
  document
    .getElementById("prevBtn")
    .addEventListener("click", () => handlePagination(prevPage, "prevBtn"));
}

// Handle errors during fetch
function handleFetchError(error) {
  console.error("Error fetching books:", error);
  showError("Failed to load books.", "book-list");
  hideLoader("book-list");
}

// Update books data and pagination, then display
function updateBookData(data) {
  ({ results: books, next: nextPage, previous: prevPage } = data);
  displayBooks(books, "book-list");
  populateGenres(books);
  toggleButtonState("prevBtn", prevPage);
  toggleButtonState("nextBtn", nextPage);
}

// Handle search input
function handleSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  loadBooks(`${CONFIG.API_URL}?search=${query}`);
}

// Handle genre filtering
function filterByGenre() {
  const genre = document.getElementById("genreDropdown").value;
  const filteredBooks = genre
    ? books.filter((book) => book.subjects.includes(genre))
    : books;
  displayBooks(filteredBooks, "book-list");
}

// Clear filters (search and genre)
function clearFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("genreDropdown").value = "";
  displayBooks(books, "book-list");
}

// Handle pagination
function handlePagination(pageUrl, buttonId) {
  if (!pageUrl) return;

  const button = document.getElementById(buttonId);
  toggleButtonLoader(button, true);
  fetchBooks(pageUrl)
    .then((data) => {
      updateBookData(data);
      toggleButtonLoader(button, false);
    })
    .catch((error) => {
      handleFetchError(error);
      toggleButtonLoader(button, false);
    });
}

// Populate genres in the dropdown
function populateGenres(books) {
  const genres = [...new Set(books.flatMap((book) => book.subjects))];
  const genreDropdown = document.getElementById("genreDropdown");
  genreDropdown.innerHTML = '<option value="">All Genres</option>';
  genres.forEach((genre) => {
    genreDropdown.innerHTML += `<option value="${genre}">${genre}</option>`;
  });
}

// Toggle button state (enable/disable)
function toggleButtonState(buttonId, state) {
  document.getElementById(buttonId).disabled = !state;
}

// Toggle loader on specific button
function toggleButtonLoader(button, isLoading) {
  button.disabled = isLoading;
  button.innerHTML = isLoading
    ? '<span class="button-loader"></span> Loading...'
    : button.id === "nextBtn"
    ? "Next"
    : "Previous";
}
