const movieBoxPerCategory = 6;

let movieContainers = document.querySelectorAll(".container-movie");

for (let container = 0; container<=movieContainers.length -1 ; container++){
    for (let box = 0; box<=movieBoxPerCategory -1; box++){
        var movieBox = document.createElement("div");
        movieBox.setAttribute("class", "box-movie");
        movieContainers[container].appendChild(movieBox);
    }
}