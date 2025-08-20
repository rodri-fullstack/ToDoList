import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import App from './App'

describe('App', () => {
  it('renderiza el título', () => {
    render(<App />)
    expect(screen.getByText(/Lista de tareas/i)).toBeInTheDocument()
  })

  it('renderiza el botón flotante de nueva tarea', () => {
    render(<App />)
    expect(screen.getByLabelText(/Agregar nueva tarea/i)).toBeInTheDocument()
  })
})


