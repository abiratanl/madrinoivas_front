// src/pages/Users/UserPage.tsx
import { useUsers } from '../../hooks/useUsers'; // Import the new logic hook

export function Users() {
  // Extract logic and state from the custom hook
  const {
    users,
    loading,
    error,
    formData,
    setFormData,
    isEditing,
    handleEdit,
    handleDelete,
    handleSubmit,
    resetForm
  } = useUsers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">User Management</h1>

      {/* --- User Form Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 max-w-xl">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          {isEditing ? 'Edit User' : 'Register New User'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              required
              className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              disabled={isEditing} 
              className={`mt-1 w-full border border-gray-300 p-2 rounded ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select 
              className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              {/* Values must match Database ENUMs */}
              <option value="admin">Administrador</option>
              <option value="atendente">Atendente</option>
              <option value="cliente">Cliente</option>
              <option value="proprietario">Proprietário</option>
            </select>
          </div>

          {/* Active Status Checkbox */}
          {isEditing && (
            <div className="flex items-center">
              <input 
                id="active_check"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
              />
              <label htmlFor="active_check" className="ml-2 block text-sm text-gray-900">
                Active User
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create User'}
            </button>
            
            {isEditing && (
              <button 
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- Users List Table --- */}
      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Role</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'proprietario' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'atendente' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Ensure default export is present
export default Users;