<template>
  <v-app>
    <v-app-bar color="primary" class="white--text" app>
      <v-toolbar-title to="/">
        Blog-Post
      </v-toolbar-title>
      <v-spacer />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            class="white--text"
            icon
            text
            to="/"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-home-variant-outline</v-icon>
          </v-btn>
        </template>
        <span>Home</span>
      </v-tooltip>
      <div v-if="!user">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="white--text"
              icon
              text
              to="/login"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <span>Login</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="white--text"
              icon
              text
              to="/signup"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-account-multiple-plus</v-icon>
            </v-btn>
          </template>
          <span>Sign Up</span>
        </v-tooltip>
      </div>
      <div v-if="user">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="white--text"
              icon
              text
              to="/blog"
              v-bind="attrs"
              v-on="on"
              @click="addBlog"
            >
              <v-icon>mdi-plus-thick</v-icon>
            </v-btn>
          </template>
          <span>Add Blog</span>
        </v-tooltip>
        {{ user.displayName }}
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              class="white--text"
              icon
              text
              to="/"
              v-bind="attrs"
              v-on="on"
              @click="logout"
            >
              <v-icon>mdi-logout-variant</v-icon>
            </v-btn>
          </template>
          <span>Logout</span>
        </v-tooltip>
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer color="primary" padless>
      <v-row justify="center">
        <v-col class="primary py-4 text-center white--text" cols="12">
          {{ new Date().getFullYear() }} — <strong>Blog</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../plugins/firebase'
export default {
  name: 'DefaultLayout',
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Index',
          to: '/'
        },
        {
          icon: 'mdi-account-circle',
          title: 'Login',
          to: '/login'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    this.onAuthStateChanged()
  },
  methods: {
    onAuthStateChanged () {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.$store.dispatch('setUser', {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email
          })
        }
      })
    },
    logout () {
      signOut(auth).then(() => {
        this.$store.dispatch('logout', null)
      })
    },
    addBlog () {
      localStorage.removeItem('editBlog')
      this.$router.push('/blog')
    }
  }
}
</script>

<style scoped>

</style>
