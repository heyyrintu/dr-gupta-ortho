import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Robotic from './pages/Robotic';
import About from './pages/About';
import Book from './pages/Book';
import NotFound from './pages/NotFound';

/** Route table shared by the browser entry (main.tsx) and the prerenderer (entry-server.tsx). */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="robotic-joint-replacement" element={<Robotic />} />
        <Route path="about" element={<About />} />
        <Route path="book" element={<Book />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
