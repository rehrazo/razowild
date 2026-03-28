<template>
  <div class="cart">
    <h1>Shopping Cart</h1>

    <div v-if="cartItems.length > 0" class="cart-container">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="item-image" />
          
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p v-if="item.variantSummary" class="item-variant">{{ item.variantSummary }}</p>
            <p class="item-sku">SKU: {{ item.displaySku || item.sku }}</p>
            <p class="item-category">{{ item.category }}</p>
            <p class="item-price">${{ item.price.toFixed(2) }}</p>
          </div>

          <div class="quantity-control">
            <button @click="decrementQuantity(item.id)" class="qty-btn">−</button>
            <input 
              v-model.number="item.quantity" 
              type="number" 
              min="1"
              class="qty-input"
              @change="updateQuantity(item.id, item.quantity)"
            />
            <button @click="incrementQuantity(item.id)" class="qty-btn">+</button>
          </div>

          <p class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</p>

          <button @click="removeItem(item.id)" class="remove-btn">Remove</button>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Order Summary</h2>
        
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>

        <div v-if="tax > 0" class="summary-row">
          <span>Tax ({{ taxLabel }}):</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>

        <div class="summary-row">
          <span>Shipping:</span>
          <span>{{ shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}` }}</span>
        </div>

        <div class="discount-section" v-if="!couponApplied">
          <input 
            v-model="couponCode"
            type="text"
            placeholder="Enter coupon code"
            autocomplete="off"
            class="coupon-input"
          />
          <button @click="applyCoupon" class="btn btn-secondary">Apply</button>
        </div>

        <p v-if="couponError" class="coupon-error" aria-live="polite">{{ couponError }}</p>

        <div v-if="couponApplied" class="coupon-applied">
          <p>✓ Coupon applied: {{ couponCode }}</p>
        </div>

        <div class="summary-row total">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <button @click="checkout" class="btn btn-primary btn-large">
          Proceed to Checkout
        </button>

        <router-link to="/products" class="btn btn-secondary btn-large">
          Continue Shopping
        </router-link>
      </div>
    </div>

    <div v-else class="empty-cart">
      <h2>Your cart is empty</h2>
      <p>Add some camping gear to get started!</p>
      <router-link to="/products" class="btn btn-primary">Shop Now</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'

export default {
  name: 'Cart',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const cartItems = computed(() => cartStore.items)
    const couponCode = ref('')
    const couponApplied = ref(false)
    const couponError = ref('')
    const discountPercentage = ref(0)
    const taxRate = ref(0)

    const taxLabel = computed(() => {
      const pct = Math.round(taxRate.value * 10000) / 100
      return `${pct % 1 === 0 ? pct.toFixed(0) : pct}%`
    })

    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    const discount = computed(() => {
      return subtotal.value * (discountPercentage.value / 100)
    })

    const tax = computed(() => {
      return (subtotal.value - discount.value) * taxRate.value
    })

    const loadTaxRate = async () => {
      try {
        const response = await fetch('/api/tax-rates')
        const data = await response.json()
        const rates = Array.isArray(data?.data) ? data.data : []
        if (rates.length) {
          taxRate.value = Number(rates[0].rate) || 0
        }
      } catch (_err) {
        // keep at 0
      }
    }

    const shipping = computed(() => {
      return subtotal.value - discount.value >= 50 ? 0 : 9.99
    })

    const total = computed(() => {
      return subtotal.value - discount.value + tax.value + shipping.value
    })

    const incrementQuantity = (itemId) => {
      const item = cartItems.value.find((currentItem) => currentItem.id === itemId)
      if (item && item.quantity < 99) {
        cartStore.updateQuantity(itemId, item.quantity + 1)
      }
    }

    const decrementQuantity = (itemId) => {
      const item = cartItems.value.find((currentItem) => currentItem.id === itemId)
      if (item && item.quantity > 1) {
        cartStore.updateQuantity(itemId, item.quantity - 1)
      }
    }

    const updateQuantity = (itemId, newQuantity) => {
      cartStore.updateQuantity(itemId, Math.max(1, Math.min(99, Number(newQuantity) || 1)))
    }

    const removeItem = (itemId) => {
      cartStore.removeItem(itemId)
    }

    const applyCoupon = () => {
      const normalized = String(couponCode.value || '').trim().toUpperCase()
      couponError.value = ''

      if (!normalized) {
        couponError.value = 'Enter a coupon code before applying.'
        return
      }

      if (normalized === 'CAMP10') {
        discountPercentage.value = 10
        couponApplied.value = true
        couponCode.value = normalized
      } else if (normalized === 'CAMP20') {
        discountPercentage.value = 20
        couponApplied.value = true
        couponCode.value = normalized
      } else {
        couponApplied.value = false
        discountPercentage.value = 0
        couponError.value = 'That code is invalid. Try CAMP10 or CAMP20.'
      }
    }

    const checkout = () => {
      if (!cartItems.value.length) {
        return
      }
      router.push('/checkout')
    }

    onMounted(loadTaxRate)

    return {
      cartItems,
      couponCode,
      couponApplied,
      couponError,
      subtotal,
      discount,
      tax,
      taxLabel,
      shipping,
      total,
      incrementQuantity,
      decrementQuantity,
      updateQuantity,
      removeItem,
      applyCoupon,
      checkout,
    }
  },
}
</script>

<style scoped>
.cart {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.25rem 1.5rem;
}

.cart h1 {
  font-size: clamp(1.9rem, 3vw, 2.35rem);
  margin-bottom: 1.4rem;
  color: var(--dark-coffee);
}

.cart-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr 150px 100px 80px;
  gap: 1rem;
  align-items: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 6px 20px rgba(65, 39, 34, 0.05);
}

.item-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.16rem;
  line-height: 1.35;
}

.item-category {
  color: var(--color-text-subtle);
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.item-variant {
  color: var(--color-text);
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.item-sku {
  color: var(--dark-spruce);
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.item-price {
  color: var(--color-accent);
  font-weight: 600;
  margin: 0.5rem 0 0 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.25rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--apricot-cream-muted);
  cursor: pointer;
  border-radius: 2px;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.qty-btn:hover {
  background-color: var(--color-border);
}

.qty-input {
  width: 50px;
  text-align: center;
  border: none;
  font-size: 1rem;
}

.qty-input:focus {
  outline: none;
}

.item-total {
  font-weight: 600;
  color: var(--color-accent);
  text-align: right;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background-color: var(--color-accent-dark);
}

.cart-summary {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 14px;
  box-shadow: 0 8px 24px rgba(65, 39, 34, 0.06);
}

.cart-summary h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.summary-row.total {
  border-bottom: none;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: 1.5rem;
  padding-bottom: 0;
}

.discount-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.coupon-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
}

.coupon-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(12, 124, 89, 0.18);
}

.coupon-error {
  margin: 0 0 0.9rem;
  color: var(--state-error-text);
  font-size: 0.9rem;
}

.coupon-applied {
  background-color: var(--state-success-bg);
  color: var(--state-success-text);
  border: 1px solid var(--state-success-border);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.btn-large {
  padding: 1rem;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-accent-dark);
}

.btn-secondary {
  background-color: var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border-strong);
}

.empty-cart {
  text-align: center;
  padding: 3rem;
}

.empty-cart h2 {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.empty-cart p {
  color: var(--color-text-subtle);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.empty-cart .btn {
  width: auto;
  display: inline-block;
  padding: 0.75rem 2rem;
}

@media (max-width: 768px) {
  .cart {
    padding: 1.25rem 1rem;
  }

  .cart-container {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 0.75rem;
    padding: 0.85rem;
  }

  .item-details,
  .quantity-control,
  .item-total,
  .remove-btn {
    grid-column: 2;
  }

  .item-total {
    text-align: left;
    margin-top: 0.25rem;
  }

  .item-image {
    grid-row: 1 / 3;
    width: 80px;
    height: 80px;
  }

  .quantity-control {
    justify-self: flex-start;
  }

  .remove-btn {
    justify-self: flex-start;
  }

  .cart-summary {
    position: static;
    padding: 1.2rem;
  }
}
</style>