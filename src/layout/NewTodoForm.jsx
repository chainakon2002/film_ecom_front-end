import axios from "axios";
import {useState} from "react";

export default function NewTodoForm() {
  const [input, setInput] = useState({
    title : '',
    dueDate : new Date()
  })

  const hdlChange = e => {
    setInput( prv => ( {...prv, [e.target.name] : e.target.value} ))
  }

  const hdlSubmit = async e => {
    try{
      e.preventDefault()
      // setInput(prv => ({...prv, dueDate: new Date(prv.dueDate) }))
      const output = { ...input, dueDate: new Date(input.dueDate) }
      const token = localStorage.getItem('token')
      const rs = await axios.post('https://ecomapi2-production.up.railway.app/todos', output, {
        headers : { Authorization : `Bearer ${token}`}
      })
      alert('Create new OK')
    }catch(err) {
      alert(err.message)
    }
  }

  return (
    <form className="flex flex-col min-w-[600px] border rounded w-5/6 mx-auto p-4 gap-6"
        onSubmit={hdlSubmit}
    >
      <label className="form-control w-full ">
        <div className="label">
          <span className="label-text">Todo title</span>
        </div>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full "
          name="title"
          value={input.title}
          onChange={hdlChange}
        />
      </label>
      <label className="form-control w-full max-w-[220px] ">
        <div className="label">
          <span className="label-text">Due Date</span>
        </div>
        <input type="date" name="dueDate" value={input.value} onChange={hdlChange} />
      </label>
      <button className="btn btn-primary">Add new</button>
    </form>
  );
}
