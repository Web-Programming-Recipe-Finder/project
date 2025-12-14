document.addEventListener("DOMContentLoaded", loadFavorites);

const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");
const messageArea = document.getElementById("message-area");
const resultsGrid = document.getElementById("results-grid");

// 載入收藏清單
async function loadFavorites() {
  const token = localStorage.getItem("token");

  if (!token) {
    showMessage("Please log in to view favorites.");
    resultsGrid.innerHTML = ""; // 清空結果格子
    return;
  }

  try {
    const res = await fetch("/favorites/list", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();

    if (!data.success || data.favorites.length === 0) {
      showMessage("No favorites yet.");
      resultsGrid.innerHTML = ""; // 清空結果格子
      return;
    }

    // 顯示收藏清單
    showMessage("Loading your favorites...", false, true);
    resultsGrid.innerHTML = "";

    data.favorites.forEach((fav) => {
      const div = document.createElement("div");
      div.classList.add("recipe-item"); 
      div.dataset.id = fav.recipeId;

      div.innerHTML = `
        <img src="${fav.thumbnail}" alt="${fav.title}" loading="lazy">
        <h3>${fav.title}</h3>
        <button class="remove-btn">Remove</button>
      `;

      // 點擊刪除
      div.querySelector(".remove-btn").addEventListener("click", (e) => {
        e.stopPropagation(); 
        removeFavorite(fav.recipeId);
      });

      // 點擊圖片或標題開啟 modal
      div.addEventListener("click", () => getRecipeDetails(fav.recipeId));

      resultsGrid.appendChild(div);
    });

    // 清空訊息
    messageArea.textContent = "";
  } catch (err) {
    showMessage("Failed to load favorites.", true);
    resultsGrid.innerHTML = "";
  }
}

// 刪除收藏
async function removeFavorite(id) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/favorites/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ recipeId: id }),
    });

    const data = await res.json();
    if (data.success) {
      showFloatingMessage("Successfully deleted!", "success");
      loadFavorites();
    } else {
      showFloatingMessage("Failed to remove favorite.", "error");
    }
  } catch (err) {
    showFloatingMessage("Network error, try again.", "error");
  }
}

// 顯示訊息
function showMessage(message, isError = false) {
  messageArea.textContent = message;
  messageArea.className = "message";
  if (isError) messageArea.classList.add("error");
}

// 浮動訊息
function showFloatingMessage(message, type = "success", duration = 3000) {
  const msgDiv = document.getElementById("floating-message");
  msgDiv.textContent = message;
  msgDiv.className = "floating-message show";
  msgDiv.classList.add(type);

  setTimeout(() => {
    msgDiv.classList.remove("show");
  }, duration);
}

// Modal 開關
function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalCloseBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// 抓取單一食譜詳細資料
async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    if (!response.ok) throw new Error("Failed to fetch recipe details.");
    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML = '<p class="message error">Could not load recipe details.</p>';
    }
  } catch (error) {
    modalContent.innerHTML =
      '<p class="message error">Failed to load recipe details. Check your connection or try again.</p>';
  }
}

// 顯示詳細資料
function displayRecipeDetails(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();
    if (ingredient) ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    else break;
  }

  modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    ${recipe.strCategory ? `<h3>Category: ${recipe.strCategory}</h3>` : ""}
    ${recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : ""}
    ${ingredients.length ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>` : ""}
    <h3>Instructions</h3>
    <p>${recipe.strInstructions ? recipe.strInstructions.replace(/\r?\n/g, "<br>") : "Instructions not available."}</p>
    ${recipe.strYoutube ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a></div>` : ""}
    ${recipe.strSource ? `<h3>Recipe Source</h3><div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>` : ""}
  `;
}
