// // popup.js
// document.addEventListener("DOMContentLoaded", function() {
//   const darkModeButton = document.getElementById("darkmodebutton");

//   // Load saved dark mode state
//   chrome.storage.sync.get("darkMode", function(data) {
//     if (data.darkMode) {
//       document.body.classList.add("dark-mode");
//     }
//   });

//   // Toggle dark mode
//   darkModeButton?.addEventListener("click", function() {
//     if (document.body.classList.contains("dark-mode")) {
//       document.body.classList.remove("dark-mode");
//       chrome.storage.sync.set({ darkMode: false });
//     } else {
//       document.body.classList.add("dark-mode");
//       chrome.storage.sync.set({ darkMode: true });
//     }
//   });
// });
document.addEventListener("DOMContentLoaded", function() {
  const darkModeButton = document.getElementById("darkmodebutton");

  // Load saved dark mode preference
  chrome.storage.sync.get("darkMode", function(data) {
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
    }
  });

  // Toggle dark mode on click
  darkModeButton?.addEventListener("click", function() {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      chrome.storage.sync.set({ darkMode: false });
    } else {
      document.body.classList.add("dark-mode");
      chrome.storage.sync.set({ darkMode: true });
    }
  });
});
