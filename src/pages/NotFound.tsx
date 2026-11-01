import Seo from '../components/Seo';
import { Button } from '../components/ui';
import { pages } from '../content/site';

export default function NotFound() {
  const n = pages.notFound;
  return (
    <section className="notfound">
      <Seo path="/404" title="Page not found | Dr. Siddharth Gupta" description="This page could not be found." />
      <div className="container notfound__inner in">
        <span className="kicker">{n.eyebrow}</span>
        <h1 className="display-1">{n.title}</h1>
        <p className="lead">{n.body}</p>
        <div className="row-gap">
          <Button to="/">Home</Button>
          <Button to="/book" variant="ghost">Book an appointment</Button>
        </div>
      </div>
    </section>
  );
}
