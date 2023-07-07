const urlAPI = "http://localhost:8000/api/v1/";
const categoriesNumber = 4;
const categories = [];
const movieBoxPerCategory = 7;

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
        this.carousselPage = 1;
        this.movieListFromAPI = []; //contains dictionnaries of movie info {id:value, img-src:value}
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
    async checkImageError(imageUrl){
        const response = await fetch(imageUrl);
        return await response.json();
    }
    addMovieInList(fetchResult){
        this.movieListFromAPI.push(fetchResult)
        /*
        let movieIndex = fetchResult.id
        this.checkImageError(encodeURIComponent(fetchResult.image_url))
        .then((response) => {
            
        })
        .catch((error) =>{
            console.log("erreur sur : " + fetchResult.image_url)
            console.log(error)
        });

        if(1 == 2){
            for (i in this.movieListFromAPI){
                if (this.movieListFromAPI[i].id = movieIndex){
                    this.movieListFromAPI.splice(i);
                    this.displayMovieGroup();
                    break;
                }

            }
            
        };
        */
        
    }
    setFetchResult(fetchResponse){
        this.fetchResponse = fetchResponse
        for (i in this.fetchResponse.results){
            this.addMovieInList(fetchResponse.results[i])
        }
    }
    fillMovieList(){
        //checks if there are enough movies in movieListFromAPI
        if (this.movieListFromAPI.length > this.carousselPage * movieBoxPerCategory) {
            this.displayMovieGroup()
        }
        //buffering 1 page worth of movies in list
        if (this.movieListFromAPI.length > (this.carousselPage + 1) * movieBoxPerCategory
            || this.fetchResponse.next == null){
            return;
        }
        getDataFromAPI(this.fetchResponse.next)
        .then((response) => {
            this.setFetchResult(response);
            this.fillMovieList();           
        })
    }
    displayMovieGroup(){
        let firstFilmIndexOffset = (this.carousselPage - 1) * movieBoxPerCategory

        for (i = 0; i <= movieBoxPerCategory-1; i++){
            let movieBox = this.boxMovieList[i];
            // only modify image source if enough images to display
            if (i <= this.movieListFromAPI.length - 1){
                movieBox.imageSelector.setAttribute("src", this.movieListFromAPI[i + firstFilmIndexOffset].image_url);
                movieBox.movieResponse = this.movieListFromAPI[i +firstFilmIndexOffset];
                movieBox.imageSelector.style.display = 'inline-block';
            }else{
                movieBox.imageSelector.style.display = 'none';
            }
        }
    }
    clickNext(){
        if (this.fetchResponse.next != null){
            this.carousselPage++
            this.fillMovieList();
        }
    }
    clickPrevious(){
        if (this.carousselPage > 1){
            this.carousselPage--
        
            this.displayMovieGroup()
        }
    }
}
class boxMovie{
    constructor(divSelector, imageSelector){
        this.divSelector = divSelector;
        this.imageSelector = imageSelector;
        this.movieResponse = null;
        this.imageSelector.addEventListener("click", this.displayModal.bind(this));
    }
    displayModal(){
        displayModal(this.movieResponse.url)
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
        let category = categories[i]
        let categoryUrl = ""

        if (i == 0){
            categoryUrl = urlAPI + `titles/?sort_by=-imdb_score`
        }else{
            categoryUrl = urlAPI + `titles/?genre=${category.title}`
        };

        getDataFromAPI(categoryUrl)
        .then(function(response){
            category.setFetchResult(response)
            category.fillMovieList()
            category.displayMovieGroup()
            
            // set front page film
            if (i == 0){
                setUpFrontPageFilm(category.movieListFromAPI[0])
            }
        })
    }
};

function setUpFrontPageFilm(firstFilmResponse){
    console.log(firstFilmResponse)
    document.querySelector(".image-main").setAttribute("src", firstFilmResponse.image_url)
    document.querySelector(".main-movie-title").textContent = firstFilmResponse.title
}

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


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
function displayModal(movieUrlAPI) {
    response = getDataFromAPI(movieUrlAPI)
    .then((response) => {
        modal.style.display = "block";
        console.log(response)
        modal.querySelector("img").setAttribute("src", response.image_url)
        modal.querySelector(".box-title").querySelector("p").textContent = response.title
        modal.querySelector(".box-synopsis").querySelector("p").textContent = " " + response.long_description
        modal.querySelector(".box-genres").querySelector("p").textContent = " " + response.genres
        modal.querySelector(".box-group-one").querySelector(".box-casting").querySelector("p").textContent = " " + response.actors
        modal.querySelector(".box-group-one").querySelector(".box-director").querySelector("p").textContent = " " + response.directors
        modal.querySelector(".box-date").querySelector("p").textContent = " " + response.date_published
        modal.querySelector(".box-group-two").querySelector(".box-duration").querySelector("p").textContent = " " + response.duration + "min"
        modal.querySelector(".box-score").querySelector("p").textContent = " " + esponse.avg_vote
        modal.querySelector(".box-score-imdb").querySelector("p").textContent = " " + response.imdb_score
        modal.querySelector(".box-box-office").querySelector("p").textContent = " " + response.usa_grosss_income
        modal.querySelector(".box-country").querySelector("p").textContent = " " + response.countries
    })
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}