// // Example content script that does something on pages with <article>
// // You can remove or modify this if you wish.

// const article = document.querySelector("article");
// if (article) {
//   const text = article.textContent;
//   const wordCount = (text.match(/[^\s]+/g) || []).length;
//   const readingTime = Math.round(wordCount / 200);

//   const badge = document.createElement("p");
//   badge.classList.add("color-secondary-text", "type--caption");
//   badge.textContent = `⏱️ ${readingTime} min read`;

//   const heading = article.querySelector("h1");
//   const date = article.querySelector("time")?.parentNode;
//   (date ?? heading)?.insertAdjacentElement("afterend", badge);
// }
// Example content script that processes <article> content
const article = document.querySelector("article");
if (article) {
  const text = article.textContent;
  const wordCount = (text.match(/[^\s]+/g) || []).length;
  const readingTime = Math.round(wordCount / 200);

  const badge = document.createElement("p");
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  const heading = article.querySelector("h1");
  const date = article.querySelector("time")?.parentNode;
  (date ?? heading)?.insertAdjacentElement("afterend", badge);
}
