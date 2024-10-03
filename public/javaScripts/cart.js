async function decreaseQuantity(event){
    const targetBtn = event.target;
    let productId = targetBtn.getAttribute('product-id');
    try {
        await fetch('/cart/decreaseQuantity',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({productId})
        }).then((res) => {
            return res.json();
        }).then(data => {
            if(data.success){
                console.log("success");
                updateQuantityInDom(productId,data.quantity);
                updateCartTotal(data.totalItems,data.totalPrice);
            }
        })
    } catch (error) {
        console.error("error :",error);
    }
}

function updateQuantityInDom(productId,quantity){
    const target = document.querySelector(`.quantity-btn[product-id = "${productId}"]`);
    const quantitySpan = target.nextElementSibling;
    quantitySpan.textContent = quantity;
}

async function increaseQuantity(event){
    try {
        const targetBtn = event.target;
        let productId = targetBtn.getAttribute('product-id');
        await fetch('/cart/increaseQuantity',{
        method: 'POST',
        headers: {
            'Content-Type':'application/JSON'
        },
        body:JSON.stringify({productId})
    })
    .then(res => {
        return res.json();
    }).then(data => {
        if(data.success){
            console.log("success");
            updateQuantityInDom(productId,data.quantity);
            updateCartTotal(data.totalItems,data.totalPrice);
        }
        else{
            alert("No more Stock Available");
        }
    })
    } catch (error) {
        console.error("error :",error);
    }
}

async function removeFromCart(event){
    const targetBtn = event.target;
    const productId = targetBtn.getAttribute('product-id');
    try {
        await fetch('/cart/removeFromCart',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ productId })
        }).then((response)=>{
            return response.json();
        })  
        .then(data => {
        if (data.success) {
            removeCartItemFromDom(productId);
            updateCartTotal(data.totalItems,data.totalPrice);
            // alert('Product removed from cart!');
            // window.location.href = "/cart/cartpage"; (not a good approach to load the page again)
        }
        else
            alert('Failed to remove product from cart');
        });
    } catch (error) {
       console.log("error :",error);
       alert('An error occured. Please Try again later');
    }
}
function removeCartItemFromDom(productId) {
    const cartItem = document.querySelector(`.cart-item[data-product-id='${productId}']`);
        if (cartItem) {
            cartItem.remove(); 
        }
}

function updateCartTotal(totalItems,totalPrice){
    console.log("am in updateCartTotal");
    const price = document.getElementById("total-price");
    price.textContent = totalPrice;
    const items = document.getElementById("total-items");
    items.textContent = totalItems;
}