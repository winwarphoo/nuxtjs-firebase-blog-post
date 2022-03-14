<template>
  <v-container>
    <h1>Blogs List</h1>
    <v-row>
      <v-col cols="6">
        <v-text-field v-model="searchTitle" label="Search" @keydown.enter="searchBlog()">
          <template #append-outer>
            <v-btn icon @click="searchBlog()">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <v-col v-for="blog in blogs" :key="blog.id" cols="12">
        <v-card>
          <v-card-title>
            {{ blog.title }}
            <span v-if="blog.user_name">
              &nbsp;(Blogger: {{ blog.user_name }})
            </span>
          </v-card-title>
          <v-card-subtitle style="word-break: normal!important" v-text="blog.content" />
          <v-card-text v-if="blog.created_at">
            PostDate: {{ $dateFns.format(blog.created_at.toDate(), 'yyyy/MM/dd') }}
          </v-card-text>
          <v-card-text v-if="user && user.uid === blog.user_id">
            <v-dialog v-model="dialogDelete" persistent max-width="600px" :retain-focus="false">
              <template #activator="{ on }">
                <v-btn
                  fab
                  color="red"
                  class="white--text"
                  x-small
                  @click="setDeleteBlogID(blog.id)"
                  v-on="on"
                >
                  <v-icon small>
                    mdi-trash-can-outline
                  </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>Do you want to delete this blog?</v-card-title>
                <v-card-actions>
                  <v-btn color="primary" text @click="dialogDelete = false">
                    Close
                  </v-btn>
                  <v-btn color="primary" text @click="removeTargetBlog()">
                    Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn
              fab
              color="blue"
              class="white--text"
              x-small
              @click="updateBlog(blog)"
            >
              <v-icon small>
                mdi-clipboard-edit-outline
              </v-icon>
            </v-btn>
          </v-card-text>
          <v-card-text>
            <v-icon>
              mdi-comment-bookmark
            </v-icon>
            <span v-if="comment[blog.id] > 0">{{ comment[blog.id] }}</span>
            <span v-else>No Comment</span>
          </v-card-text>
          <v-card-text>
            <v-dialog v-model="dialog" persistent max-width="600px" :retain-focus="false">
              <template #activator="{ on }">
                <v-btn color="#5963F8" dark class="font-weight-bold" @click="getComments(blog)" v-on="on">
                  Comments
                </v-btn>
              </template>
              <v-card v-if="user">
                <v-card-title> Comments: </v-card-title>
                <v-card-text v-if="comments">
                  <ul v-for="com in comments" :key="com.id">
                    <li>
                      {{ com.content }}
                      <v-btn
                        v-if="user && user.uid === com.user_id"
                        color="red"
                        class="white--text"
                        icon
                        @click="deleteComment(com)"
                      >
                        <v-icon small>
                          mdi-trash-can-outline
                        </v-icon>
                      </v-btn>
                    </li>
                  </ul>
                </v-card-text>
                <v-card-title><span class="headline">Write New Comment</span></v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-textarea v-model="content" label="Content" />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <div class="flex-grow-1">
                    <v-btn color="primary" text @click="dialog = false">
                      Cancel
                    </v-btn>
                    <v-btn color="primary" text @click="addComment(blog)">
                      Add Comment
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
              <v-card v-else>
                <v-card-text>If you Create Comment Require Login</v-card-text>
                <v-card-actions>
                  <div class="flex-grow-1">
                    <nuxt-link to="/login">
                      LOGIN
                    </nuxt-link>
                    <v-btn color="primary" text @click="dialog = false">
                      Cancel
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div v-show="originalBlogs.length > pageSize" class="text-center">
      <v-pagination
        v-model="page"
        :length="length"
        prev-icon="mdi-menu-left"
        next-icon="mdi-menu-right"
        @input="pageChange"
      />
    </div>
  </v-container>
</template>
<script>
import { addDoc, collection, deleteDoc, onSnapshot, doc, query, orderBy, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../plugins/firebase'
const blogsCollectionRef = collection(db, 'blogs')
const commentsRef = collection(db, 'comments')
export default {
  name: 'IndexPage',
  data () {
    return {
      blogs: [],
      originalBlogs: [],
      blogsList: [],
      comments: [],
      snackbar: '',
      searchTitle: '',
      blog_id: '',
      user_id: '',
      content: '',
      date: serverTimestamp(),
      user_name: '',
      dialog: false,
      showdelete: false,
      dialogDelete: false,
      modal: false,
      length: 0,
      page: 1,
      pageSize: 5,
      selectedBlog: [],
      comCount: '',
      commentCount: {},
      deleteBlogID: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    comment () {
      return this.$store.state.commentCountList
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      const q = query(blogsCollectionRef, orderBy('created_at', 'desc'))
      onSnapshot(q, (querySnapshot) => {
        this.originalBlogs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        this.doPagination(this.originalBlogs)
        // for search process
        this.blogsList = this.originalBlogs
        // for comment's count and selected blog's comments start
        this.originalBlogs.forEach((blog) => {
          const blogRef = doc(db, 'blogs', blog.id)
          const queryStr = query(commentsRef, where('blog_id', '==', blogRef))
          onSnapshot(queryStr, (querySnapshot) => {
            // for comment's count
            const targetComments = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
            this.commentCount[blog.id] = targetComments.length
          })
        })
        // for comment's count and selected blog's comments end
      })
      // save commentCount inside store
      this.$store.dispatch('setCommentCount', this.commentCount)
    },
    getComments (blog) {
      // show comment add dialog
      this.dialog = true
      this.selectedBlog = blog
      // get target comments
      const blogRef = doc(db, 'blogs', this.selectedBlog.id)
      const queryStr = query(commentsRef, where('blog_id', '==', blogRef))
      onSnapshot(queryStr, (querySnapshot) => {
        this.comments = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      })
    },
    addComment () {
      const blogRef = doc(db, 'blogs', this.selectedBlog.id)
      if (this.content.trim()) {
        addDoc(commentsRef, {
          content: this.content,
          date: this.date,
          blog_id: blogRef,
          user_id: this.$store.state.user.uid
        })
          .then(() => {
            this.content = ''
          })
        const q = query(commentsRef, where('blog_id', '==', blogRef))
        onSnapshot(q, (querySnapshot) => {
          this.comments = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        })
      }
    },
    setDeleteBlogID (id) {
      this.deleteBlogID = id
    },
    removeTargetBlog () {
      const blogsCollectionRef = doc(db, 'blogs', this.deleteBlogID)
      deleteDoc(blogsCollectionRef)
      this.dialogDelete = false
    },
    deleteComment (comment) {
      // delete target comment from database
      const commentRef = doc(db, 'comments', comment.id)
      deleteDoc(commentRef)
    },
    updateBlog (blog) {
      localStorage.setItem('editBlog', JSON.stringify(blog))
      this.$router.push('/blog')
    },
    searchBlog () {
      this.originalBlogs = this.blogsList
      if (this.searchTitle.trim() !== '') {
        this.originalBlogs = this.originalBlogs.filter(blog => blog.title.includes(this.searchTitle))
      }
      this.doPagination(this.originalBlogs)
    },
    pageChange (pageNumber) {
      this.blogs = this.originalBlogs.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    doPagination (list) {
      // pagination start
      this.length = Math.ceil(list.length / this.pageSize)
      this.blogs = list.slice(this.pageSize * (this.page - 1), this.pageSize * (this.page))
      // pagination end
    }
  }
}
</script>
