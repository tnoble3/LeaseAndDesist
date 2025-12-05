import fs from 'fs'

const base = 'http://localhost:5000/api'

const rand = Math.floor(Math.random()*100000)
const email = `smoke${rand}@example.com`
const password = 'Password1!'

async function run(){
  try{
    console.log('Registering user', email)
    let res = await fetch(`${base}/users/register`, {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({name:'Smoke Tester', email, password})
    })
    let data = await res.json()
    if (!res.ok) throw new Error('Register failed: '+JSON.stringify(data))
    console.log('Registered, token present:', !!data.token)

    console.log('Logging in')
    res = await fetch(`${base}/users/login`,{
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({email, password})
    })
    data = await res.json()
    if (!res.ok) throw new Error('Login failed: '+JSON.stringify(data))
    const token = data.token
    console.log('Login OK, token length:', token.length)

    const auth = { 'content-type':'application/json', 'authorization': 'Bearer '+token }

    console.log('Creating goal')
    res = await fetch(`${base}/goals`, { method:'POST', headers:auth, body: JSON.stringify({ title: 'Smoke Goal '+rand, description: 'created by smoke test' }) })
    let goal = await res.json()
    if (!res.ok) throw new Error('Create goal failed: '+JSON.stringify(goal))
    console.log('Goal created id:', goal._id)

    console.log('Creating challenge under goal')
    res = await fetch(`${base}/challenges`, { method:'POST', headers:auth, body: JSON.stringify({ title: 'Smoke Challenge '+rand, description:'smoke', goal: goal._id }) })
    let challenge = await res.json()
    if (!res.ok) throw new Error('Create challenge failed: '+JSON.stringify(challenge))
    console.log('Challenge created id:', challenge._id, 'completed:', challenge.completed)

    console.log('Marking challenge complete')
    res = await fetch(`${base}/challenges/${challenge._id}/complete`, { method:'PATCH', headers:auth, body: JSON.stringify({ completed: true }) })
    let updated = await res.json()
    if (!res.ok) throw new Error('Complete failed: '+JSON.stringify(updated))
    console.log('Challenge now completed:', updated.completed)

    console.log('Fetching challenges for goal')
    res = await fetch(`${base}/challenges?goalId=${goal._id}`, { headers: auth })
    let list = await res.json()
    if (!res.ok) throw new Error('Fetch challenges failed: '+JSON.stringify(list))
    console.log('Challenges count for goal:', list.length, 'first.completed=', list[0]?.completed)

    console.log('\nSMOKE TEST SUCCESS')
  }catch(err){
    console.error('SMOKE TEST FAILED:', err.message)
    process.exitCode = 2
  }
}

run()
