import { createRouter, createWebHistory } from 'vue-router'
import StorefrontLayout from '../layouts/StorefrontLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Account from '../views/Account.vue'
import Checkout from '../views/Checkout.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminProductEdit from '../views/AdminProductEdit.vue'
import AdminUncategorizedProducts from '../views/AdminUncategorizedProducts.vue'
import CategoryManager from '../views/CategoryManager.vue'
import ProductCategoryMover from '../views/ProductCategoryMover.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import AdminOrderExportManager from '../views/AdminOrderExportManager.vue'
import ShippingReturns from '../views/ShippingReturns.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import TermsConditions from '../views/TermsConditions.vue'
import TrackOrder from '../views/TrackOrder.vue'

const routes = [
  {
    path: '/',
    component: StorefrontLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
      },
      {
        path: 'products',
        name: 'Products',
        component: Products,
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: ProductDetail,
      },
      {
        path: 'cart',
        name: 'Cart',
        component: Cart,
      },
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
      {
        path: 'register',
        name: 'Signup',
        component: Signup,
      },
      {
        path: 'account',
        name: 'Account',
        component: Account,
        meta: { requiresAuth: true },
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: Checkout,
        meta: { requiresAuth: true },
      },
      {
        path: 'order-confirmation/:orderId',
        name: 'OrderConfirmation',
        component: OrderConfirmation,
      },
      {
        path: 'shipping-returns',
        name: 'ShippingReturns',
        component: ShippingReturns,
      },
      {
        path: 'privacy-policy',
        name: 'PrivacyPolicy',
        component: PrivacyPolicy,
      },
      {
        path: 'terms-conditions',
        name: 'TermsConditions',
        component: TermsConditions,
      },
      {
        path: 'track-order',
        name: 'TrackOrder',
        component: TrackOrder,
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
      },
      {
        path: 'products/:id/edit',
        name: 'AdminProductEdit',
        component: AdminProductEdit,
      },
      {
        path: 'products/uncategorized',
        name: 'AdminUncategorizedProducts',
        component: AdminUncategorizedProducts,
      },
      {
        path: 'categories/manager',
        name: 'CategoryManager',
        component: CategoryManager,
      },
      {
        path: 'products/category-mover',
        name: 'ProductCategoryMover',
        component: ProductCategoryMover,
      },
      {
        path: 'orders/export-manager',
        name: 'AdminOrderExportManager',
        component: AdminOrderExportManager,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router