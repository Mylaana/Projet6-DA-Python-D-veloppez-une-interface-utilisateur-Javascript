const urlAPI = "http://localhost:8000/api/v1/";
const categoriesNumber = 4;
const categories = [];
const movieBoxPerCategory = 6;

class Category{
    constructor(selectorIndex, title = "", id = ""){
        this.selector = "category-" + selectorIndex + "__title";
        this.title = title;
        this.id = id;
        this.boxMovieList = []
    }
}
class boxMovie{
    constructor(divSelector, imageSelector){
        this.divSelector = divSelector;
        this.imageSelector = imageSelector
    }
}

async function getDataFromAPI(urlAPI) {
  const response = await fetch(urlAPI);
  return await response.json();
}

function getUserFavouriteCategories(categoriesFromAPI = []){
    // dummy function to simulate user's preferences
    let favouriteCategories = []
    if (categoriesFromAPI == []){
        favouriteCategories = [
            {"name": "default", "id": "0"},
            {"name": "default", "id": "0"}, 
            {"name": "default", "id": "0"}
        ];    
    }else{
        favouriteCategories.push(categoriesFromAPI[0])
        favouriteCategories.push(categoriesFromAPI[2])
        favouriteCategories.push(categoriesFromAPI[4])
    }
    return favouriteCategories
}

function setUpCategories(categoriesListFromAPI){
    let categoriesList = getUserFavouriteCategories(categoriesListFromAPI);
    for (let i = 0; i <= categoriesNumber-1; i++){
        let category = new Category(i);

        if (i == 0){
            category.title = "Films les mieux notés";
        }else{
            category.title = categoriesList[i-1].name;
            category.id = categoriesList[i-1].id;
            console.log(`name: ${categoriesList[i-1].name}  id: ${categoriesList[i-1].id}`)
        }


        let categoryElement = document.querySelector("." + category.selector);
        categoryElement.textContent = category.title;
        categoryElement.id = category.id
        categories.push(category);       
    }
};

function setUpPageStructure(){
    // generates containers selectors for movies
    let movieContainers = document.querySelectorAll(".container-movie");

    for (let i = 0; i<=movieContainers.length -1 ; i++){
        for (let b = 0; b<=movieBoxPerCategory -1; b++){
            // create a new div container for the movie in category

            let movieBox = document.createElement("div");
            movieBox.setAttribute("class", "box-movie");
            movieContainers[i].appendChild(movieBox);

            let movieImage = document.createElement("img");
            movieImage.setAttribute("class", "image-movie")
            movieImage.setAttribute("src", "https://caer.univ-amu.fr/wp-content/uploads/default-placeholder.png")
            movieBox.appendChild(movieImage)

            let box = new boxMovie(movieBox, movieImage)
            categories.push(box)
        };
    };
}

function setUpMoviesInCategory(){
    for (let i in categories){
        if (i == 1){
            let category = categories[i]
            getDataFromAPI(urlAPI + `titles/?genre=${category.title}`).then(function(response){
                console.log(response.results)
            })
        }
    }
};

// main script
setUpPageStructure()
getDataFromAPI(urlAPI + "genres/").then(function (response) {
	// The API call was successful!
	setUpCategories(response.results);
    setUpMoviesInCategory();
}).catch(function (err) {
	// There was an error
	console.log('Could not get categories from API', err);
});

