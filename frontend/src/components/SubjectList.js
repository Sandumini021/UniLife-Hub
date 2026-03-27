import React, { useEffect, useState } from "react";
import axios from "axios";

function SubjectList() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await axios.get("http://localhost:5000/subjects");
    setSubjects(res.data);
  };

  return (
    <div>
      <h2>Subject List</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Credits</th>
            <th>Grade</th>
            <th>Marks</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((sub) => (
            <tr key={sub._id}>
              <td>{sub.name}</td>
              <td>{sub.credits}</td>
              <td>{sub.grade}</td>
              <td>{sub.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectList;