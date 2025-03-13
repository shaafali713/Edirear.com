// YouTube API Key
const YOUTUBE_API_KEY = "AIzaSyChm0thF6dU-MW-2_INOGRDwcfsn0mjO7E";

// YouTube Analytics API Key
const YOUTUBE_ANALYTICS_API_KEY = "AIzaSyCiq0NgOt5umb1eGG1mhuKb9L5AizdLdeQ";

// Cloudinary Credentials
const CLOUDINARY_CLOUD_NAME = "dteadbaf3";
const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset"; // Replace with your Cloudinary upload preset

// DOM Elements
const videoGrid = document.getElementById("video-grid");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const uploadForm = document.getElementById("upload-form");
const videoFileInput = document.getElementById("video-file");
const videoTitleInput = document.getElementById("video-title");
const videoDescriptionInput = document.getElementById("video-description");
const videoPlayerModal = document.getElementById("video-player-modal");
const videoPlayer = document.getElementById("video-player");
const videoPlayerTitle = document.getElementById("video-player-title");
const videoPlayerDescription = document.getElementById("video-player-description");
const closeModal = document.querySelector(".close-modal");
const likeButton = document.getElementById("like-button");
const subscribeButton = document.getElementById("subscribe-button");
const subscriptionList = document.getElementById("subscription-list");
const watchHistory = document.getElementById("watch-history");
const likedVideos = document.getElementById("liked-videos");
const analyticsContainer = document.getElementById("analytics-container");

// Data Storage
let subscriptions = [];
let watchHistoryData = [];
let likedVideosData = [];

// Facebook Login
document.getElementById("login-button").addEventListener("click", () => {
  FB.login(
    function (response) {
      if (response.authResponse) {
        console.log("Welcome! Fetching your information....");
        FB.api("/me", function (response) {
          console.log("Good to see you, " + response.name + ".");
        });
      } else {
        console.log("User cancelled login or did not fully authorize.");
      }
    },
    { scope: "public_profile,email" }
  );
});

// Fetch YouTube Videos
async function fetchYouTubeVideos(query = "trending") {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=20&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  displayVideos(data.items);
}

// Display Videos
function displayVideos(videos) {
  videoGrid.innerHTML = "";
  videos.forEach((video) => {
    const videoCard = document.createElement("div");
    videoCard.className = "video-card";
    videoCard.innerHTML = `
      <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
      <h3>${video.snippet.title}</h3>
    `;
    videoCard.addEventListener("click", () => {
      openVideoPlayer(video.id.videoId, video.snippet.title, video.snippet.description);
      addToWatchHistory(video);
      fetchVideoAnalytics(video.id.videoId); // Fetch analytics for the video
    });
    videoGrid.appendChild(videoCard);
  });
}

// Open Video Player
function openVideoPlayer(videoId, title, description) {
  videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
  videoPlayerTitle.textContent = title;
  videoPlayerDescription.textContent = description;
  videoPlayerModal.style.display = "block";
}

// Close Video Player
closeModal.addEventListener("click", () => {
  videoPlayerModal.style.display = "none";
  videoPlayer.src = ""; // Stop the video
});

// Search Videos
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchYouTubeVideos(query);
  }
});

// Upload Video to Cloudinary
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = videoFileInput.files[0];
  const title = videoTitleInput.value;
  const description = videoDescriptionInput.value;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();
  console.log("Video uploaded:", data.secure_url);
});

// Add to Watch History
function addToWatchHistory(video) {
  watchHistoryData.push(video);
  updateWatchHistory();
}

// Update Watch History
function updateWatchHistory() {
  watchHistory.innerHTML = "";
  watchHistoryData.forEach((video) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
      <h3>${video.snippet.title}</h3>
    `;
    watchHistory.appendChild(historyItem);
  });
}

// Add to Liked Videos
likeButton.addEventListener("click", () => {
  const currentVideo = {
    id: videoPlayer.src.split("/embed/")[1],
    title: videoPlayerTitle.textContent,
    description: videoPlayerDescription.textContent,
  };
  likedVideosData.push(currentVideo);
  updateLikedVideos();
});

// Update Liked Videos
function updateLikedVideos() {
  likedVideos.innerHTML = "";
  likedVideosData.forEach((video) => {
    const likedItem = document.createElement("div");
    likedItem.className = "liked-item";
    likedItem.innerHTML = `
      <h3>${video.title}</h3>
      <p>${video.description}</p>
    `;
    likedVideos.appendChild(likedItem);
  });
}

// Subscribe to Channel
subscribeButton.addEventListener("click", () => {
  const channelName = videoPlayerTitle.textContent.split(" - ")[0]; // Extract channel name
  if (!subscriptions.includes(channelName)) {
    subscriptions.push(channelName);
    updateSubscriptions();
  }
});

// Update Subscriptions
function updateSubscriptions() {
  subscriptionList.innerHTML = "";
  subscriptions.forEach((channel) => {
    const subscriptionItem = document.createElement("div");
    subscriptionItem.className = "subscription-item";
    subscriptionItem.textContent = channel;
    subscriptionList.appendChild(subscriptionItem);
  });
}

// Fetch Video Analytics
async function fetchVideoAnalytics(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_ANALYTICS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const statistics = data.items[0].statistics;
  displayVideoAnalytics(statistics);
}

// Display Video Analytics
function displayVideoAnalytics(statistics) {
  analyticsContainer.innerHTML = `
    <h3>Video Analytics</h3>
    <p>Views: ${statistics.viewCount}</p>
    <p>Likes: ${statistics.likeCount}</p>
    <p>Comments: ${statistics.commentCount}</p>
  `;
}

// Initialize
fetchYouTubeVideos();
document.addEventListener("DOMContentLoaded", function () {
  const pages = document.querySelectorAll(".page");
  const navButtons = document.querySelectorAll(".nav-button");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const uploadForm = document.getElementById("upload-form");
  const uploadStatus = document.getElementById("upload-status");
  const videoGrid = document.getElementById("video-grid");

  // Navigation Handling
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetPage = this.getAttribute("data-page");
      pages.forEach((page) => page.classList.remove("active"));
      document.getElementById(targetPage).classList.add("active");
    });
  });

  // Search Functionality
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      alert("Searching for: " + query);
    }
  });

  // Upload Video (Simulation)
  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();
    uploadStatus.textContent = "Uploading...";
    setTimeout(() => {
      uploadStatus.textContent = "Upload successful!";
    }, 2000);
  });

  // Load Dummy Videos
  function loadVideos() {
    videoGrid.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.innerHTML = `<h3>Video ${i}</h3>`;
      videoGrid.appendChild(videoCard);
    }
  }
  loadVideos();
});