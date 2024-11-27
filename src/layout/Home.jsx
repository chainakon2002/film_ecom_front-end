import axios from 'axios'
import {useState} from "react";
import useAuth from '../hooks/useAuth'
import './css/login.css'

export default function LoginForm() {
  const { setUser } = useAuth()
  const [input, setInput] = useState({
    username : '', 
    password : ''
  })

  const hdlChange = e => {
    setInput( prv => ( { ...prv, [e.target.name] : e.target.value } ) )
  }

  const hdlSubmit = async e => {
    try {
      e.preventDefault()
      // validation
      const rs = await axios.post('https://ecomapi2-production.up.railway.app/auth/login', input)
      console.log(rs.data.token)
      localStorage.setItem('token', rs.data.token)
      const rs1 = await axios.get('https://ecomapi2-production.up.railway.app/auth/me', {
        headers : { Authorization : `Bearer ${rs.data.token}` }
      })
      console.log(rs1.data)
      setUser(rs1.data)
      
    }catch(err) {
      console.log( err.message)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen mt-[-100px]">
      {/* รูปภาพทางซ้าย */}
      <div className="flex-none mr-40">
        <img src="/src/assets/loginform.png" className="max-w-[600px] h-auto" />
      </div>
  
      {/* แบบฟอร์มทางขวา */}
      <form className="flex flex-col justify-center items-center outline-none  border-20 w-[30rem] h-[30rem] rounded-[25px] shadow-md mt-20 ml-10 transition duration-500 ease-in-out transform" onSubmit={hdlSubmit}>
      <p className="font-semibold text-[40px] text-[#5473E3] text-center mt-1 mb-12">เข้าสู่ระบบ</p>


  
        <label className="form-control w-full max-w-xs">
          <input
            placeholder="Username"
            type="text"
            className="input input-bordered w-full max-w-xs border-[#bbc4cf] mt-5 block rounded-[18px]"
            name="username"
            value={input.username}
            onChange={hdlChange}
          />
        </label>
  
        <label className="form-control w-full max-w-xs">
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full max-w-xs border-[#bbc4cf] mt-5 block rounded-[18px]"
            name="password"
            value={input.password}
            onChange={hdlChange}
          />
        </label>
  
        <div className="flex gap-5 mt-8">
          <button type="submit" className="rounded-full bg-[#3D5FD9] text-[#F5F7FF] w-[15rem] p-3 hover:bg-[#2347C5]">
            Login
          </button>

        </div>
      </form>
    </div>
  );
  
  
  
}
