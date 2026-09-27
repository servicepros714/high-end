import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="h2">This page took a wrong turn.</h1>
        <Link to="/" className="btn btn-graphite">Back to home</Link>
      </div>
    </section>
  )
}
