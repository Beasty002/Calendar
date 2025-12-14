import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Calendar } from './components/calendar'
import ChecklistBuilder from './components/checklist-builder'
import { ChecklistBuilder as ChecklistBuilderEditor } from './components/checklist-builder/ChecklistBuilder'
import { ChecklistViewer } from './components/checklist-builder/ChecklistRender'
import { NavigationButton } from './components/NavigationButton'
import { Toaster } from 'sonner'

const App = () => {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/checklist-builder" element={<ChecklistBuilder />} />
            <Route path="/checklist-builder/new" element={<ChecklistBuilderEditor />} />
            <Route path="/checklist-builder/edit/:id" element={<ChecklistBuilderEditor />} />
            <Route path="/checklist-builder/view/:id" element={<ChecklistViewer />} />
          </Routes>
        </div>
        <NavigationButton />
      </div>
    </Router>
  )
}

export default App