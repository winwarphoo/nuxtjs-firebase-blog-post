import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '~/plugins/firebase'

export default function ({ store, redirect }) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      store.dispatch('setUser', {
        uid: user.uid,
        displayName: user.displayName
      }).then(() => {
        if (!store.getters.isLoggedIn) {
          return redirect('/login')
        }
      })
    } else {
      return redirect('/login')
    }
  })
}
