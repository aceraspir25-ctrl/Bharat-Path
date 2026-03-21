import { AuthProvider } from './AuthContext'
import MainApp from './components/MainApp'

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}