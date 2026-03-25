<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Side - Branding -->
      <div class="login-branding">
        <div class="brand-content">
          <div class="brand-icon">⛺</div>
          <h1>Razo Wild</h1>
          <p>Your one-stop shop for quality camping gear</p>
          
          <div class="benefits">
            <div class="benefit">
              <span class="benefit-icon">🚚</span>
              <span>Fast & Free Shipping</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">🔒</span>
              <span>Secure Checkout</span>
            </div>
            <div class="benefit">
              <span class="benefit-icon">↩️</span>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-form-container">
        <div class="form-wrapper">
          <h2>Welcome Back</h2>
          <p class="form-subtitle">Sign in to your account</p>

          <!-- Social Login -->
          <div class="social-login">
            <button class="social-btn google-btn">
              <span class="social-icon">G</span>
              Continue with Google
            </button>
            <button class="social-btn facebook-btn">
              <span class="social-icon">f</span>
              Continue with Facebook
            </button>
          </div>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                id="email"
                v-model="loginForm.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                class="form-input"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-input-wrapper">
                <input 
                  id="password"
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  class="form-input"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input v-model="loginForm.rememberMe" type="checkbox" />
                <span>Remember me</span>
              </label>
              <router-link to="/forgot-password" class="forgot-password">
                Forgot password?
              </router-link>
            </div>

            <button type="submit" class="btn btn-primary btn-large">
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Sign Up Link -->
          <p class="signup-prompt">
            Don't have an account? 
            <router-link to="/register" class="signup-link">Create one</router-link>
          </p>

          <!-- Guest Checkout -->
          <div class="guest-checkout">
            <p>Want to checkout as a guest?</p>
            <router-link to="/cart" class="link-btn">Continue to Cart</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isLoading = ref(false)
    const showPassword = ref(false)

    const loginForm = ref({
      email: '',
      password: '',
      rememberMe: false,
    })

    const errors = ref({
      email: '',
      password: '',
    })

    const validateForm = () => {
      errors.value = { email: '', password: '' }
      let isValid = true

      if (!loginForm.value.email) {
        errors.value.email = 'Email is required'
        isValid = false
      } else if (!isValidEmail(loginForm.value.email)) {
        errors.value.email = 'Please enter a valid email'
        isValid = false
      }

      if (!loginForm.value.password) {
        errors.value.password = 'Password is required'
        isValid = false
      }

      return isValid
    }

    const isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    }

    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }

      isLoading.value = true

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginForm.value.email,
            password: loginForm.value.password,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || 'Invalid email or password')
        }

        authStore.login(
          data.user,
          data.token,
          data.user?.role || 'customer'
        )

        const redirectTarget = String(router.currentRoute.value.query.redirect || '/')
        router.push(redirectTarget)
      } catch (error) {
        console.error('Login error:', error)
        errors.value.email = error.message || 'Invalid email or password'
      } finally {
        isLoading.value = false
      }
    }

    return {
      loginForm,
      errors,
      isLoading,
      showPassword,
      handleLogin,
    }
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(246, 216, 174, 0.45);
  padding: 1.75rem 1rem;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(65, 39, 34, 0.12);
  max-width: 1060px;
  width: 100%;
}

.login-branding {
  background: linear-gradient(135deg, var(--dark-spruce) 0%, var(--color-accent-dark) 100%);
  color: white;
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
}

.brand-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.login-branding h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.login-branding p {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 2rem;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  margin-top: 2rem;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.benefit-icon {
  font-size: 1.5rem;
}

.login-form-container {
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-wrapper h2 {
  font-size: clamp(1.65rem, 2.2vw, 1.95rem);
  color: var(--dark-coffee);
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: var(--color-text-subtle);
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
}

.social-btn:hover {
  border-color: var(--color-accent);
  background-color: var(--apricot-cream-muted);
}

.social-icon {
  font-weight: 700;
  font-size: 1.1rem;
}

.google-btn:hover {
  border-color: var(--badge-social-google);
}

.facebook-btn:hover {
  border-color: var(--badge-social-facebook);
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border);
}

.divider span {
  background-color: white;
  padding: 0 0.75rem;
  color: var(--color-text-subtle);
  position: relative;
  font-size: 0.9rem;
}

.form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(12, 124, 89, 0.18);
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: var(--color-accent);
}

.error-message {
  display: block;
  color: var(--state-error-text);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
}

.remember-me input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.forgot-password {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 600;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-accent-dark);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem;
}

.signup-prompt {
  text-align: center;
  color: var(--color-text-subtle);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.signup-link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.signup-link:hover {
  text-decoration: underline;
}

.guest-checkout {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.guest-checkout p {
  color: var(--color-text-subtle);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.link-btn {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .login-branding {
    padding: 2rem;
    border-radius: 12px 12px 0 0;
  }

  .login-branding h1 {
    font-size: 1.8rem;
  }

  .login-branding p {
    font-size: 0.95rem;
  }

  .benefits {
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .benefit-icon {
    font-size: 1.2rem;
  }

  .login-form-container {
    padding: 2rem 1rem;
    border-radius: 0 0 12px 12px;
  }

  .form-wrapper h2 {
    font-size: 1.5rem;
  }
}
</style>