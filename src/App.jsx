import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SuggesterEnhancer from './pages/SuggesterEnhancer';
import Drafts from './pages/Drafts';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <h1>The Last Mile</h1>
        <nav>
          <NavLink to="/">Suggester / Enhancer</NavLink>
          <NavLink to="/drafts">Drafts</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<SuggesterEnhancer />} />
          <Route path="/drafts" element={<Drafts />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
