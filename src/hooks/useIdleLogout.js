import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export default function useIdleLogout(timeoutMs = 15 * 60 * 1000) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const timerRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser || location.pathname === '/login' || location.pathname === '/register') {
      return
    }

    const logout = async () => {
      try {
        await axios.delete('http://localhost:5000/api/auth/logout', { withCredentials: true })
      } catch (err) {
        console.error('Auto-logout API error:', err)
      } finally {
        localStorage.removeItem('user')
        queryClient.setQueryData(['authUser'], null)
        queryClient.invalidateQueries()
        navigate('/login')
      }
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        logout()
      }, timeoutMs)
    }

    resetTimer()

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [navigate, location.pathname, queryClient, timeoutMs])
}
