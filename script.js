
const API_BASE_URL = "https://beanboutiquecoffeeshop.onrender.com";
// this is for the session user to localStorage
function getRegisteredUser() {
  return JSON.parse(localStorage.getItem("beanBoutiqueCurrentUser"));
}

function getGuestDiscountUser() {
  return JSON.parse(localStorage.getItem("beanBoutiqueGuestDiscountUser"));
}

function getActiveSessionUser() {
  const registeredUser = getRegisteredUser();
  if (registeredUser) {
    return {
      type: "registered",
      fullName: registeredUser.fullName,
      email: registeredUser.email
    };
  }

  const guestDiscountUser = getGuestDiscountUser();
  if (guestDiscountUser) {
    return {
      type: "guest-discount",
      fullName: "Guest Discount",
      email: guestDiscountUser.email
    };
  }

  return null;
}

function getSessionEmail() {
  const activeUser = getActiveSessionUser();
  return activeUser ? activeUser.email.toLowerCase() : null;
}

function getDiscountEmail() {
  const sessionEmail = getSessionEmail();
  if (sessionEmail) return sessionEmail;

  const storedDiscountEmail = localStorage.getItem("beanBoutiqueDiscountEmail");
  return storedDiscountEmail ? storedDiscountEmail.toLowerCase() : "";
}

function isDiscountUser() {
  const email = getDiscountEmail();
  const discountUsers = JSON.parse(localStorage.getItem("beanBoutiqueDiscountUsers")) || [];
  return email ? discountUsers.includes(email) : false;
}

function getDiscountRate() {
  return isDiscountUser() ? 0.25 : 0;
}

function formatCurrency(amount) {
  return "₹" + Math.round(amount);
}


// home slideshow
const slideshow = document.getElementById("home-slideshow");
const slides = document.querySelectorAll("#home-slideshow .slide");
const dots = document.querySelectorAll("#home-slideshow .dot");
const prevSlideBtn = document.getElementById("slide-prev");
const nextSlideBtn = document.getElementById("slide-next");

if (slideshow && slides.length > 0 && prevSlideBtn && nextSlideBtn) {
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[index].classList.add("active");

    if (dots[index]) {
      dots[index].classList.add("active");
    }

    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startSlideshow() {
    slideInterval = setInterval(nextSlide, 4000);
  }

  function resetSlideshow() {
    clearInterval(slideInterval);
    startSlideshow();
  }

  nextSlideBtn.addEventListener("click", () => {
    nextSlide();
    resetSlideshow();
  });

  prevSlideBtn.addEventListener("click", () => {
    prevSlide();
    resetSlideshow();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      resetSlideshow();
    });
  });

  showSlide(0);
  startSlideshow();
}
// profile page 
function getSessionCart() {
  return getCart();
}

