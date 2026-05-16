export default function Loading() {
  return (
    <section className="section" style={{ paddingTop: '6rem', textAlign: 'center' }}>
      <div className="container">
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--clr-muted)' }}>Chargement...</p>
      </div>
    </section>
  );
}
