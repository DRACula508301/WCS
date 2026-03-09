import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import SelectionWizard from './components/SelectionWizard.tsx'

function App() {
  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '25%', maxWidth: '320px', height: '50vh', display: 'flex', alignItems: 'center', paddingLeft: '20px' }}><SelectionWizard /></div>
      
    </div>
  )
}

export default App