function renderProfilePage() {
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profileType = document.getElementById("profile-type");
  const profileDiscount = document.getElementById("profile-discount");
  const profileCartItems = document.getElementById("profile-cart-items");
  const profileEvents = document.getElementById("profile-events");
  const profileOrders = document.getElementById("profile-orders");

  if (
    !profileName ||
    !profileEmail ||
    !profileType ||
    !profileDiscount ||
    !profileCartItems ||
    !profileEvents ||
    !profileOrders
  ) {
    return;
  }

  const activeUser = getActiveSessionUser();
  const cart = getSessionCart();
  const allEvents = JSON.parse(localStorage.getItem("beanBoutiqueEventRegistrations")) || [];
  const allOrders = JSON.parse(localStorage.getItem("beanBoutiqueOrders")) || [];

  if (activeUser) {
    profileName.textContent =
      activeUser.type === "registered" ? activeUser.fullName : "Guest Discount User";
    profileEmail.textContent = activeUser.email;
    profileType.textContent =
      activeUser.type === "registered" ? "Registered User" : "Popup Discount Guest";
  } else {
    profileName.textContent = "Guest";
    profileEmail.textContent = "Not available";
    profileType.textContent = "Normal Guest";
  }

  profileDiscount.textContent = isDiscountUser() ? "25% Active" : "Not Active";

  /* Cart */
  if (cart.length === 0) {
    profileCartItems.innerHTML = "<p>No cart items found.</p>";
  } else {
    profileCartItems.innerHTML = cart
      .map((item) => {
        const original = Number(item.originalPrice || item.price);
        const finalPrice = Number(item.price);

        return `
          <div class="profile-item-row">
            <h4>${item.name}</h4>
            ${item.discountApplied
            ? `<p><del>${formatCurrency(original)}</del> <strong>${formatCurrency(finalPrice)}</strong> <span style="color:green;">25% OFF</span></p>`
            : `<p>${formatCurrency(finalPrice)}</p>`
          }
          </div>
        `;
      })
      .join("");
  }

  /* Event registrations */
  let userEvents = [];

  if (activeUser && activeUser.email) {
    userEvents = allEvents.filter(
      (event) =>
        event.email.toLowerCase() === activeUser.email.toLowerCase() ||
        event.userEmail === activeUser.email.toLowerCase()
    );
  }

  if (userEvents.length === 0) {
    profileEvents.innerHTML = "<p>No event registrations found.</p>";
  } else {
    profileEvents.innerHTML = userEvents
      .map(
        (event) => `
          <div class="profile-item-row">
            <h4>${event.eventName}</h4>
            <p>${event.firstName} ${event.lastName}</p>
            <p>${event.email}</p>
          </div>
        `
      )
      .join("");
  }

  /* Orders */
  let userOrders = [];

  if (activeUser && activeUser.email) {
    userOrders = allOrders.filter(
      (order) => order.user.toLowerCase() === activeUser.email.toLowerCase()
    );
  } else {
    userOrders = allOrders.filter((order) => order.user === "guest");
  }

  if (userOrders.length === 0) {
    profileOrders.innerHTML = "<p>No orders found.</p>";
  } else {
    profileOrders.innerHTML = userOrders
      .map(
        (order) => `
          <div class="profile-item-row">
            <h4>Order #${order.id}</h4>
            <p>Date: ${order.date}</p>
            <p>Items: ${order.items.length}</p>
            <p>Subtotal: ${formatCurrency(Number(order.subtotal))}</p>
            <p>Discount: ${formatCurrency(Number(order.discount))}</p>
            <p><strong>Final Total: ${formatCurrency(Number(order.finalTotal))}</strong></p>
          </div>
        `
      )
      .join("");
  }
}

renderProfilePage();

// this is for storage user 
function getCartStorageKey() {
  const email = getSessionEmail();

  if (email) {
    return `beanBoutiqueCart_${email}`;
  }

  return "beanBoutiqueCart_guest";
}

function getCart() {
  const key = getCartStorageKey();
  const email = getSessionEmail();
  if (email) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  return JSON.parse(sessionStorage.getItem(key)) || [];
}



function setCart(updatedCart) {
  const key = getCartStorageKey();
  const email = getSessionEmail();

  if (email) {
    localStorage.setItem(key, JSON.stringify(updatedCart));
  } else {
    sessionStorage.setItem(key, JSON.stringify(updatedCart));
  }
}

function clearCurrentCart() {
  const key = getCartStorageKey();
  const email = getSessionEmail();

  if (email) {
    localStorage.removeItem(key);
  } else {
    sessionStorage.removeItem(key);
  }
}

function getRatingKey(productName) {
  const email = getSessionEmail();

  const cleanName = productName.toLowerCase().replace(/\s+/g, "-");

  if (email) {
    return `beanBoutiqueRating_${email}_${cleanName}`;
  }

  return `beanBoutiqueRating_guest_${cleanName}`;
}

