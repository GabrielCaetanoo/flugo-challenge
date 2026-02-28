// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/index';
import ColaboradoresList from './pages/ColaboradoresList';
import NovoColaborador from './pages/NovoColaborador';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ColaboradoresList />} />
          <Route path="/novo" element={<NovoColaborador />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}