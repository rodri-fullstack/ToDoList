import { useState, useEffect } from 'react'

export default function useLocalStorage(key, initialValue){
  const [value, setValue] = useState(()=>{
    try{
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    }catch{
      return initialValue
    }
  })

  useEffect(()=>{
    try{
      window.localStorage.setItem(key, JSON.stringify(value))
    }catch{}
  }, [key, value])

  // Sincronizar el estado cuando cambia la clave
  useEffect(()=>{
    try{
      const item = window.localStorage.getItem(key)
      setValue(item ? JSON.parse(item) : initialValue)
    }catch{}
  }, [key])

  return [value, setValue]
}
