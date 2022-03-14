<template>
  <form @submit.prevent="forgotPassword">
    <h3>Forgot Password</h3>
    <v-text-field v-model="email" type="email" label="Email" />
    <v-btn type="submit" color="primary" @click.prevent="forgetPassword">
      Reset password
    </v-btn>
    <div>{{ error }}</div>
  </form>
</template>

<script>
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../plugins/firebase'
export default {
  data () {
    return {
      email: '',
      error: null,
      emailSending: false
    }
  },
  methods: {
    forgetPassword () {
      if (!this.email) {
        this.error = 'Please type in a valid email address.'
        return
      }
      this.error = null
      this.emailSending = true
      sendPasswordResetEmail(auth, this.email)
        .then(() => {
          this.emailSending = false
          // alert('Check your registered email to reset the password!')
          this.email = ''
        })
        .catch((error) => {
          this.emailSending = false
          this.error = error.message
        })
    }
  }
}
</script>
