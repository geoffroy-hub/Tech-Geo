'use client';

interface User {
  id: string; name?: string; email: string; role?: string; created_at: string;
}

export default function UsersPanel({ users }: { users: User[] }) {
  return (
    <div className="admin-panel active">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th></tr></thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '2rem' }}>Aucun utilisateur</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>{u.name || '—'}</td>
                <td>{u.email}</td>
                <td><span style={{ color: u.role === 'admin' ? '#ffa502' : 'var(--clr-text)' }}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
