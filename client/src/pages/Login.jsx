import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "./auth.css";
import { toast } from "react-toastify";

const Login = () => {

const navigate = useNavigate();

const [formData,setFormData] = useState({
email:"",
password:""
});

const [loading,setLoading] = useState(false);

const handleChange = (e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value
});
};

const handleSubmit = async(e)=>{
e.preventDefault();

try{

const res = await API.post("/auth/login",formData);

localStorage.setItem("token",res.data.token);
localStorage.setItem("user",JSON.stringify(res.data.user));

toast.success("Login Successful 🙏");

setLoading(true);

setTimeout(()=>{
navigate("/");
},2000);

}catch(err){
toast.error("Invalid email or password ❌");
}

};

if(loading){
return(
<div className="om-screen">
<div className="om-symbol">🕉</div>
<h2>Har Har Mahadev 🔱</h2>
</div>
);
}

return(
<div className="auth-wrapper">
<div className="flowers">
<span>🌸</span><span>🌸</span><span>🌸</span>
<span>🌸</span><span>🌸</span><span>🌸</span>
</div>

<div className="auth-card">

<img
className="auth-animation"
src="https://cdn-icons-png.flaticon.com/512/3097/3097130.png"
/>

<h2>Pranam 🙏</h2>
<p className="subtitle">Seva Track par aapka swagat hai</p>

<h3>Login</h3>

<form onSubmit={handleSubmit}>

<div className="form-group">
<label>Email</label>
<input type="email" name="email" value={formData.email} onChange={handleChange}/>
</div>

<div className="form-group">
<label>Password</label>
<input type="password" name="password" value={formData.password} onChange={handleChange}/>
</div>

<button className="auth-btn">Login</button>

</form>

<p className="switch-text">
Don’t have an account?
<Link to="/register"> Register</Link>
</p>

</div>
</div>
);
};

export default Login;