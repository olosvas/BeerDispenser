// Customer interface global state variables
const cartItems = [];
let selectedBeverage = null;
let selectedSize = null;
let currentQuantity = 1;
let beveragesRequiringVerification = ['beer', 'birel']; // Types that require age verification

// DOM element references
const beverageTypeOptions = document.querySelectorAll('.beverage-option');
const beverageSizeOptions = document.querySelectorAll('.size-option');
const beverageTypeDisplay = document.getElementById('selected-beverage-type');
const continueTypeBtn = document.getElementById('continue-to-size-btn');
const backToTypeBtn = document.getElementById('back-to-type-btn');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const viewCartBtn = document.getElementById('view-cart-btn');
const viewCartFromSizeBtn = document.getElementById('view-cart-from-size-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const continueShopping = document.getElementById('continue-shopping-btn');
const quantityInput = document.getElementById('quantity-input');
const increaseQuantityBtn = document.getElementById('increase-quantity-btn');
const decreaseQuantityBtn = document.getElementById('decrease-quantity-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const orderProgress = document.getElementById('order-progress');
const messageContainer = document.getElementById('message-container');

// Age verification elements
const verificationMethods = document.getElementById('verification-methods');
const webcamVerification = document.getElementById('webcam-verification');
const webcamVerifyBtn = document.getElementById('webcam-verify-btn');
const webcamContainer = document.getElementById('webcam-container');
const webcamFeed = document.getElementById('webcam-feed');
const capturedImage = document.getElementById('captured-image');
const webcamStartBtn = document.getElementById('webcam-start-btn');
const webcamCaptureBtn = document.getElementById('webcam-capture-btn');
const webcamBackBtn = document.getElementById('webcam-back-btn');
const captureResult = document.getElementById('capture-result');
const webcamRetryBtn = document.getElementById('webcam-retry-btn');
const webcamUseBtn = document.getElementById('webcam-use-btn');

// Payment elements
const paymentScreen = document.getElementById('payment-screen');
const paymentTotal = document.getElementById('payment-total');
const paymentItems = document.getElementById('payment-items');
const startPaymentBtn = document.getElementById('start-payment-btn');

// Dispensing elements
const dispensingScreen = document.getElementById('dispensing-screen');
const dispensingStatus = document.getElementById('dispensing-status');
const dispensingProgress = document.getElementById('dispensing-progress');

// Screen elements
const screens = document.querySelectorAll('.screen');

// Webcam
let webcamStream = null;

// Log DOM element references for debugging
console.log('DOM Elements:');
console.log('beverageTypeOptions:', beverageTypeOptions ? beverageTypeOptions.length : 'not found');
console.log('beverageSizeOptions:', beverageSizeOptions ? beverageSizeOptions.length : 'not found');
console.log('beverageTypeDisplay:', beverageTypeDisplay ? 'found' : 'not found');
console.log('continueTypeBtn:', continueTypeBtn ? 'found' : 'not found');
console.log('backToTypeBtn:', backToTypeBtn ? 'found' : 'not found');
console.log('addToCartBtn:', addToCartBtn ? 'found' : 'not found');
console.log('viewCartBtn:', viewCartBtn ? 'found' : 'not found');
console.log('viewCartFromSizeBtn:', viewCartFromSizeBtn ? 'found' : 'not found');
console.log('checkoutBtn:', checkoutBtn ? 'found' : 'not found');
console.log('continueShopping:', continueShopping ? 'found' : 'not found');
console.log('quantityInput:', quantityInput ? 'found' : 'not found');
console.log('increaseQuantityBtn:', increaseQuantityBtn ? 'found' : 'not found');
console.log('decreaseQuantityBtn:', decreaseQuantityBtn ? 'found' : 'not found');
console.log('cartCount:', cartCount ? 'found' : 'not found');
console.log('cartItemsList:', cartItemsList ? 'found' : 'not found');
console.log('cartTotalPrice:', cartTotalPrice ? 'found' : 'not found');
