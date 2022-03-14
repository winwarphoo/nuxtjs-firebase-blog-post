<template>
  <v-container>
    <div v-if="user">
      <h1>
        Blog Information
      </h1>
      <v-form @submit.prevent="addBlog">
        <v-text-field v-model="title" label="Title" />
        <v-textarea v-model="content" label="Content" />
        <v-btn v-if="blog_id === ''" type="submit" color="primary">
          Submit
        </v-btn>
        <v-btn v-else color="primary" @click="updateBlog(blog_id)">
          Update
        </v-btn>
      </v-form>
    </div>
    <div v-else>
      <h2>Require Login</h2>
      <nuxt-link to="/login">
        Login
      </nuxt-link>
    </div>
  </v-container>
</template>

<script>
import { addDoc, collection, doc, serverTimestamp, updateDoc } from '@firebase/firestore'
import { db } from '../plugins/firebase'
const blogsCollectionRef = collection(db, 'blogs')
export default {
  name: 'BlogPage',
  data () {
    return {
      blog_id: '',
      title: '',
      content: '',
      created_at: serverTimestamp(),
      user_name: '',
      user_id: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    // TOFIX: When ADD Blog, clear data
    const editBlog = JSON.parse(localStorage.getItem('editBlog'))
    if (editBlog) {
      this.blog_id = editBlog.id
      this.title = editBlog.title
      this.content = editBlog.content
    }
  },
  methods: {
    addBlog () {
      if (this.title.trim() && this.content.trim()) {
        addDoc(blogsCollectionRef, {
          title: this.title,
          content: this.content,
          created_at: this.created_at,
          user_name: this.$store.state.user.displayName,
          user_id: this.$store.state.user.uid
        })
          .then(() => {
            this.title = ''
            this.content = ''
          })
      }
    },
    updateBlog (id) {
      const docRef = doc(db, 'blogs', id)
      updateDoc(docRef, {
        title: this.title,
        content: this.content
      })
        .then(() => {
          this.title = ''
          this.content = ''
        })
      this.$router.push('/')
    }
  }
}
</script>

<style>

</style>
