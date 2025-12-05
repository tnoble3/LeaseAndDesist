import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AppDataContext = createContext()

export const AppDataProvider = ({ children }) => {
  const [goals, setGoals] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAll = async ()=>{
    setLoading(true)
    try{
      const [gRes, cRes] = await Promise.all([api.get('/goals'), api.get('/challenges')])
      setGoals(gRes.data)
      setChallenges(cRes.data)
    }catch(err){
      console.error('fetchAll error', err)
    }finally{
      setLoading(false)
    }
  }

  // Goals
  const createGoal = async (title) => {
    const res = await api.post('/goals', { title })
    setGoals(prev => [res.data, ...prev])
    return res.data
  }

  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`)
    // remove associated challenges too
    setChallenges(prev => prev.filter(c => c.goal !== id))
    setGoals(prev => prev.filter(g => g._id !== id))
  }

  // Challenges
  const createChallenge = async ({ title, goalId }) => {
    const res = await api.post('/challenges', { title, goal: goalId })
    setChallenges(prev => [res.data, ...prev])
    return res.data
  }

  const toggleChallenge = async (id, completed) => {
    const res = await api.patch(`/challenges/${id}/complete`, { completed: !completed })
    setChallenges(prev => prev.map(c => c._id===id?res.data:c))
    return res.data
  }

  const deleteChallenge = async (id) => {
    await api.delete(`/challenges/${id}`)
    setChallenges(prev => prev.filter(c => c._id !== id))
  }

  return (
    <AppDataContext.Provider value={{
      goals,
      challenges,
      loading,
      fetchAll,
      createGoal,
      deleteGoal,
      createChallenge,
      toggleChallenge,
      deleteChallenge
    }}>
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)

export default AppDataContext
