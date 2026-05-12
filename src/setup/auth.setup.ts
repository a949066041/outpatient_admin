import type { Router } from 'vue-router'
import { readSessionSnapshot, useLoginStore } from '~/store'

export function authSetup(router: Router) {
  router.beforeEach((to, _from, next) => {
    const login = useLoginStore()
    login.hydrateSessionFromStorage()
    const snap = readSessionSnapshot()
    const sessionEff = snap ?? login.session.value
    const isLogin = !!sessionEff
    const currentRole = sessionEff?.role ?? null

    if (to.path === '/register' || to.path === '/forgot-password') {
      next()
      return
    }

    if (to.path.startsWith('/home')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole === '医生') {
        next({ path: '/doctor' })
        return
      }
    }

    if (to.path.startsWith('/back')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole !== '管理员') {
        next(currentRole === '医生' ? '/doctor' : '/home')
        return
      }
    }

    if (to.path.startsWith('/doctor')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole !== '医生') {
        next(currentRole === '管理员' ? '/back' : '/home')
        return
      }
    }

    if (to.path === '/login' && isLogin) {
      const r = currentRole
      next(r === '管理员' ? '/back' : r === '医生' ? '/doctor' : '/home')
      return
    }

    next()
  })
}
