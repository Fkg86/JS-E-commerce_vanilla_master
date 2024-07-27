let bookList = [];
let basketList = [];

const toggleModal = () => {
    const basketModalEl = document.querySelector(".basket-modal");
    basketModalEl.classList.toggle("active");
  };

const getBooks = () => {
  fetch("products.json")
    .then((res) => res.json())
    .then((books) => {
      bookList = books;
      createBookItemsHtml();
      createBookTypesHtml();
    });
};
getBooks();

const createBookStars = (starRate) => {
    let starHtml = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(starRate)) {
        starHtml += '<i class="bi bi-star-fill"></i>';
      } else if (i - starRate < 1) {
        starHtml += '<i class="bi bi-star-half"></i>';
      } else {
        starHtml += '<i class="bi bi-star"></i>';
      }
    }
    return starHtml;
  };
  
  const createBookItemsHtml = (filteredBooks = bookList) => {
    const bookListEl = document.querySelector(".book-list");
    let bookListHtml = "";
    filteredBooks.forEach((book, index) => {
      bookListHtml += `<div class="col-5 ${index % 2 == 0 ? "offset-2" : ""} my-5">
        <div class="row book_card">
          <div class="col-6">
            <img class="img-fluid shadow" width="258" height="400" src="${book.imgSource}" />
          </div>
          <div class="col-6 d-flex flex-column justify-content-between">
            <div class="book_detail">
              <span class="fos gray fs-5">${book.author}</span><br />
              <span class="fs-4 fw-bold">${book.name}</span><br />
              <span class="book_star">
                ${createBookStars(book.starRate)}
                <span class="gray">${book.reviewCount} yorum</span>
              </span>
            </div>
            <p class="book_desc fos gray">${book.description}</p>
            <div>
              <span class="black fw-bold fs-4 me-2">${book.price}₺</span>
              ${book.oldPrice ? `<span class="fs-4 fw-bold old_price">${book.oldPrice}₺</span>` : ""}
            </div>
            <button class="btn_purple" onclick='addBookToBasket(${book.id})'>SEPETE EKLE</button>
          </div>
        </div>
      </div>`;
    });
    bookListEl.innerHTML = bookListHtml;
  };
  

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1)
      filterTypes.push(book.type);
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `
    <li class="${
      index == 0 ? "active" : ""
    }" onclick='filterBooks(this)' data-type='${type}'>
      ${BOOK_TYPES[type] || type}
    </li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
    document.querySelector(".filter .active").classList.remove("active");
    filterEl.classList.add("active");
    const bookType = filterEl.dataset.type;
    const filteredBooks = bookType === "ALL" ? bookList : bookList.filter((book) => book.type === bookType);
    createBookItemsHtml(filteredBooks);
  };
  
  

  const listBasketItems = () => {
    const basketListEl = document.querySelector(".basket-list");
    const basketCountEl = document.querySelector(".basket-count");
    basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
    const totalPriceEl = document.querySelector(".total-price");
  
    let basketListHtml = "";
    let totalPrice = 0;
    basketList.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
      basketListHtml += `
        <li class="basket-item">
          <img src="${item.product.imgSource}" width="100" height="100" alt="">
          <div class="basket-item-info">
            <h3 class="book-name">${item.product.name}</h3>
            <span class="book-price">${item.product.price} ₺</span><br>
            <span class="book-remove" onclick='removeItemFromBasket(${item.product.id})'>Sil</span>
          </div>
          <div class="book-count">
            <span class="decrease" onclick='decreaseItemInBasket(${item.product.id})'>-</span>
            <span class="my-5">${item.quantity}</span>
            <span class="increase" onclick='increaseItemInBasket(${item.product.id})'>+</span>
          </div>
        </li>`;
    });
  
    basketListEl.innerHTML = basketListHtml || `<li class="basket-item">Sepetinizde ürün bulunmamaktadır.</li>`;
    totalPriceEl.innerHTML = `Total: ${totalPrice.toFixed(2)} ₺`;
  };

const addBookToBasket = (id) => {
    const book = bookList.find((b) => b.id === id);
    const basketItems = document.querySelector(".basket-list");
    let basketHtml = `<li class="basket-item">
        <span>${book.name}</span>
        <span>${book.price}₺</span>
      </li>`;
    basketItems.innerHTML += basketHtml;
    const totalPriceEl = document.querySelector(".total-price");
    const basketItemEls = document.querySelectorAll(".basket-item");
    let totalPrice = 0;
    basketItemEls.forEach((item) => {
      const price = parseFloat(item.children[1].innerText.replace("₺", ""));
      totalPrice += price;
    });
    totalPriceEl.innerText = `Total: ${totalPrice}₺`;
    document.querySelector(".basket-count").innerText = basketItemEls.length;
    toastr.success('Ürün sepete eklendi');
  };

  const removeItemFromBasket = (bookId) => {
    const findedIndex = basketList.findIndex(basket => basket.product.id == bookId);
    if (findedIndex != -1) {
      basketList.splice(findedIndex, 1);
      listBasketItems();
    }
  };
  
  const decreaseItemInBasket = (bookId) => {
    const findedIndex = basketList.findIndex(basket => basket.product.id == bookId);
    if (findedIndex != -1) {
      if (basketList[findedIndex].quantity > 1) {
        basketList[findedIndex].quantity -= 1;
      } else {
        removeItemFromBasket(bookId);
      }
      listBasketItems();
    }
  };
  
  const increaseItemInBasket = (bookId) => {
    const findedIndex = basketList.findIndex(basket => basket.product.id == bookId);
    if (findedIndex != -1) {
      if (basketList[findedIndex].quantity < basketList[findedIndex].product.stock) {
        basketList[findedIndex].quantity += 1;
      } else {
        toastr.error("Yeterli stok yok.");
      }
      listBasketItems();
    }
  };

if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
    createBookItemsHtml();
  });