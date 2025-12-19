// API 連結
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// 抓取 HTML 元素
const resultContainer = document.getElementById("result");
const messageArea = document.getElementById("message-area");
const randomBtn = document.getElementById("random-btn");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

// 按鈕點擊
randomBtn.addEventListener("click", getRandomRecipe);

// 抓隨機食譜
async function getRandomRecipe() {
  showMessage("Finding a random recipe for you...", false, true);
  resultContainer.innerHTML = "";

  try {
    const res = await fetch(RANDOM_API_URL);
    const data = await res.json();
    clearMessage();

    if (data.meals && data.meals.length > 0) {
      displayRandomRecipe(data.meals[0]);
    } else {
      showMessage("No recipe found.", true);
    }
  } catch {
    showMessage("Something went wrong.", true);
  }
}

// 顯示卡片
function displayRandomRecipe(recipe) {
  const card = document.createElement("div");
  card.classList.add("recipe-item");
  card.dataset.id = recipe.idMeal;

  card.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <h3>${recipe.strMeal}</h3>
    <button class="add-favorite-btn">⭐</button>
  `;

  // 開 modal
  card.addEventListener("click", () => getRecipeDetails(recipe.idMeal));

  // 收藏
  card.querySelector(".add-favorite-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      showFloatingMessage("Please log in first!", "error");
      return;
    }

    try {
      const res = await fetch("/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          recipeId: recipe.idMeal,
          title: recipe.strMeal,
          thumbnail: recipe.strMealThumb,
        }),
      });

      const data = await res.json();
      if (data.success) showFloatingMessage("Added to favorites!", "success");
      else showFloatingMessage(data.message, "error");
    } catch {
      showFloatingMessage("Failed to add favorite.", "error");
    }
  });

  resultContainer.appendChild(card);
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

// 顯示懸浮提示字框
function showFloatingMessage(message, type = "success", duration = 3000) {
  const msgDiv = document.getElementById("floating-message");
  msgDiv.textContent = message;

  // 先移除舊的 class 再加上新的
  msgDiv.className = "floating-message show";
  msgDiv.classList.add(type);

  // 自動消失
  setTimeout(() => {
    msgDiv.classList.remove("show");
  }, duration);
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

// 關閉按鈕點擊
modalCloseBtn.addEventListener("click", closeModal);

// 彈出視窗背景點擊
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
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
    ? `<h3>Recipe Source</h3><div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
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