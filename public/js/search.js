document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.getElementById("searchBar");
    const productCards = document.querySelectorAll(".product-card");

    searchBar.addEventListener("keyup", function () {
        const query = searchBar.value.toLowerCase();

        productCards.forEach(card => {
            const productName = card.getAttribute("data-name");
            if (productName.includes(query)) {
                card.style.display = "flex"; // Show matching products
            } else {
                card.style.display = "none"; // Hide non-matching products
            }
        });
    });
});
