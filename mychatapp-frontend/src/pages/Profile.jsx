import { useEffect, useState } from "react";
import API from "../axios/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/profile")
      .then(res => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, []);

  const logout = async () => {
    await API.post("/logout");
    navigate("/login");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>ID: {user.id}</p>
      <p>Username: {user.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
