import { useEffect, useState } from 'react'
import { StudentApp } from './student/StudentApp'
import { TeacherApp } from './teacher/TeacherApp'
import { Gallery } from './avatar/Gallery'

// Tek sabit link: kök = öğrenci, #/ogretmen = öğretmen paneli.
export default function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const f = () => setHash(location.hash)
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  if (hash.startsWith('#/galeri')) return <Gallery />
  return hash.startsWith('#/ogretmen') ? <TeacherApp /> : <StudentApp key={hash} />
}
