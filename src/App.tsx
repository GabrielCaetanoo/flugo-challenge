// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/index';
import ColaboradoresList from './pages/ColaboradoresList';
import NovoColaborador from './pages/NovoColaborador'; // <-- Importamos a tela nova aqui!

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ColaboradoresList />} />
          {/* Abaixo, trocamos o <h2> pelo componente real */}
          <Route path="/novo" element={<NovoColaborador />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}