const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
const productModal = document.getElementById('productModal');
const modalProductImage = document.getElementById("modalProductImage");
const modalProductName = document.getElementById("modalProductName");
const modalProductDescription = document.getElementById("modalProductDescription");
const modalProductPrice = document.getElementById("modalProductPrice");
const showMoreBtn = document.getElementById("Show-more-btn");
const logInBtn = document.getElementById("log-in-btn");
const logOutBtn = document.getElementById("log-out-btn");
let skipCount = 5;

addToCartBtns.forEach(btn => {
    btn.addEventListener("click",(event) => {
        handleCartBtn(event);
    })
});

showMoreBtn.addEventListener("click",(e) => {
    handleShowMoreBtn(e);
})

async function handleCartBtn(event){
    const targetBtn = event.target;
    console.log("targetBtn =",targetBtn);
    const productId = targetBtn.getAttribute('product-id');
    try {
        const response = await fetch('/cart/addToCart',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ productId })
        })
        const data = await response.json();
        if(!response.ok){
            alert('Failed to add product to cart,Please Login first');
            window.location.href="/logIn";
        }
        if (data.success) {
            alert('Product added to cart!');
            console.log("success");
            // window.location.href = "/cart/cartpage";
        }else{
            alert('Product Out of stock');
        }
    } catch (error) {
       console.log("error :",error);
       alert('An error occured. please Try again later');
    }
}

function openModal(productId){
    console.log("am in openModal");
    fetch(`/productDetails/${productId}`)
    .then((response)=>{
        return response.json();
    })
    .then(product => {
        modalProductImage.src ='/uploads/' + product.productImage; 
        modalProductName.textContent = product.productName;
        modalProductDescription.textContent = product.productDescription;
        modalProductPrice.textContent = '₹'+product.productPrice;

        productModal.style.display = 'block';
    })
    .catch(error => console.error('Error :', error));
}

function closeModal(){
    productModal.style.display = 'none';
}

async function handleShowMoreBtn(event){
    await fetch(`/ShowMoreProducts?skip=${skipCount}`)
    .then((res) => {
        return res.json();
    }).then(data => {
        if(data.success){
            addProductsToDOM(data.products);
            skipCount +=5;
            attachAddToCartListeners();
        }
        else{
            alert('No More Products Available!');
            // targetBtn.style.display = 'none';
        }
    })
}

function attachAddToCartListeners(){
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    addToCartBtns.forEach(btn => {
        btn.removeEventListener("click", handleCartBtn);  // Remove existing listeners
        btn.addEventListener("click", handleCartBtn);  // Attach the event listener
    });
}

function addProductsToDOM(products){
    console.log("all products =",products);
    products.forEach(product => {
        const productSection = document.querySelector('.products');

        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card');

        const cardImage = document.createElement('img');
        cardImage.classList.add('prodImage-size','card-img-top');
        cardImage.style.width = '18vw';
        cardImage.src = '/uploads/' + product.productImage;
        cardImage.alt = product.productName;
        cardContainer.appendChild(cardImage);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const prodName = document.createElement('h5');
        prodName.classList.add('card-title');
        prodName.innerHTML = `<b>${product.productName}</b>`;

        const priceDiv = document.createElement('div');
        priceDiv.classList.add('price-div');
        const prodPrice = document.createElement('p');
        prodPrice.classList.add('price');
        prodPrice.innerHTML = `₹<b>${product.productPrice}</b>`;
        priceDiv.appendChild(prodPrice);

        const btnDiv = document.createElement('div');
        btnDiv.classList.add('flex');

        const addToCartBtn = document.createElement('a');
        addToCartBtn.setAttribute('product-id', product._id);
        addToCartBtn.classList.add('btn','btn-primary','add-to-cart-btn');
        addToCartBtn.innerHTML = 'Add to cart';
        btnDiv.appendChild(addToCartBtn);

        const viewDetailsBtn = document.createElement('a');
        viewDetailsBtn.classList.add('btn','btn-primary');
        viewDetailsBtn.setAttribute('onClick', `openModal('${product._id}')`);
        viewDetailsBtn.innerHTML = 'View Details';
        btnDiv.appendChild(viewDetailsBtn);

        cardBody.appendChild(prodName);
        cardBody.appendChild(priceDiv);
        cardBody.appendChild(btnDiv);
        cardContainer.appendChild(cardBody);
        productSection.appendChild(cardContainer);
    })
}
// attachAddToCartListeners();