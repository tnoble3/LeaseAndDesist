import React from 'react'

export default function ProgressBar({ percent=0 }){
  return (
    <div style={{background:'#eee',height:14,borderRadius:8,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${percent}%`,background:'#0b5cff'}} />
    </div>
  )
}
