export const state = () => ({
  user: null,
  commentCountList: {}
})

// getter
export const getters = {
  isLoggedIn (state) {
    return !!state.user
  },
  getCommentCount () {
    return state.commentCountList
  }
}

// setter
export const mutations = {
  setUser (state, user) {
    state.user = user
  },
  setCommentCount (state, data) {
    state.commentCountList = data
  }
}

export const actions = {
  login ({ commit }, user) {
    commit('setUser', { ...user })
  },
  logout ({ commit }) {
    commit('setUser', null)
  },
  setUser ({ commit }, user) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('setUser', user)
        resolve()
      }, 1000)
    })
  },
  setCommentCount ({ commit }, data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('setCommentCount', data)
        resolve()
      }, 1000)
    })
  }

  // add: (context, { content, date }) => {
  //   if (content.trim()) {
  //     addDoc(commentRef, {
  //       content,
  //       date
  //     })
  //   }
  // }
}
