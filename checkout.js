const taxRate = 0.0825;
const shippingPrice = 15;
const shippingFreePrice = 300;

window.addEventListener("load", () => {
    localStorage.setItem("taxRate", taxRate);
    localStorage.setItem("shippingPrice", shippingPrice);
    localStorage.setItem("shippingFreePrice", shippingFreePrice);

    // Show cart totals on window load
    calculateCartPrice();
});

const productsDiv = document.querySelector(".products");

productsDiv.addEventListener("click", (e) => {
    if (e.target.className === "fa-solid fa-minus") {
        if (e.target.nextElementSibling.innerText > 1) {
            e.target.nextElementSibling.innerText--;
            calculateProductPrice(e.target);
        } else {
            if (confirm(`${e.target.closest(".product-info").querySelector("h2").innerText} will be removed!`)) {
                e.target.closest(".product").remove();
            }
        }
        calculateCartPrice();
    } else if (e.target.classList.contains("fa-plus")) {
        e.target.parentElement.querySelector(".quantity").innerText++;
        calculateProductPrice(e.target);
        calculateCartPrice();
    } else if (e.target.getAttribute("class") == "remove-product") {
        if (confirm(`${e.target.closest(".product-info").querySelector("h2").innerText} will be removed!`)) {
            e.target.closest(".product").remove();
        }
        calculateCartPrice();
    } else {
        alert("other element clicked");
    }
});

const calculateProductPrice = (target) => {
    // Calculate each product's total price
    const productInfoDiv = target.closest(".product-info");
    const price = productInfoDiv.querySelector("div.product-price strong").innerText;
    const quantity = productInfoDiv.querySelector("p.quantity").innerText;
    productInfoDiv.querySelector("div.product-line-price").innerText = (price * quantity).toFixed(2);
};

const calculateCartPrice = () => {
    const cartData = JSON.parse(localStorage.getItem("cartData")) || {
        taxRate: parseFloat(localStorage.getItem("taxRate")),
        shippingPrice: parseFloat(localStorage.getItem("shippingPrice")),
        shippingFreePrice: parseFloat(localStorage.getItem("shippingFreePrice")),
    };

    const productLinePriceDivs = document.querySelectorAll(".product-line-price");
    let subtotal = 0;

    productLinePriceDivs.forEach(div => {
        subtotal += parseFloat(div.innerText);
    });

    // Calculate tax only for taxable items
    let taxPrice = 0;
    document.querySelectorAll(".product").forEach(product => {
        const isTaxable = product.querySelector("p.isTaxable").innerText === 'true';
        if (isTaxable) {
            const productTotal = parseFloat(product.querySelector(".product-line-price").innerText);
            taxPrice += productTotal * cartData.taxRate;
        }
    });

    const shippingCost = subtotal > 0 && subtotal < cartData.shippingFreePrice ? cartData.shippingPrice : 0;
    const totalPrice = subtotal + taxPrice + shippingCost;

    document.querySelector("#cart-subtotal").lastElementChild.innerText = subtotal.toFixed(2);
    document.getElementById("cart-tax").children[1].innerText = taxPrice.toFixed(2);
    document.querySelector("#cart-shipping p:nth-child(2)").innerText = shippingCost.toFixed(2);
    document.querySelector("#cart-total p:last-child").innerText = totalPrice.toFixed(2);
};

const applyCoupons = (coupons) => {
    coupons.forEach(coupon => {
        document.querySelectorAll(".product").forEach(product => {
            const productName = product.querySelector("h2").innerText;
            if (productName === coupon.item) {
                const priceElement = product.querySelector("div.product-price strong");
                const currentPrice = parseFloat(priceElement.innerText);
                const newPrice = Math.max(0, currentPrice - coupon.discount);
                priceElement.innerText = newPrice.toFixed(2);
                calculateProductPrice(priceElement.closest(".product-info"));
            }
        });
    });
    calculateCartPrice();
};

// Example of loading and applying coupons
fetch('coupon.json')
    .then(response => response.json())
    .then(coupons => {
        applyCoupons(coupons);
    });
