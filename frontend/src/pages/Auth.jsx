import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { signUp, verify, signIn, status, setStatus } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [verifyCode, setVerifyCode] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const ok = await signIn(loginForm);

      // ✅ if approved + logged in, go to dashboard
      if (ok) navigate("/details");
    } catch (err) {
      setStatus(err.message || "Login failed");
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    try {
      if (signupForm.password !== signupForm.confirmPassword) {
        setStatus("Passwords do not match");
        return;
      }
      await signUp(signupForm);
      setPendingEmail(signupForm.email);
      setTab("verify");
      setStatus("Signup successful! Check email for code.");
    } catch (err) {
      setStatus(err.message || "Signup failed");
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    try {
      await verify({ email: pendingEmail, code: verifyCode });
      setTab("login");
      setStatus("Account verified! You can now log in.");
    } catch (err) {
      setStatus(err.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#1d186d] text-white flex flex-col items-center">
      {/* header */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        <a href="https://me-dmz.com" target="_blank" rel="noreferrer">
          <div className="text-xl font-bold tracking-wide">ME-DMZ</div>
        </a>
        <div className="text-sm opacity-80">AI Tools Dashboard</div>
      </div>

      {/* card */}
      <div className="w-full max-w-md bg-white text-[#1d186d] p-8 rounded-xl shadow-xl mt-10">
        <div className="flex gap-3 mb-6">
          <button
            className={`flex-1 py-2 rounded-md font-semibold ${tab==="login"?"bg-[#1d186d] text-white":"bg-gray-100"}`}
            onClick={()=>{setTab("login"); setStatus("");}}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-md font-semibold ${tab==="signup"?"bg-[#1d186d] text-white":"bg-gray-100"}`}
            onClick={()=>{setTab("signup"); setStatus("");}}
          >
            Create Account
          </button>
        </div>

        {tab === "login" && (
          <form onSubmit={onLogin} className="space-y-3">
            <h2 className="text-xl font-bold text-center mb-2">Sign In</h2>
            <input
              className="w-full border rounded-md px-3 py-2"
              type="email"
              placeholder="Email"
              required
              value={loginForm.email}
              onChange={(e)=>setLoginForm(f=>({...f,email:e.target.value}))}
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="password"
              placeholder="Password"
              required
              value={loginForm.password}
              onChange={(e)=>setLoginForm(f=>({...f,password:e.target.value}))}
            />
            <button className="w-full bg-[#1d186d] text-white py-2 rounded-md font-semibold">
              Sign In
            </button>
          </form>
        )}

        {tab === "signup" && (
          <form onSubmit={onSignup} className="space-y-3">
            <h2 className="text-xl font-bold text-center mb-2">Create Account</h2>
            <input
              className="w-full border rounded-md px-3 py-2"
              type="text"
              placeholder="Full Name"
              required
              value={signupForm.fullName}
              onChange={(e)=>setSignupForm(f=>({...f,fullName:e.target.value}))}
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="email"
              placeholder="Email"
              required
              value={signupForm.email}
              onChange={(e)=>setSignupForm(f=>({...f,email:e.target.value}))}
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="password"
              placeholder="Password"
              required
              value={signupForm.password}
              onChange={(e)=>setSignupForm(f=>({...f,password:e.target.value}))}
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="password"
              placeholder="Confirm Password"
              required
              value={signupForm.confirmPassword}
              onChange={(e)=>setSignupForm(f=>({...f,confirmPassword:e.target.value}))}
            />
            <button className="w-full bg-[#1d186d] text-white py-2 rounded-md font-semibold">
              Sign Up
            </button>
          </form>
        )}

        {tab === "verify" && (
          <form onSubmit={onVerify} className="space-y-3">
            <h2 className="text-xl font-bold text-center mb-2">Verify Email</h2>
            <p className="text-sm text-center opacity-80">
              Enter the code sent to {pendingEmail}
            </p>
            <input
              className="w-full border rounded-md px-3 py-2"
              type="text"
              placeholder="Verification Code"
              required
              value={verifyCode}
              onChange={(e)=>setVerifyCode(e.target.value)}
            />
            <button className="w-full bg-[#1d186d] text-white py-2 rounded-md font-semibold">
              Verify
            </button>
          </form>
        )}

        {status && (
          <div className="mt-4 text-center text-sm text-red-600 font-semibold">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
