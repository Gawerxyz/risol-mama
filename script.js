let cart = [];
let total = 0;

// Hide loading screen after animation
window.addEventListener("load", function () {
  setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.classList.add("fade-out");
    // Wait for transition to complete before hiding
    setTimeout(() => {
      loadingScreen.style.display = "none";
      window.scrollTo(0, 0);
      // Start header animation after loading screen is hidden
      const header = document.querySelector("header");
      header.classList.add("header-animate");
      // Start main animation after header animation starts
      setTimeout(() => {
        const main = document.querySelector("main");
        main.classList.add("main-animate");
      }, 1500); // Match header slide in duration
    }, 500); // Match the transition duration
  }, 3000);
});

function addToCart(product, price, delta) {
  const existingItem = cart.find((item) => item.product === product);
  if (existingItem) {
    if (delta < 0 && existingItem.quantity <= 0) return; // Prevent decreasing below 0
    existingItem.quantity += delta;
    if (existingItem.quantity <= 0) {
      cart = cart.filter((item) => item.product !== product);
    }
    total += price * delta;
  } else if (delta > 0) {
    cart.push({ product, price, quantity: delta });
    total += price * delta;
  }
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.quantity} ${item.product} - Rp ${item.price * item.quantity}`;
    cartItems.appendChild(li);
  });
  document.getElementById("total").textContent = total;
  // Update the displayed quantity for each product
  const quantitySpan = document.getElementById(
    `cart-quantity-Risol Mama Original`,
  );
  if (quantitySpan) {
    const item = cart.find((item) => item.product === "Risol Mama Original");
    quantitySpan.textContent = item ? item.quantity : 0;
  }
}

function orderViaWhatsApp() {
  let message;
  if (cart.length === 0) {
    message =
      "Halo, saya ingin memesan risol mayo. Bisa bantu informasikan produk yang tersedia?";
  } else {
    message = "Halo, saya ingin memesan:\n";
    cart.forEach((item) => {
      message += `- ${item.product} x${item.quantity} - Rp ${item.price * item.quantity}\n`;
    });
    message += `Total: Rp ${total}`;
  }

  const phoneNumber = "+62895372286214"; // Ganti dengan nomor WhatsApp Anda
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

let selectedRating = 0;

document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.getAttribute("data-value"));
      updateStars(selectedRating);
    });
  });
});

function updateStars(rating) {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function sendFeedback() {
  const feedbackText = document.getElementById("feedback-text").value.trim();
  const feedbackName = document.getElementById("feedback-name").value.trim();

  if (selectedRating === 0 && feedbackText === "") {
    alert("Silakan beri rating atau tulis kritik/saran Anda!");
    return;
  }

  // Save feedback to database
  saveFeedbackToDatabase(feedbackName, selectedRating, feedbackText);

  // Show success message like professional ecommerce
  alert("Terima kasih atas feedback Anda! Feedback telah tersimpan.");

  // Reset form
  selectedRating = 0;
  updateStars(0);
  document.getElementById("feedback-text").value = "";
  document.getElementById("feedback-name").value = "";
}

function saveFeedbackLocally(rating, text, name) {
  const feedback = {
    rating: rating,
    text: text,
    name: name || "Anonim",
    timestamp: new Date().toLocaleString(),
  };

  let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
  feedbacks.push(feedback);
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

  displaySavedFeedback();
  displayAverageRating();
}

function displaySavedFeedback() {
  const feedbackList = document.getElementById("feedback-list");
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

  feedbackList.innerHTML = "";
  feedbacks.forEach((fb) => {
    const div = document.createElement("div");
    div.className = "saved-feedback-item";
    div.innerHTML = `
      <p><strong>Nama:</strong> ${fb.name}</p>
      <p><strong>Rating:</strong> ${fb.rating} bintang</p>
      <p><strong>Kritik/Saran:</strong> ${fb.text}</p>
      <p><small>${fb.timestamp}</small></p>
      <hr>
    `;
    feedbackList.appendChild(div);
  });
}

// Calculate average rating from saved feedbacks
function calculateAverageRating() {
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
  if (feedbacks.length === 0) return 0;
  const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  return totalRating / feedbacks.length;
}

// Display average rating
function displayAverageRating() {
  const average = calculateAverageRating();
  const averageStarsElement = document.querySelector(".average-stars");
  const averageRatingTextElement = document.querySelector(
    ".average-rating-text",
  );

  if (averageStarsElement && averageRatingTextElement) {
    // Display stars
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= average ? "★" : "☆";
    }
    averageStarsElement.innerHTML = starsHtml;

    // Display text
    averageRatingTextElement.textContent = `(${average.toFixed(1)} dari ${JSON.parse(localStorage.getItem("feedbacks")) || [].length} ulasan)`;
  }
}

// Save feedback to database
function saveFeedbackToDatabase(name, rating, text) {
  const feedback = {
    name: name || "Anonim",
    rating: rating,
    text: text,
    timestamp: new Date().toLocaleString(),
  };

  fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedback),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Feedback saved:", data);
      loadFeedbackFromDatabase(); // Reload feedback after saving
    })
    .catch((error) => {
      console.error("Error saving feedback:", error);
      alert("Gagal menyimpan feedback. Silakan coba lagi.");
    });
}

// Load feedback from database
function loadFeedbackFromDatabase() {
  fetch("/api/feedback")
    .then((response) => response.json())
    .then((feedbacks) => {
      displaySavedFeedbackFromDB(feedbacks);
      displayAverageRatingFromDB(feedbacks);
    })
    .catch((error) => {
      console.error("Error loading feedback:", error);
      // Fallback to localStorage if database fails
      displaySavedFeedback();
      displayAverageRating();
    });
}

// Display feedback from database
function displaySavedFeedbackFromDB(feedbacks) {
  const feedbackList = document.getElementById("feedback-list");

  feedbackList.innerHTML = "";
  feedbacks.forEach((fb) => {
    const div = document.createElement("div");
    div.className = "saved-feedback-item";
    div.innerHTML = `
      <p><strong>Nama:</strong> ${fb.name}</p>
      <p><strong>Rating:</strong> ${fb.rating} bintang</p>
      <p><strong>Kritik/Saran:</strong> ${fb.text}</p>
      <p><small>${fb.timestamp}</small></p>
      <hr>
    `;
    feedbackList.appendChild(div);
  });
}

// Calculate average rating from database feedbacks
function calculateAverageRatingFromDB(feedbacks) {
  if (feedbacks.length === 0) return 0;
  const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  return totalRating / feedbacks.length;
}

// Display average rating from database
function displayAverageRatingFromDB(feedbacks) {
  const average = calculateAverageRatingFromDB(feedbacks);
  const averageStarsElement = document.querySelector(".average-stars");
  const averageRatingTextElement = document.querySelector(
    ".average-rating-text",
  );

  if (averageStarsElement && averageRatingTextElement) {
    // Display stars
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= average ? "★" : "☆";
    }
    averageStarsElement.innerHTML = starsHtml;

    // Display text
    averageRatingTextElement.textContent = `(${average.toFixed(1)} dari ${feedbacks.length} ulasan)`;
  }
}

// Load saved feedback on page load
document.addEventListener("DOMContentLoaded", function () {
  loadFeedbackFromDatabase();
  // Existing star event listeners
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.getAttribute("data-value"));
      updateStars(selectedRating);
    });
  });
});
