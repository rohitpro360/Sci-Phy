import { useState, useEffect } from 'react'
import axios from 'axios'

const DEPT_API = 'http://localhost:8081/api/departments'
const RESOURCES_API = 'http://localhost:8081/api/resources'

function StudentView() {
  const [departments, setDepartments] = useState([])
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (selectedDeptId) {
      fetchResourcesForDepartment(selectedDeptId)
    }
  }, [selectedDeptId])

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPT_API)
      setDepartments(Array.isArray(res.data) ? res.data : [])
      if (res.data.length > 0) {
        setSelectedDeptId(res.data[0].id)
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const fetchResourcesForDepartment = async (deptId) => {
    try {
      setLoading(true)
      const res = await axios.get(RESOURCES_API)
      // Filter resources matching the selected department ID
      const filtered = res.data.filter(item => String(item.departmentId) === String(deptId))
      setResources(filtered)
    } catch (err) {
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ background: '#0f172a', color: '#fff', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🎓 Student Study Portal</h2>
        <p style={{ margin: 0, color: '#94a3b8' }}>Select your department to access study materials, notes, spreadsheets, and lecture videos.</p>
      </div>

      {/* Department Selector */}
      <div style={{ background: '#fff', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <label style={{ fontWeight: '600', color: '#334155', minWidth: '150px' }}>Select Department:</label>
        <select 
          value={selectedDeptId} 
          onChange={(e) => setSelectedDeptId(e.target.value)} 
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem' }}
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              Year {d.year} - {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Resources List */}
      <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>📚 Available Study Materials ({resources.length})</h3>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading resources...</p>
      ) : resources.length === 0 ? (
        <p style={{ color: '#64748b', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          No study materials uploaded for this department yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {resources.map((res) => {
            const isYoutube = res.fileUrl && (res.fileUrl.includes('youtube.com') || res.fileUrl.includes('youtu.be'))
            
            return (
              <div key={res.id} style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', background: isYoutube ? '#ffeeee' : '#eff6ff', color: isYoutube ? '#dc2626' : '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {isYoutube ? '📺 YouTube Lecture' : '📄 Study Notes / File'}
                  </span>
                  <h4 style={{ margin: '12px 0 10px 0', color: '#1e293b', fontSize: '1.15rem' }}>{res.title}</h4>
                </div>

                <div style={{ marginTop: '15px' }}>
                  {isYoutube ? (
                    <a 
                      href={res.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'block', textAlign: 'center', background: '#dc2626', color: '#fff', padding: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                    >
                      Watch Lecture  ▶
                    </a>
                  ) : (
                    <a 
                      href={`http://localhost:8081${res.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'block', textAlign: 'center', background: '#2563eb', color: '#fff', padding: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                    >
                      Download / View File 📥
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentView