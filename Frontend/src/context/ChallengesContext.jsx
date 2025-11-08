import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const ChallengesContext = createContext()

export function ChallengesProvider({ children }){
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try{
      const res = await api.get('/api/challenges')
      setChallenges(res.data || [])
    }catch(err){
      setChallenges([])
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  const create = async (payload) => {
    const res = await api.post('/api/challenges', payload)
    setChallenges(prev => [res.data, ...prev])
    return res.data
  }

  const update = async (id, payload) => {
    const res = await api.patch(`/api/challenges/${id}`, payload)
    setChallenges(prev => prev.map(c => c._id === id ? res.data : c))
    return res.data
  }

  const remove = async (id) => {
    await api.delete(`/api/challenges/${id}`)
    setChallenges(prev => prev.filter(c => c._id !== id))
  }

  return (
    <ChallengesContext.Provider value={{ challenges, loading, load, create, update, remove }}>
      {children}
    </ChallengesContext.Provider>
  )
}

export const useChallenges = () => useContext(ChallengesContext)
