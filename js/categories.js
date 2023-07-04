class Category{
    constructor(selectorIndex, title = ""){
        this.selector = "category-" + selectorIndex + "__title";
        this.title = title;
    }
}



let categories = [];

for (let i = 0; i <= 3; i++){
    let category = new Category(i)


    category.title = "titre catégorie " + i
    let categoryElement = document.querySelector("." + category.selector)
    categoryElement.textContent = category.title
    categories.push(category);
}
