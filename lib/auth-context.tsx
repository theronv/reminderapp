"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("reminder-app-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("reminder-app-users")
      const users = usersData ? JSON.parse(usersData) : []

      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        createdAt: new Date().toISOString(),
      }

      // Store password separately (in real app, this would be hashed on backend)
      users.push({ ...newUser, password })
      localStorage.setItem("reminder-app-users", JSON.stringify(users))

      // Set current user
      localStorage.setItem("reminder-app-user", JSON.stringify(newUser))
      setUser(newUser)
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersData = localStorage.getItem("reminder-app-users")
      const users = usersData ? JSON.parse(usersData) : []

      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        localStorage.setItem("reminder-app-user", JSON.stringify(userWithoutPassword))
        setUser(userWithoutPassword)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("reminder-app-user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
