import { useState, useEffect } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.deleteAdminUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  if (loading) return <div className="container mt-5">Loading admin panel...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title mb-4">Manage Users</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Title/Company</th>
                  <th>Registered</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-medium">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {u.title || "N/A"} {u.company && `at ${u.company}`}
                      </td>
                      <td className="small text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDelete(u._id)}
                          disabled={u._id === currentUser.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
