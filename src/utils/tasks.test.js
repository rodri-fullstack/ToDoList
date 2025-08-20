import { describe, it, expect } from 'vitest'
import { filterAndSortTasks } from './tasks'

const base = [
  { id: '1', title: 'A', description: '', category: 'general', completed: false, createdAt: '2024-01-01', updatedAt: '2024-01-02', dueDate: '2024-12-31' },
  { id: '2', title: 'B', description: 'x', category: 'trabajo', completed: true, createdAt: '2024-01-03', updatedAt: '2024-01-04', dueDate: '2024-11-30' },
  { id: '3', title: 'C', description: 'buscar', category: 'personal', completed: false, createdAt: '2024-01-05', updatedAt: '2024-01-06', dueDate: '2024-10-31' },
]

describe('filterAndSortTasks', () => {
  it('filtra por estado pendientes', () => {
    const res = filterAndSortTasks(base, { filter: 'active' })
    expect(res.every(t => !t.completed)).toBe(true)
  })

  it('filtra por estado completadas', () => {
    const res = filterAndSortTasks(base, { filter: 'completed' })
    expect(res.every(t => t.completed)).toBe(true)
  })

  it('filtra por categoría', () => {
    const res = filterAndSortTasks(base, { categoryFilter: 'trabajo' })
    expect(res.length).toBe(1)
    expect(res[0].id).toBe('2')
  })

  it('filtra por búsqueda', () => {
    const res = filterAndSortTasks(base, { query: 'buscar' })
    expect(res.length).toBe(1)
    expect(res[0].id).toBe('3')
  })

  it('ordena por vencimiento ascendente', () => {
    const res = filterAndSortTasks(base, { sortBy: 'dueAsc' })
    expect(res.map(t => t.id)).toEqual(['3','2','1'])
  })
})


