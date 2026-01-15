import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';



function App() {

  return (
    <div className="h-screen bg-slate-950">
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>}></Route>
      <Route path='/game' element={<Game/>}></Route>
    </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
