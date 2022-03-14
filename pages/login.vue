<template>
  <v-container>
    <h1>Login</h1>
    <v-form ref="login_form">
      <v-text-field v-model="email" type="email" label="Email" :rules="[required]" />
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Password"
        :rules="[required, min_length, max_length]"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword=!showPassword"
      />
      <v-btn type="submit" color="primary" @click.prevent="login">
        Login
      </v-btn>
      <div>{{ message }}</div>
      <div class="pt-4">
        <nuxt-link to="/signup">
          Create Account
        </nuxt-link>
      </div>
      <div class="pt-4">
        <nuxt-link to="/forgotPassword">
          Forgot Password
        </nuxt-link>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../plugins/firebase'
export default {
  name: 'LoginPage',
  data () {
    return {
      email: '',
      password: '',
      message: '',
      showPassword: false,
      required: value => !!value || '必須です。',
      min_length: value => value.length >= 8 || '短すぎです',
      max_length: value => value.length <= 20 || '長すぎです'
    }
  },
  methods: {
    login () {
      if (this.$refs.login_form.validate()) {
        signInWithEmailAndPassword(auth, this.email, this.password)
          .then((userCredential) => {
            const user = userCredential.user
            this.message = 'ログイン! : ' + (user.displayName || user.uid)
            this.$store.dispatch('setUser', {
              uid: user.uid,
              displayName: user.displayName
            })
            localStorage.removeItem('editBlog')
            this.$router.push('/')
          })
          .catch(() => {
            this.message = 'ログインできません'
          })
      } else {
        this.message = '入力エラーがあります'
      }
    }
  }
}
</script>

<style>

</style>
