import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Profile.css';

function Profile({ user }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.getProfile();
      setProfileData(response.data);
      setEditData({
        name: response.data.name,
        email: response.data.email
      });
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.email) {
      setError('Name and email are required');
      return;
    }
    setUpdating(true);
    try {
      alert('Profile update functionality would be implemented on the backend');
      setEditMode(false);
      setUpdating(false);
    } catch (error) {
      setError('Failed to update profile');
      setUpdating(false);
    }
  };

  const getActiveBorrows = () => {
    return profileData?.borrowedBooks?.filter(b => !b.isReturned) || [];
  };

  const getReturnedBorrows = () => {
    return profileData?.borrowedBooks?.filter(b => b.isReturned) || [];
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-top">
            <div className="profile-avatar">
              {profileData?.profilePicture ? (
                <img src={profileData.profilePicture} alt={profileData.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profileData?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-title">
              <h1>{profileData?.name}</h1>
              <p>{profileData?.email}</p>
              <span className={`role-badge role-${profileData?.role}`}>
                {profileData?.role}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="btn btn-primary">
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSaveProfile} 
                  className="btn btn-success"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setEditMode(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              My Books
            </button>
            <button
              className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
          </div>

          {editMode && (
            <div className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="form-input"
                  disabled
                />
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="overview-section">
                <h2>Account Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <p>{profileData?.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Email Address</label>
                    <p>{profileData?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Account Type</label>
                    <p className="capitalize">{profileData?.role}</p>
                  </div>
                  <div className="info-item">
                    <label>Account Status</label>
                    <p>
                      <span className={`status-badge ${profileData?.isActive ? 'active' : 'inactive'}`}>
                        {profileData?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{new Date(profileData?.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="quick-stats">
                <h2>Quick Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <div className="stat-number">{getActiveBorrows().length}</div>
                      <div className="stat-label">Currently Borrowed</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-number">{getReturnedBorrows().length}</div>
                      <div className="stat-label">Books Returned</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🖨️</div>
                    <div className="stat-content">
                      <div className="stat-number">{profileData?.totalPrintoutsCount || 0}</div>
                      <div className="stat-label">Printouts Completed</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <div className="stat-number">₹{profileData?.totalPrintoutSpent || 0}</div>
                      <div className="stat-label">Total Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="tab-content">
              <div className="books-section">
                <h2>Currently Borrowed Books</h2>
                {getActiveBorrows().length === 0 ? (
                  <div className="empty-state">
                    <p>No books currently borrowed</p>
                  </div>
                ) : (
                  <div className="book-list">
                    {getActiveBorrows().map((borrow) => (
                      <div key={borrow._id} className="book-record">
                        <div className="record-info">
                          <h4>Book ID: {borrow.bookId}</h4>
                          <div className="record-dates">
                            <span>
                              📅 Borrowed: {new Date(borrow.borrowDate).toLocaleDateString('en-IN')}
                            </span>
                            <span>
                              📌 Due: {new Date(borrow.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="record-status">
                          {isOverdue(borrow.dueDate) && (
                            <span className="overdue-badge">Overdue</span>
                          )}
                          <span className="active-badge">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h2 style={{ marginTop: '40px' }}>Returned Books</h2>
                {getReturnedBorrows().length === 0 ? (
                  <div className="empty-state">
                    <p>No returned books yet</p>
                  </div>
                ) : (
                  <div className="book-list">
                    {getReturnedBorrows().map((borrow) => (
                      <div key={borrow._id} className="book-record returned">
                        <div className="record-info">
                          <h4>Book ID: {borrow.bookId}</h4>
                          <div className="record-dates">
                            <span>
                              📅 Borrowed: {new Date(borrow.borrowDate).toLocaleDateString('en-IN')}
                            </span>
                            <span>
                              ✅ Returned: {new Date(borrow.returnDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="record-status">
                          <span className="returned-badge">Returned</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="tab-content">
              <div className="statistics-section">
                <h2>Borrowing Statistics</h2>
                <div className="stats-overview">
                  <div className="stat-box">
                    <div className="stat-title">Total Books Borrowed</div>
                    <div className="stat-value">
                      {profileData?.borrowedBooks?.length || 0}
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-title">Currently Active</div>
                    <div className="stat-value">{getActiveBorrows().length}</div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-title">Returned</div>
                    <div className="stat-value">{getReturnedBorrows().length}</div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-title">Return Rate</div>
                    <div className="stat-value">
                      {profileData?.borrowedBooks?.length > 0
                        ? Math.round(
                            (getReturnedBorrows().length / profileData.borrowedBooks.length) * 100
                          )
                        : 0}%
                    </div>
                  </div>
                </div>

                <h2 style={{ marginTop: '40px' }}>Printout Statistics</h2>
                <div className="stats-overview">
                  <div className="stat-box">
                    <div className="stat-title">Total Printouts</div>
                    <div className="stat-value">
                      {profileData?.totalPrintoutsCount || 0}
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-title">Total Amount Spent</div>
                    <div className="stat-value">
                      ₹{profileData?.totalPrintoutSpent || 0}
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-title">Average Cost per Printout</div>
                    <div className="stat-value">
                      {profileData?.totalPrintoutsCount > 0
                        ? '₹' +
                          (profileData.totalPrintoutSpent / profileData.totalPrintoutsCount).toFixed(
                            2
                          )
                        : '₹0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
