function login() {
  const password = document.getElementById("admin-password").value;
  fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
        loadFeedbacks();
      } else {
        document.getElementById("login-message").textContent = data.message;
      }
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      document.getElementById("login-message").textContent =
        "Terjadi kesalahan saat login.";
    });
}

function logout() {
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("admin-password").value = "";
  document.getElementById("login-message").textContent = "";
}

function loadFeedbacks() {
  fetch("/api/feedback")
    .then((response) => response.json())
    .then((feedbacks) => {
      displayFeedbacks(feedbacks);
    })
    .catch((error) => {
      console.error("Error loading feedbacks:", error);
    });
}

function displayFeedbacks(feedbacks) {
  const feedbackList = document.getElementById("feedback-list-admin");
  feedbackList.innerHTML = "";

  feedbacks.forEach((fb) => {
    const div = document.createElement("div");
    div.className = "saved-feedback-item";
    div.innerHTML = `
      <p><strong>ID:</strong> ${fb.id}</p>
      <p><strong>Nama:</strong> ${fb.name}</p>
      <p><strong>Rating:</strong> ${fb.rating} bintang</p>
      <p><strong>Kritik/Saran:</strong> ${fb.text}</p>
      <p><small>${fb.timestamp}</small></p>
      <button onclick="deleteFeedback(${fb.id})">Hapus</button>
      <hr>
    `;
    feedbackList.appendChild(div);
  });
}

function deleteFeedback(id) {
  if (confirm("Apakah Anda yakin ingin menghapus feedback ini?")) {
    fetch(`/api/admin/feedback/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadFeedbacks(); // Reload feedbacks after deletion
        } else {
          alert("Gagal menghapus feedback.");
        }
      })
      .catch((error) => {
        console.error("Error deleting feedback:", error);
        alert("Terjadi kesalahan saat menghapus feedback.");
      });
  }
}
