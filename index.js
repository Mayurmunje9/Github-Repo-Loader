document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  const removeUser=document.getElementById("remove-user")
  const repositoriesContainer = document.getElementById("repositories");
  const paginationContainer = document.getElementById("pagination");
  const search = document.getElementById("search");
  //   const name = document.getElementById("name");
  const userInfoDiv = document.getElementById("userInfo");

  const avtar = document.getElementById("avtar-img");

  let username = document.getElementById("username");
  let siteload=0;
  // Add click event listener to the search button
  search.addEventListener("click", () => {
    fetchRepositories(username.value, 1, 10);
    username.value = "";
  });

  // Add keydown event listener to the username input
  username.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      // If Enter key is pressed, trigger the search function
      fetchRepositories(username.value, 1, 10);
      username.value = "";
    }
  });

  // Function to show loader
  function showLoader() {
    loader.style.display = "block";
  }

  // Function to hide loader
  function hideLoader() {
    loader.style.display = "none";
  }

 // Function to show user does not exist
function showUserDoesNotExist() {
  repositoriesContainer.innerHTML = "";
  avtar.src = "";
  paginationContainer.innerHTML = "";
  const error = document.createElement("h1");
  error.innerHTML = "User does not exist";
  repositoriesContainer.appendChild(error);
  userInfoDiv.innerHTML = "";
}

// Function to fetch GitHub repositories
async function fetchRepositories(username, page = 1, perPage = 10) {
  showLoader();

  // Make API call to fetch repositories
  const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`;
  const userDetailsUrl = `https://api.github.com/users/${username}`;

  const accessToken = "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";

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (siteload>0){

        console.log(siteload)
        showUserDoesNotExist()
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Fetch user details
    const userDetailsResponse = await fetch(userDetailsUrl);
    if (!userDetailsResponse.ok) {
      if (siteload>0){

        showUserDoesNotExist()
        console.log(siteload)
      }
      
      throw new Error(`HTTP error! Status: ${userDetailsResponse.status}`);
    }
    const userDetailsData = await userDetailsResponse.json();

    // Update avatar source with user details avatar_url
    avtar.src = userDetailsData.avatar_url;

    hideLoader();
    siteload++
    // Render repositories
    renderRepositories(data, userDetailsData);

    // Render pagination
    renderPagination(username, page, perPage, response.headers.get("link"));
  } catch (error) {
    hideLoader();
    console.error("Error fetching repositories:", error);
  }
}


  function getUserDetails(userDetailsData){
    userInfoDiv.innerHTML=""
    const userInfo = document.createElement("h1");
    userInfo.innerHTML = userDetailsData.login;
    userInfoDiv.appendChild(userInfo);
  }
  // Function to render repositories
  function renderRepositories(repositories, userDetailsData) {
    repositoriesContainer.innerHTML = "";
 
    getUserDetails(userDetailsData);
   

    repositories.forEach((repo) => {
      const repoElement = document.createElement("div");
      repositoriesContainer.appendChild(repoElement);

      repoElement.classList.add("card", "col-md-5", "mx-3","my-2");

      // Populate the card with repository info
      repoElement.innerHTML = `
        
        <div class="card-body">
          <h5 class="card-title" id="cardTitle">${repo.name}</h5>
          <p class="card-text">${
            repo.description || "No description available"
          }</p>
          <a href="${
            repo.html_url
          }" class="btn btn-primary">Go to repository</a>
        </div>
      `;
    });
  }

// Function to render pagination
function renderPagination(username, currentPage, perPage, linkHeader) {
    paginationContainer.innerHTML = "";
  
    if (linkHeader) {
      const links = linkHeader.split(",");
      const hasNextPage = links.some((link) => link.includes('rel="next"'));
      const hasPrevPage = links.some((link) => link.includes('rel="prev"'));
  
      if (hasPrevPage) {
        const prevButton = document.createElement("button");
        prevButton.classList.add("btn","btn-primary","prev")
        prevButton.innerText = " Previous";
        prevButton.disabled = currentPage === 1;
  
        // Add event listener to fetch repositories for the previous page
        prevButton.addEventListener("click", () =>
          fetchRepositories(username, currentPage - 1, perPage)
        );
  
        paginationContainer.appendChild(prevButton);
      }
  
      if (hasNextPage) {
        const nextButton = document.createElement("button");
        nextButton.classList.add("btn","btn-primary","next")
        nextButton.innerText = `Next `;
  
        // Add event listener to fetch repositories for the next page
        nextButton.addEventListener("click", () =>
          fetchRepositories(username, currentPage + 1, perPage)
        );
  
        paginationContainer.appendChild(nextButton);
      }
    }
  }
  

  // Initial fetch
  const defaultUsername = "esp8266";
  fetchRepositories(username);
});
