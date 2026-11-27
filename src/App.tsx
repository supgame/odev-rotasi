import { useEffect, useState } from 'react'
import { StudentApp } from './student/StudentApp'
import { TeacherApp } from './teacher/TeacherApp'
import { Gallery } from './avatar/Gallery'
import { World } from './ui/World'

// Tek sabit link: kök = öğrenci, #/ogretmen = öğretmen paneli.
export default function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const f = () => setHash(location.hash)
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  const teacher = hash.startsWith('#/ogretmen')
  return (
    <>
      <World calm={teacher} />
      {hash.startsWith('#/galeri') ? <Gallery /> : teacher ? <TeacherApp /> : <StudentApp key={hash} />}
    </>
  )
}
