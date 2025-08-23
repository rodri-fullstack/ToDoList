export function filterAndSortTasks(tasks, options) {
  const {
    filter = 'all',
    categoryFilter = 'all',
    query = '',
    sortBy = 'updatedDesc',
  } = options || {}

  const normalizedQuery = (query || '').trim().toLowerCase()
  let data = Array.isArray(tasks) ? [...tasks] : []

  // Nota: Se eliminan vencimientos y ventanas de fecha. Se mantiene solo dueDate para ordenación.

  // Filtros por estado
  if (filter === 'active') data = data.filter(t => !t.completed)
  if (filter === 'completed') data = data.filter(t => t.completed)
  // (Se removieron 'dueSoon', 'overdue' y 'dueWindow')

  if (categoryFilter !== 'all') {
    data = data.filter(t => t.category === categoryFilter)
  }

  if (normalizedQuery) {
    data = data.filter(t =>
      (t.title || '').toLowerCase().includes(normalizedQuery) || (t.description || '').toLowerCase().includes(normalizedQuery)
    )
  }

  data.sort((a, b) => {
    if (sortBy === 'updatedDesc') return (b.updatedAt || '').localeCompare(a.updatedAt || '')
    if (sortBy === 'createdDesc') return (b.createdAt || '').localeCompare(a.createdAt || '')
    if (sortBy === 'dueAsc') {
      const ad = a.dueDate ?? '9999-12-31'
      const bd = b.dueDate ?? '9999-12-31'
      return ad.localeCompare(bd)
    }
    if (sortBy === 'dueDesc') {
      const ad = a.dueDate ?? '0000-01-01'
      const bd = b.dueDate ?? '0000-01-01'
      return bd.localeCompare(ad)
    }
    if (sortBy === 'status') {
      return Number(a.completed) - Number(b.completed)
    }
    return 0
  })

  return data
}


