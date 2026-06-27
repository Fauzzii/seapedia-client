import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function useAuthUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true })
        if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data))
          return response.data
        }
      } catch (err) {
        localStorage.removeItem('user')
        return null
      }
      return null
    },
    initialData: () => {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    },
    staleTime: 5 * 60 * 1000
  })
}
