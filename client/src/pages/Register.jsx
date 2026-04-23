import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "./auth.css";

const Register = () => {

const navigate = useNavigate();

const [formData,setFormData] = useState({
name:"",
email:"",
password:"",
confirmPassword:""
});

const handleChange = (e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value
});
};

const handleSubmit = async(e)=>{
e.preventDefault();

// 🔥 frontend validation
if(!formData.name || !formData.email || !formData.password){
return alert("All fields are required");
}

if(formData.password !== formData.confirmPassword){
return alert("Passwords do not match");
}

try{

console.log(formData); // 🧪 debug

await API.post("/auth/register",{
name:formData.name,
email:formData.email,
password:formData.password
});

alert("🌸 Shubh Yatra! Registration successful");

navigate("/login");

}catch(err){
console.log(err.response?.data); // 🔥 actual error show
alert(err.response?.data?.message || "Registration failed");
}

};

return(

<div className="auth-wrapper">

<div className="auth-card">

<img
className="auth-animation"
src="https://cdn-icons-png.flaticon.com/512/2922/2922561.png"
/>

<h2>🌸 Shubh Yatra</h2>
<p className="subtitle">Apni pavitra yatra shuru kare</p>

<h3>Register</h3>

<form onSubmit={handleSubmit}>

<div className="form-group">
<label>Name</label>
<input
type="text"
name="name"
required
placeholder="Enter name"
value={formData.name}
onChange={handleChange}
/>
</div>

<div className="form-group">
<label>Email</label>
<input
type="email"
name="email"
required
placeholder="Enter email"
value={formData.email}
onChange={handleChange}
/>
</div>

<div className="form-group">
<label>Password</label>
<input
type="password"
name="password"
required
placeholder="Create password"
value={formData.password}
onChange={handleChange}
/>
</div>

<div className="form-group">
<label>Confirm Password</label>
<input
type="password"
name="confirmPassword"
required
placeholder="Confirm password"
value={formData.confirmPassword}
onChange={handleChange}
/>
</div>

<button className="auth-btn">Register</button>

</form>

<p className="switch-text">
Already have an account?
<Link to="/login"> Login</Link>
</p>

</div>

</div>

);

};

export default Register;