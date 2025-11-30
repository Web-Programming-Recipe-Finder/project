// API 連結
const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// 抓取 HTML 元素
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

// 搜尋表單 submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // 阻止頁面重新載入
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    searchRecipes(searchTerm); // 呼叫搜尋功能
  } else {
    showMessage("Please enter a search term", true);
  }
});

// 向 API 搜尋資料
async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = ""; // 清空舊結果

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    clearMessage();
    console.log("data: ", data);

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}",`);
    }
  } catch (error) {
    showMessage("Something went wrong, Please try again.", true);
  }
}

// 顯示提示字框
function showMessage(message, isError = false, isLoading = false) {
  messageArea.textContent = message;
  if (isError) messageArea.classList.add("error"); //錯誤提示 (紅色)
  if (isLoading) messageArea.classList.add("loading"); //載入提示 (淺藍色)
}

// 清除提示字框
function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}

// 將搜尋結果顯示成卡片(DOM)
function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes to display");
    return;
  }

  recipes.forEach(recipe => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe-item");
    recipeDiv.dataset.id = recipe.idMeal; // 儲存食譜 ID

    recipeDiv.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
        <h3>${recipe.strMeal}</h3>
    `;

    resultsGrid.appendChild(recipeDiv);
  });
}

// 開啟食譜卡彈出視窗
function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// 關閉食譜卡彈出視窗
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// 點擊卡片 → 顯示詳細資料
resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");

  if (card) {
    const recipeId = card.dataset.id;
    getRecipeDetails(recipeId);
  }
});

// 抓取單一食譜詳細資料 (利用食譜ID)
async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`);
    if (!response.ok) throw new Error("Failed to fetch recipe details.");
    const data = await response.json();

    console.log("details: ", data);
    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]); // 只取第 0 筆
    } else {
      modalContent.innerHTML =
        '<p class="message error">Could not load recipe details.</p>';
    }
  } catch (error) {
    modalContent.innerHTML =
      '<p class="message error">Failed to load recipe details. Check your connection or try again.</p>';
  }
}

// 關閉按鈕點擊
modalCloseBtn.addEventListener("click", closeModal);

// 彈出視窗背景點擊
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// 顯示詳細資料在彈出視窗
function displayRecipeDetails(recipe) {
  const ingredients = [];

  // 收集所有食材 + 份量
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    } else {
      break; // 沒食材就停止
    }
  }

   // 依照資料是否存在決定是否顯示
  const categoryHTML = recipe.strCategory
    ? `<h3>Category: ${recipe.strCategory}</h3>`
    : "";
  const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
  const ingredientsHTML = ingredients.length
    ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>`
    : "";
  const instructionsHTML = `<h3>Instructions</h3><p>${
    recipe.strInstructions
      ? recipe.strInstructions.replace(/\r?\n/g, "<br>")
      : "Instructions not available."
  }</p>`;
  const youtubeHTML = recipe.strYoutube
    ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a><div>`
    : "";
  const sourcHTML = recipe.strSource
    ? `<div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
    : "";

  // 填入資料
  modalContent.innerHTML = `
  <h2>${recipe.strMeal}</h2>
  <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
  ${categoryHTML}
  ${areaHTML}
  ${ingredientsHTML}
  ${instructionsHTML}
  ${youtubeHTML}
  ${sourcHTML}
  `;
}