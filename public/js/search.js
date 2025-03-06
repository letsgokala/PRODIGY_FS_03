document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.getElementById("searchBar");
    const categoryFilter = document.getElementById("categoryFilter");
    const priceRange = document.getElementById("priceRange");
    const priceValue = document.getElementById("priceValue");
    const productCards = document.querySelectorAll(".product-card");

    function filterProducts() {
        const query = searchBar.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceRange.value);

        productCards.forEach(card => {
            const productName = card.getAttribute("data-name");
            const productCategory = card.getAttribute("data-category");
            const productPrice = parseFloat(card.getAttribute("data-price"));

            const matchesSearch = productName.includes(query);
            const matchesCategory = selectedCategory === "" || productCategory === selectedCategory;
            const matchesPrice = productPrice <= maxPrice;

            if (matchesSearch && matchesCategory && matchesPrice) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    searchBar.addEventListener("keyup", filterProducts);
    categoryFilter.addEventListener("change", filterProducts);
    priceRange.addEventListener("input", function () {
        priceValue.textContent = `Max: $${priceRange.value}`;
        filterProducts();
    });
});
