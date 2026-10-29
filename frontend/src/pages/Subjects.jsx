const subjects = [
  { id: 1, name: 'Data Structures', semester: 'Semester 1', description: 'Arrays, linked lists, trees, graphs and complexity.' },
  { id: 2, name: 'Database Management', semester: 'Semester 2', description: 'SQL, normalization, transactions and indexing.' },
  { id: 3, name: 'Web Technologies', semester: 'Semester 2', description: 'HTML, CSS, JavaScript and modern frameworks.' },
  { id: 4, name: 'Java Programming', semester: 'Semester 3', description: 'OOP, collections, multithreading and Spring Boot.' },
]

function Subjects() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Subjects</h1>
        <p>Find subjects by semester and access related resources.</p>
      </div>

      <div className="grid">
        {subjects.map((s) => (
          <div className="card" key={s.id}>
            <span className="badge">{s.semester}</span>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Subjects