const urlAPI = "http://localhost:8000/api/v1/";
const categoriesNumber = 4;
const categories = [];
const movieBoxPerCategory = 5;

class Category{
    defaultMovieLink = "https://caer.univ-amu.fr/wp-content/uploads/default-placeholder.png";
    
    constructor(selectorIndex){
        // class references to selector
        this.sectionSelector = document.querySelector(".category-" + selectorIndex);
        this.titleSelector = document.querySelector(".category-" + selectorIndex + "__title");
        this.movieContainerSelector = this.sectionSelector.querySelector('.container-movie');
        this.caroussel = this.sectionSelector.querySelector(".caroussel");
        
        // buttons
        this.buttonPrevious = this.caroussel.querySelector(".btn-previous");
        this.buttonNext = this.caroussel.querySelector(".btn-next");

        this.buttonPrevious.addEventListener("click", this.clickPrevious.bind(this));
        this.buttonNext.addEventListener("click", this.clickNext.bind(this));

        this.id = null;
        this.title = null;
        this.fetchResponse = null; //type : Promise
        this.boxMovieList = [];
    }
    setTitle(title){
        this.title = title;
        this.titleSelector.textContent = title
    };
    createBoxContainer(){
        let movieBox = document.createElement("div");
        movieBox.setAttribute("class", "box-movie");
        this.movieContainerSelector.appendChild(movieBox);

        let movieImage = document.createElement("img");
        movieImage.setAttribute("class", "image-movie");
        movieImage.setAttribute("src", this.defaultMovieLink);
        movieBox.appendChild(movieImage);

        let box = new boxMovie(movieBox, movieImage);
        this.boxMovieList.push(box);
    }
    setFetchResult(fetchResponse){
        this.fetchResponse = fetchResponse
        this.displayMovieGroup(fetchResponse.results)
    }
    displayMovieGroup(promiseResultList){
        for (i in this.boxMovieList){
            let movieBox = this.boxMovieList[i];
            if (i <= promiseResultList.length - 1){
                movieBox.imageSelector.setAttribute("src", promiseResultList[i].image_url);
            }
        }
    }
    clickNext(){
        if (this.fetchResponse.next != null){
            getDataFromAPI(this.fetchResponse.next)
            .then((response) => {
                this.setFetchResult(response);
            })
        }
    }
    clickPrevious(){
        if (this.fetchResponse.previous != null){
            getDataFromAPI(this.fetchResponse.previous)
            .then((response) => {
                this.setFetchResult(response);
            })
        }
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
        favouriteCategories.push(categoriesFromAPI[1])
        favouriteCategories.push(categoriesFromAPI[3])
    }
    return favouriteCategories
}

function setUpCategories(categoriesListFromAPI){
    let categoriesList = getUserFavouriteCategories(categoriesListFromAPI);
    for (let i = 0; i <= categoriesNumber-1; i++){
        let category = new Category(i);

        if (i == 0){
            category.setTitle("Films les mieux notés");
        }else{
            category.setTitle(categoriesList[i-1].name);
            category.id = categoriesList[i-1].id;
        }
        categories.push(category);       
    }
};

function setUpMoviesInCategory(){
    for (let i in categories){
        if (i != 0){
            let category = categories[i]
            getDataFromAPI(urlAPI + `titles/?genre=${category.title}`)
            .then(function(response){
                category.setFetchResult(response)
            })
        }
    }
};

// page initialization
getDataFromAPI(urlAPI + "genres/")
.then(function (response) {
	setUpCategories(response.results);

    //setup page structure
    for (i in categories){
        let category = categories[i];
        for (let b = 0; b<=movieBoxPerCategory -1; b++){
            // create a new div container for the movie in category
            category.createBoxContainer();
        };
    };
    setUpMoviesInCategory();

}).catch(function (err) {
	// There was an error
	console.log('Une erreur est survenue :', err);
});

