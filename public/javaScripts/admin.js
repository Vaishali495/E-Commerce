console.log("am in admin.js"); 
const updateBtns = document.querySelectorAll(".update-btn");
const deleteBtns = document.querySelectorAll(".delete-btn");

updateBtns.forEach(btn => {
    btn.addEventListener("click",(event) => {
        handleUpdateBtn(event);
    })
});

deleteBtns.forEach(btn => {
    btn.addEventListener("click",(event) => {
        handleDeleteBtn(event);
    })
});

async function handleUpdateBtn(event){
    const targetBtn = event.target;
    const productId = targetBtn.getAttribute('product-id');
    const productName = document.getElementById(`productName-${productId}`).value;
    const productDescription = document.getElementById(`productDescription-${productId}`).value;
    const stock = document.getElementById(`productStock-${productId}`).value;
    const productPrice = document.getElementById(`productPrice-${productId}`).value;
    const updatedData = {productName,productDescription,productPrice,stock};
    try{
        await fetch('/admin/update-product',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId,updatedData })
        }).then((response)=>{
            return response.json();
        }).then(data => {
            if(data.success){
                console.log("success");
                AddUpdatedDataToDom(productId,data.updatedProduct)
                alert("updated successfully");
            }
        })
    }
    catch(error){
        console.log("error :",error);
    }
}

function AddUpdatedDataToDom(productId,updatedProduct){
    const productName = document.getElementById(`productName-${productId}`);
    productName.textContent = updatedProduct.productName;

    const productDescription = document.getElementById(`productDescription-${productId}`);
    productDescription.textContent = updatedProduct.productDescription;

    const stock = document.getElementById(`productStock-${productId}`);
    stock.textContent = updatedProduct.stock;

    const productPrice = document.getElementById(`productPrice-${productId}`);
    productPrice.textContent = updatedProduct.productPrice;
}

async function handleDeleteBtn(event){
    const targetBtn = event.target;
    const productId = targetBtn.getAttribute('product-id');
    try {
        await fetch('/admin/delete-product',{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId})
        }).then((response)=>{
            return response.json();
        }).then(data => {
            if(data.success){
                console.log("success");
                deleteProductFromDom(productId);
                // alert("Deleted successfully");
            }
        })
    } catch (error) {
        console.error("error :",error);
    }
}

function deleteProductFromDom(productId){
    console.log("am in deleteProductFromDom");
    const cardBody = document.getElementById(`productName-${productId}`).parentElement;
    const card = cardBody.parentElement;
    card.remove();
}