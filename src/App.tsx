import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Calendar } from './components/calendar'
import FormBuilder from './components/form-builder'
import { FormBuilder as FormBuilderEditor } from './components/form-builder/FormBuilder'
import { FormViewer } from './components/form-builder/FormViewer'
import { NavigationButton } from './components/NavigationButton'

const App = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/form-builder/new" element={<FormBuilderEditor />} />
            <Route path="/form-builder/edit/:id" element={<FormBuilderEditor />} />
            <Route path="/form-builder/view/:id" element={<FormViewer />} />
          </Routes>
        </div>
        <NavigationButton />
      </div>
    </Router>
  )
}

export default App