document.addEventListener("DOMContentLoaded", () => {
  //  this is for mobile navigation
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      siteNav.classList.toggle("active");
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  // this is for navbar
  const guestItems = document.querySelectorAll(".guest-only");
  const userOnly = document.querySelector(".user-only");
  const accountMenu = document.getElementById("account-menu");
  const accountName = document.getElementById("account-name");
  const accountEmail = document.getElementById("account-email");
  const accountBtn = document.getElementById("account-btn");
  const accountDropdown = document.getElementById("account-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  //payment 
  const paymentModal = document.getElementById("payment-modal");
  const paymentClose = document.getElementById("payment-close");
  const payNowBtn = document.getElementById("pay-now-btn");
  const paymentMessage = document.getElementById("payment-message");
  const paymentTotalAmount = document.getElementById("payment-total-amount");

  const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
  const cardFields = document.getElementById("card-fields");
  const upiFields = document.getElementById("upi-fields");
  const codFields = document.getElementById("cod-fields");

  //for choose plan offers section 
  const planModal = document.getElementById("plan-modal");
  const planClose = document.getElementById("plan-close");
  const choosePlanButtons = document.querySelectorAll(".choose-plan-btn");
  const selectedPlanName = document.getElementById("selected-plan-name");
  const selectedPlanPrice = document.getElementById("selected-plan-price");
  const planForm = document.getElementById("plan-form");
  const planMessage = document.getElementById("plan-message");

  const planCardFields = document.getElementById("plan-card-fields");
  const planUpiFields = document.getElementById("plan-upi-fields");
  const planCodFields = document.getElementById("plan-cod-fields");
  const planPaymentOptions = document.querySelectorAll('input[name="plan-payment-method"]');

  let currentPlan = "";
  let currentPlanPrice = 0;

  choosePlanButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentPlan = button.dataset.plan;
      currentPlanPrice = Number(button.dataset.price);

      selectedPlanName.textContent = currentPlan;
      selectedPlanPrice.textContent = formatCurrency(currentPlanPrice);

      planModal.classList.add("active");
      planModal.setAttribute("aria-hidden", "false");
    });
  });

  function togglePlanPaymentFields() {
    const selected = document.querySelector('input[name="plan-payment-method"]:checked').value;

    planCardFields.classList.add("hidden");
    planUpiFields.classList.add("hidden");
    planCodFields.classList.add("hidden");

    if (selected === "card") {
      planCardFields.classList.remove("hidden");
    } else if (selected === "upi") {
      planUpiFields.classList.remove("hidden");
    } else {
      planCodFields.classList.remove("hidden");
    }
  }

  planPaymentOptions.forEach((option) => {
    option.addEventListener("change", togglePlanPaymentFields);
  });

  if (planClose) {
    planClose.addEventListener("click", () => {
      planModal.classList.remove("active");
      planModal.setAttribute("aria-hidden", "true");
    });
  }

  if (planModal) {
    planModal.addEventListener("click", (event) => {
      if (event.target === planModal) {
        planModal.classList.remove("active");
        planModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (planForm) {
    planForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("subscriber-name").value.trim();
      const email = document.getElementById("subscriber-email").value.trim();
      const phone = document.getElementById("subscriber-phone").value.trim();
      const address = document.getElementById("subscriber-address").value.trim();
      const paymentMethod = document.querySelector('input[name="plan-payment-method"]:checked').value;

      if (!name || !email || !phone || !address) {
        planMessage.textContent = "Please fill all subscription details.";
        planMessage.style.color = "red";
        return;
      }

      if (paymentMethod === "card") {
        const cardNumber = document.getElementById("plan-card-number").value.trim();
        const cardExpiry = document.getElementById("plan-card-expiry").value.trim();
        const cardCvv = document.getElementById("plan-card-cvv").value.trim();

        if (!cardNumber || !cardExpiry || !cardCvv) {
          planMessage.textContent = "Please fill all card details.";
          planMessage.style.color = "red";
          return;
        }
      }

      if (paymentMethod === "upi") {
        const upiId = document.getElementById("plan-upi-id").value.trim();

        if (!upiId) {
          planMessage.textContent = "Please enter your UPI ID.";
          planMessage.style.color = "red";
          return;
        }
      }

      const subscriptions = JSON.parse(localStorage.getItem("beanBoutiqueSubscriptions")) || [];

      subscriptions.push({
        id: Date.now(),
        plan: currentPlan,
        price: currentPlanPrice,
        name,
        email,
        phone,
        address,
        paymentMethod,
        status: "Active",
        date: new Date().toLocaleString()
      });

      localStorage.setItem("beanBoutiqueSubscriptions", JSON.stringify(subscriptions));

      planMessage.textContent = "Subscription confirmed successfully.";
      planMessage.style.color = "green";

      planForm.reset();

      setTimeout(() => {
        planModal.classList.remove("active");
        planModal.setAttribute("aria-hidden", "true");
        planMessage.textContent = "";
      }, 1500);
    });
  }

  function openPaymentModal(total) {
    if (paymentModal) {
      paymentModal.classList.add("active");
      paymentModal.setAttribute("aria-hidden", "false");
      if (paymentTotalAmount) {
        paymentTotalAmount.textContent = formatCurrency(total);
      }
    }
  }

  function closePaymentModal() {
    if (paymentModal) {
      paymentModal.classList.remove("active");
      paymentModal.setAttribute("aria-hidden", "true");
    }
    if (paymentMessage) {
      paymentMessage.textContent = "";
      paymentMessage.className = "payment-message";
    }
  }

  function togglePaymentFields() {
    const selected = document.querySelector('input[name="payment-method"]:checked')?.value;

    if (!cardFields || !upiFields || !codFields) return;

    cardFields.classList.add("hidden");
    upiFields.classList.add("hidden");
    codFields.classList.add("hidden");

    if (selected === "card") {
      cardFields.classList.remove("hidden");
    } else if (selected === "upi") {
      upiFields.classList.remove("hidden");
    } else if (selected === "cod") {
      codFields.classList.remove("hidden");
    }
  }

  paymentOptions.forEach((option) => {
    option.addEventListener("change", togglePaymentFields);
  });

  if (paymentClose) {
    paymentClose.addEventListener("click", closePaymentModal);
  }

  if (paymentModal) {
    paymentModal.addEventListener("click", (event) => {
      if (event.target === paymentModal) {
        closePaymentModal();
      }
    });
  }


  if (payNowBtn) {
    payNowBtn.addEventListener("click", () => {
      const cart = getCart();

      if (cart.length === 0) {
        if (paymentMessage) {
          paymentMessage.textContent = "Your cart is empty.";
          paymentMessage.style.color = "red";
        }
        return;
      }

      const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
      const checkoutName = document.getElementById("checkout-name").value.trim();
      const checkoutPhone = document.getElementById("checkout-phone").value.trim();
      const checkoutAddress = document.getElementById("checkout-address").value.trim();
      const checkoutPin = document.getElementById("checkout-pin").value.trim();

      if (!checkoutName || !checkoutPhone || !checkoutAddress || !checkoutPin) {
        paymentMessage.textContent = "Please fill your name, contact number, address and PIN code.";
        paymentMessage.style.color = "red";
        return;
      }

      if (selectedMethod === "card") {
        const cardName = document.getElementById("card-name").value.trim();
        const cardNumber = document.getElementById("card-number").value.trim();
        const cardExpiry = document.getElementById("card-expiry").value.trim();
        const cardCvv = document.getElementById("card-cvv").value.trim();

        if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
          paymentMessage.textContent = "Please fill all card details.";
          paymentMessage.style.color = "red";
          return;
        }
      }

      if (selectedMethod === "upi") {
        const upiId = document.getElementById("upi-id").value.trim();

        if (!upiId) {
          paymentMessage.textContent = "Please enter your UPI ID.";
          paymentMessage.style.color = "red";
          return;
        }
      }

      const orders = JSON.parse(localStorage.getItem("beanBoutiqueOrders")) || [];
      const activeUser = getActiveSessionUser();

      const subtotal = cart.reduce(
        (sum, item) => sum + Number(item.originalPrice || item.price),
        0
      );
      const finalTotal = cart.reduce(
        (sum, item) => sum + Number(item.price),
        0
      );
      const discount = subtotal - finalTotal;

      const order = {
        id: Date.now(),
        user: activeUser ? activeUser.email : "guest",
        userType: activeUser ? activeUser.type : "guest",
        paymentMethod: selectedMethod,
        customerName: checkoutName,
        contactNumber: checkoutPhone,
        deliveryAddress: checkoutAddress,
        pinCode: checkoutPin,
        items: cart,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        finalTotal: finalTotal.toFixed(2),
        date: new Date().toLocaleString(),
        paymentStatus: "Paid"
      };

      orders.push(order);
      localStorage.setItem("beanBoutiqueOrders", JSON.stringify(orders));

      clearCurrentCart();
      updateCartCount();
      renderCart();

      paymentMessage.textContent = "Payment successful. Your order has been placed.";
      paymentMessage.style.color = "green";

      setTimeout(() => {
        closePaymentModal();
      }, 1500);
    });
  }

  function updateNavbarUserState() {
    const activeUser = getActiveSessionUser();

    if (activeUser) {
      guestItems.forEach((item) => {
        item.style.display = "none";
      });

      if (userOnly) {
        userOnly.style.display = "flex";
      }

      if (accountName) {
        accountName.textContent =
          activeUser.type === "registered" ? activeUser.fullName : "Guest Discount";
      }

      if (accountEmail) {
        accountEmail.textContent = activeUser.email;
      }
    } else {
      guestItems.forEach((item) => {
        item.style.display = "flex";
      });

      if (userOnly) {
        userOnly.style.display = "none";
      }
    }
  }

  updateNavbarUserState();

  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener("click", () => {
      accountDropdown.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
      if (accountMenu && !accountMenu.contains(event.target)) {
        accountDropdown.classList.remove("show");
      }
    });
  }

  // this is for popup window
  const modal = document.getElementById("welcome-modal");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const discountForm = document.getElementById("discount-form");

  function closeWelcomeModal() {
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      sessionStorage.setItem("beanBoutiqueModalClosed", "true");
    }
  }

  function openWelcomeModal() {
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
  }

  if (modal) {
    const alreadyClosed = sessionStorage.getItem("beanBoutiqueModalClosed");

    if (alreadyClosed) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    } else {
      openWelcomeModal();
    }
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeWelcomeModal);
  }

  if (modalCancel) {
    modalCancel.addEventListener("click", closeWelcomeModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeWelcomeModal();
      }
    });
  }

  if (discountForm) {
    discountForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const discountEmailInput = document.getElementById("discount-email");
      const emailValue = discountEmailInput
        ? discountEmailInput.value.trim().toLowerCase()
        : "";

      if (!emailValue) {
        alert("Please enter your email.");
        return;
      }

      localStorage.setItem("beanBoutiqueDiscountEmail", emailValue);
      localStorage.setItem("beanBoutiqueDiscountActive", "true");

      const discountUsers = JSON.parse(localStorage.getItem("beanBoutiqueDiscountUsers")) || [];

      if (!discountUsers.includes(emailValue)) {
        discountUsers.push(emailValue);
        localStorage.setItem(
          "beanBoutiqueDiscountUsers",
          JSON.stringify(discountUsers)
        );
      }

      localStorage.setItem(
        "beanBoutiqueGuestDiscountUser",
        JSON.stringify({ email: emailValue })
      );

      updateNavbarUserState();
      updateCartCount();
      renderCart();
      loadRatings();
      closeWelcomeModal();

      alert("Thanks for signing up. Your 25% discount is now active.");
    });
  }

  // this is for add to cart
  function updateCartCount() {
    const cart = getCart();
    const counters = document.querySelectorAll("#cart-count");

    counters.forEach((counter) => {
      counter.textContent = cart.length;
    });
  }

  function renderCart() {
    const cart = getCart();
    const cartItems = document.getElementById("cart-items");
    const totalItems = document.getElementById("total-items");
    const subtotalEl = document.getElementById("total-price");
    const discountAmountEl = document.getElementById("discount-amount");
    const finalTotalEl = document.getElementById("final-total");

    if (!cartItems || !totalItems || !subtotalEl) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = "<p>Your cart is empty.</p>";
      totalItems.textContent = "0";
      subtotalEl.textContent = "₹0";

      if (discountAmountEl) discountAmountEl.textContent = "₹0";
      if (finalTotalEl) finalTotalEl.textContent = "₹0";
      return;
    }

    let subtotal = 0;
    let finalTotal = 0;

    cart.forEach((item, index) => {
      const originalPrice = Number(item.originalPrice || item.price);
      const price = Number(item.price);

      subtotal += originalPrice;
      finalTotal += price;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <div>
          <h4>${item.name}</h4>
          ${item.discountApplied
          ? `<p><del>${formatCurrency(originalPrice)}</del> <strong>${formatCurrency(price)}</strong> <span style="color: green;">25% OFF</span></p>`
          : `<p>${formatCurrency(price)}</p>`
        }
        </div>
        <button class="remove-btn" data-index="${index}">Remove</button>
      `;

      cartItems.appendChild(row);
    });

    const discountAmount = subtotal - finalTotal;

    totalItems.textContent = String(cart.length);
    subtotalEl.textContent = formatCurrency(subtotal);

    if (discountAmountEl) {
      discountAmountEl.textContent = formatCurrency(discountAmount);
    }

    if (finalTotalEl) {
      finalTotalEl.textContent = formatCurrency(finalTotal);
    }

    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.index);
        const updatedCart = getCart();
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        updateCartCount();
        renderCart();
      };
    });
  }

  function addToCart(item) {
    const cart = getCart();
    cart.push(item);
    setCart(cart);
    updateCartCount();
    renderCart();
  }

  updateCartCount();
  renderCart();

  const addCartButtons = document.querySelectorAll(".add-cart-btn");
  addCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const originalPrice = parseFloat(button.dataset.price);
      const discountRate = getDiscountRate();
      const discountedPrice = originalPrice - originalPrice * discountRate;

      const item = {
        name: button.dataset.name,
        originalPrice,
        price: Math.round(discountedPrice),
        discountApplied: discountRate > 0
      };

      addToCart(item);

      if (discountRate > 0) {
        alert(`${item.name} added to cart with 25% discount.`);
      } else {
        alert(`${item.name} added to cart.`);
      }
    });
  });

  const clearCartButton = document.getElementById("clear-cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      clearCurrentCart();
      updateCartCount();
      renderCart();
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = getCart();

      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const finalTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
      openPaymentModal(finalTotal);
      togglePaymentFields();
    });
  }

  //  this section below creating for logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("beanBoutiqueCurrentUser");
      localStorage.removeItem("beanBoutiqueGuestDiscountUser");
      localStorage.removeItem("beanBoutiqueDiscountActive");
      localStorage.removeItem("beanBoutiqueDiscountEmail");

      updateNavbarUserState();
      updateCartCount();
      renderCart();
      loadRatings();

      window.location.href = "index.html";
    });
  }

  //  this is for register and captcha
  const registerForm = document.getElementById("register-form");
  const captchaText = document.getElementById("captcha-text");
  const captchaInput = document.getElementById("captcha-input");
  const captchaMessage = document.getElementById("captcha-message");
  const refreshCaptchaBtn = document.getElementById("refresh-captcha");
  const registerMessage = document.getElementById("register-message");

  let generatedCaptcha = "";

  function createCaptcha() {
    if (!captchaText) return;

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let captcha = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      captcha += chars[randomIndex];
    }

    generatedCaptcha = captcha;
    captchaText.textContent = generatedCaptcha;

    if (captchaInput) {
      captchaInput.value = "";
    }

    if (captchaMessage) {
      captchaMessage.textContent = "";
      captchaMessage.className = "captcha-message";
    }
  }

  if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener("click", createCaptcha);
  }

  if (registerForm) {
    createCaptcha();

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fullNameInput = document.getElementById("register-fullname");
      const emailInput = document.getElementById("register-email");
      const passwordInput = document.getElementById("register-password");

      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";
      const enteredCaptcha = captchaInput ? captchaInput.value.trim() : "";

      if (!fullName || !email || !password) {
        if (registerMessage) {
          registerMessage.textContent = "Please fill all fields.";
          registerMessage.className = "form-message error-message";
        }
        return;
      }

      if (enteredCaptcha !== generatedCaptcha) {
        if (captchaMessage) {
          captchaMessage.textContent = "Incorrect captcha. Please try again.";
          captchaMessage.className = "captcha-message error-message";
        }
        createCaptcha();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName,
            email,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (registerMessage) {
            registerMessage.textContent =
              data.message || "Registration failed. Please try again.";
            registerMessage.className = "form-message error-message";
          }

          createCaptcha();
          return;
        }

        localStorage.setItem(
          "beanBoutiqueCurrentUser",
          JSON.stringify({
            userId: data.userId,
            fullName: data.fullName,
            email: data.email
          })
        );

      } catch (error) {
        console.error("Registration error:", error);

        if (registerMessage) {
          registerMessage.textContent =
            "Unable to connect to the server. Please try again.";
          registerMessage.className = "form-message error-message";
        }

        return;
      }

      localStorage.removeItem("beanBoutiqueGuestDiscountUser");

      if (registerMessage) {
        registerMessage.textContent =
          "Registration successful. Human verification completed.";
        registerMessage.className = "form-message success-message";
      }

      registerForm.reset();
      createCaptcha();
      updateNavbarUserState();
      updateCartCount();
      renderCart();
      loadRatings();

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    });
  }

  // this if for login form 
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");

      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (!email || !password) {
        if (loginMessage) {
          loginMessage.textContent = "Please enter email and password.";
          loginMessage.className = "form-message error-message";
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (loginMessage) {
            loginMessage.textContent =
              data.message || "Invalid email or password.";
            loginMessage.className = "form-message error-message";
          }
          return;
        }

        localStorage.setItem(
          "beanBoutiqueCurrentUser",
          JSON.stringify({
            userId: data.userId,
            fullName: data.fullName,
            email: data.email
          })
        );

      } catch (error) {
        console.error("Login error:", error);

        if (loginMessage) {
          loginMessage.textContent =
            "Unable to connect to the server. Please try again.";
          loginMessage.className = "form-message error-message";
        }

        return;
      }

      localStorage.removeItem("beanBoutiqueGuestDiscountUser");

      if (loginMessage) {
        loginMessage.textContent = "Login successful.";
        loginMessage.className = "form-message success-message";
      }

      loginForm.reset();
      updateNavbarUserState();
      updateCartCount();
      renderCart();
      loadRatings();

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    });
  }

  //  event registeration form 
  const eventButtons = document.querySelectorAll(".event-fill-btn");
  const eventInput = document.getElementById("event-name");
  const eventForm = document.getElementById("event-form");
  const eventMessage = document.getElementById("event-message");

  eventButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (eventInput) {
        eventInput.value = button.dataset.event;
        window.scrollTo({
          top: eventInput.getBoundingClientRect().top + window.pageYOffset - 140,
          behavior: "smooth"
        });
      }
    });
  });

  if (eventForm) {
    eventForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const activeUser = getActiveSessionUser();

      const eventNameField = document.getElementById("event-name");
      const firstNameField = document.getElementById("event-first-name");
      const lastNameField = document.getElementById("event-last-name");
      const emailField = document.getElementById("event-email");
      const phoneField = document.getElementById("event-phone");

      const eventData = {
        eventName: eventNameField.value.trim(),
        firstName: firstNameField.value.trim(),
        lastName: lastNameField.value.trim(),
        email: emailField.value.trim().toLowerCase(),
        phone: phoneField.value.trim(),
        userEmail: activeUser ? activeUser.email.toLowerCase() : emailField.value.trim().toLowerCase()
      };

      if (
        !eventData.eventName ||
        !eventData.firstName ||
        !eventData.lastName ||
        !eventData.email ||
        !eventData.phone
      ) {
        if (eventMessage) {
          eventMessage.textContent = "Please fill all event registration fields.";
          eventMessage.className = "form-message error-message";
        }
        return;
      }

      const registrations =
        JSON.parse(localStorage.getItem("beanBoutiqueEventRegistrations")) || [];

      registrations.push({
        id: Date.now(),
        ...eventData,
        date: new Date().toLocaleString()
      });

      localStorage.setItem(
        "beanBoutiqueEventRegistrations",
        JSON.stringify(registrations)
      );

      if (eventMessage) {
        eventMessage.textContent = "Registration saved successfully. Your mail app will open now.";
        eventMessage.className = "form-message success-message";
      }

      const subject = encodeURIComponent(
        `Event Registration - ${eventData.eventName}`
      );

      const body = encodeURIComponent(
        `Event: ${eventData.eventName}
       First Name: ${eventData.firstName}
       Last Name: ${eventData.lastName}
       Email: ${eventData.email}
      Contact: ${eventData.phone}`
      );

      setTimeout(() => {
        window.location.href = `mailto:events@beanboutique.com?subject=${subject}&body=${body}`;
      }, 500);

      eventForm.reset();
    });
  }

  // this is for coffee search and filter 
  const searchInput = document.getElementById("coffee-search");
  const filterSelect = document.getElementById("coffee-filter");
  const coffeeCards = document.querySelectorAll(".coffee-item");
  const noResults = document.getElementById("no-results");

  function filterCoffeeCards() {
    if (!coffeeCards.length) return;

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filterValue = filterSelect ? filterSelect.value : "all";
    let visibleCount = 0;

    coffeeCards.forEach((card) => {
      const searchData = card.dataset.search
        ? card.dataset.search.toLowerCase()
        : "";
      const category = card.dataset.category;
      const matchesSearch = searchData.includes(searchValue);
      const matchesFilter = filterValue === "all" || category === filterValue;

      if (matchesSearch && matchesFilter) {
        card.style.display = "block";
        visibleCount += 1;
      } else {
        card.style.display = "none";
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchInput.classList.add("search-active");
      filterCoffeeCards();
    });

    searchInput.addEventListener("blur", () => {
      searchInput.classList.remove("search-active");
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", filterCoffeeCards);
  }

  // this is for rating widget
  function updateStars(group, rating) {
    const stars = group.querySelectorAll("i");

    stars.forEach((star) => {
      const value = Number(star.dataset.value);

      if (value <= rating) {
        star.classList.remove("far");
        star.classList.add("fas", "active");
      } else {
        star.classList.remove("fas", "active");
        star.classList.add("far");
      }
    });
  }

  function loadRatings() {
    const ratingGroups = document.querySelectorAll(".interactive-stars");

    ratingGroups.forEach((group) => {
      const product = group.dataset.product;
      const cleanProduct = product.toLowerCase().replace(/\s+/g, "-");

      const output = document.getElementById(`rating-output-${cleanProduct}`);

      const key = getRatingKey(product);
      const email = getSessionEmail();

      const savedRating = email
        ? Number(localStorage.getItem(key)) || 0
        : Number(sessionStorage.getItem(key)) || 0;

      updateStars(group, savedRating);

      if (output) {
        output.textContent =
          savedRating > 0 ? `Your rating: ${savedRating}/5` : "No rating yet";
      }

      const stars = group.querySelectorAll("i");
      stars.forEach((star) => {
        star.onclick = () => {
          const value = Number(star.dataset.value);
          const currentKey = getRatingKey(product);
          const currentEmail = getSessionEmail();
          if (currentEmail) {
            localStorage.setItem(currentKey, String(value));
          } else {
            window.name = "";
          }

          updateStars(group, value);

          if (output) {
            output.textContent = `Your rating: ${value}/5`;
          }
        };
      });
    });
  }

  loadRatings();

  // this is for scroll reveal
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }
});