<template>
  <v-container>
    <h1>Sign up</h1>
    <v-form>
      <v-text-field v-model="name" type="text" label="Name" prepend-icon="mdi-nature-people" />
      <v-text-field v-model="email" type="email" label="Email" :rules="[required]" prepend-icon="mdi-email" />
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Password"
        :rules="[required, min_length, max_length]"
        prepend-icon="mdi-lock"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword=!showPassword"
      />
      <v-text-field
        v-model="confirmPassword"
        :type="showPassword ? 'text' : 'Confirm Password'"
        label="Confirm Password"
        :rules="[required, min_length, max_length]"
        prepend-icon="mdi-lock"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword=!showPassword"
      />
      <v-btn color="primary" @click="signup">
        Signup
      </v-btn>
      <div>{{ message }}</div>
    </v-form>
  </v-container>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from '@firebase/auth'
import { auth } from '../plugins/firebase'
export default {
  name: 'SignupPage',
  data () {
    return {
      email: '',
      confirmPassword: '',
      showPassword: false,
      password: '',
      name: '',
      message: '',
      required: value => !!value || '必須です。',
      min_length: value => value.length >= 8 || '短すぎです',
      max_length: value => value.length <= 20 || '長すぎです'
    }
  },
  methods: {
    signup () {
      if (this.email.trim() && this.password.trim()) {
        if (this.password === this.confirmPassword) {
          createUserWithEmailAndPassword(auth, this.email, this.password)
            .then((userCredential) => {
              const user = userCredential.user
              updateProfile(user, { displayName: this.name })
                .then(() => {
                  const user = auth.currentUser
                  // const actionCodeSettings = {
                  //   url: `localhost:3000/sign-in/?email=${user.email}`
                  // }
                  // auth.currentUser.sendEmailVerification(user, actionCodeSettings)
                  this.message = 'アカウントが作成されました' + (user.displayName || user.uid)
                  this.$store.dispatch('setUser', {
                    uid: user.uid,
                    displayName: user.displayName
                  })
                  this.$router.push('/login')
                })
            })
            .catch((err) => {
              this.message = err.message
            })
        } else {
          this.message = 'パスワードが一致しません'
        }
      }
    }
  }
}
</script>

<style>

</style>
