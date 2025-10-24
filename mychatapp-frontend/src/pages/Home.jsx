import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Chat App</h1>
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
    </div>
  );
}
