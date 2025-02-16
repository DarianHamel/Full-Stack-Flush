// temp page for testing
import React from 'react';

const Profile = ({ username }) => {
  return (
    <div className="profile">
      <h2>User Profile</h2>
      {username ? (
        <>
          <p>Welcome back, <strong>{username}</strong>!</p>
        </>
      ) : (
        <p>Please log in to see your profile.</p>
      )}
    </div>
  );
};

export default Profile;
