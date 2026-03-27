import React, { useState } from "react";
import axios from "axios";

function AddSubject() {
  const [form, setForm] = useState({
    name: "",
    credits: "",
    grade: "",
    marks: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/subjects/add", form);

    alert("Subject Added Successfully!");
    window.location.reload();
    
  };

  return (
    <div>
      <h2>Add Subject</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Subject Name" onChange={handleChange} />
        <br /><br />

        <input name="credits" placeholder="Credits" onChange={handleChange} />
        <br /><br />

        <input name="grade" placeholder="Grade" onChange={handleChange} />
        <br /><br />

        <input name="marks" placeholder="Marks" onChange={handleChange} />
        <br /><br />

        <button type="submit">Add Subject</button>
      </form>
    </div>
  );
}

export default AddSubject;