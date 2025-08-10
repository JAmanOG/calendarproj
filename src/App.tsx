import Calendar from './components/calendar'
import './App.css'
import Layout from './components/layout'
import { TasksProvider } from './lib/useTasks'

function App() {

  return (
    <>
        <TasksProvider>
          <Layout>
            <Calendar/>
          </Layout>
        </TasksProvider>
    </>
  )
}

export default App
