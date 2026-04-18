import { useEffect, useState } from "react";
import API from "../api/api";

function StudentRecord() {
  const [form, setForm] = useState({
    studentName: "",
    htNo: "",
    regNo: "",
    branch: "",
    yearOfAdmission: "",
    dateOfBirth: "",
    intermediateMarks: "",
    eamcetEcetRank: "",
    address: "",
    phoneR: "",
    parentGuardianName: "",
    designationProfession: "",
    organizationName: "",
    parentEmail: "",
    parentMobile: "",
    studentEmail: "",
    bloodGroup: "",
    medicalProblems: "",
    importantMedicines: "",
    languageRead: "",
    languageWrite: "",
    languageSpeak: "",
    professionalSocieties: "",
    btechMarksAndPassingYear: "",
    placement: "",
    higherStudies: "",
    studentSignature: "",
    counselor1stYear: "",
    counselor2ndYear: "",
    counselor3rdYear: "",
    counselor4thYear: "",
    section: "",
    department: ""
  });

  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    const currentEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase();

    if (!currentEmail) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get(`/students/profile/${currentEmail}`);

      if (res.data.success && res.data.data) {
        const student = res.data.data;

        setForm({
          studentName: student.student_name || student.name || "",
          htNo: student.ht_no || student.roll_no || "",
          regNo: student.reg_no || "",
          branch: student.branch || "",
          yearOfAdmission: student.year_of_admission || "",
          dateOfBirth: student.date_of_birth || "",
          intermediateMarks: student.intermediate_marks || "",
          eamcetEcetRank: student.eamcet_ecet_rank || "",
          address: student.address || "",
          phoneR: student.phone_r || "",
          parentGuardianName: student.parent_guardian_name || "",
          designationProfession: student.designation_profession || "",
          organizationName: student.organization_name || "",
          parentEmail: student.parent_email || "",
          parentMobile: student.parent_mobile || "",
          studentEmail: student.student_email || student.email || currentEmail,
          bloodGroup: student.blood_group || "",
          medicalProblems: student.medical_problems || "",
          importantMedicines: student.important_medicines || "",
          languageRead: student.language_read || "",
          languageWrite: student.language_write || "",
          languageSpeak: student.language_speak || "",
          professionalSocieties: student.professional_societies || "",
          btechMarksAndPassingYear: student.btech_marks_and_passing_year || "",
          placement: student.placement || "",
          higherStudies: student.higher_studies || "",
          studentSignature: student.student_signature || "",
          counselor1stYear: student.counselor_1st_year || "",
          counselor2ndYear: student.counselor_2nd_year || "",
          counselor3rdYear: student.counselor_3rd_year || "",
          counselor4thYear: student.counselor_4th_year || "",
          section: student.section || "",
          department: student.department || ""
        });
      } else {
        setForm((prev) => ({
          ...prev,
          studentEmail: currentEmail
        }));
      }
    } catch (error) {
      console.log("Fetch student profile failed:", error);
      setSaveMessage("Failed to load student profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const currentEmail = (localStorage.getItem("userEmail") || form.studentEmail || "")
      .trim()
      .toLowerCase();

    if (!currentEmail) {
      setSaveMessage("Student email not found. Please login again ❌");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    try {
      const res = await API.put(`/students/profile/${currentEmail}`, {
        ...form,
        studentEmail: form.studentEmail || currentEmail,
        regNo: form.regNo || form.htNo,
        htNo: form.htNo || form.regNo
      });

      if (res.data.success) {
        setSaveMessage(res.data.message || "Student details updated successfully ✅");
        await fetchStudentProfile();
      } else {
        setSaveMessage("Failed to update student details ❌");
      }
    } catch (error) {
      console.log("Update student profile failed:", error);

      if (error.response?.data?.message) {
        setSaveMessage(error.response.data.message);
      } else {
        setSaveMessage("Server error while updating student profile ❌");
      }
    }

    setTimeout(() => setSaveMessage(""), 3000);
  };

  if (loading) {
    return <div style={container}>Loading student record...</div>;
  }

  return (
    <div style={container}>
      <h2 style={title}>📋 Student Record</h2>
      <p style={subtitle}>Enter all details from the counseling book</p>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Student Information</h3>
        <div style={grid}>
          <input
            name="studentName"
            placeholder="Name of the Student"
            value={form.studentName}
            onChange={handleChange}
            style={input}
          />
          <input
            name="htNo"
            placeholder="HT No"
            value={form.htNo}
            onChange={handleChange}
            style={input}
          />
          <input
            name="regNo"
            placeholder="Registration Number"
            value={form.regNo}
            onChange={handleChange}
            style={input}
          />
          <input
            name="branch"
            placeholder="Branch"
            value={form.branch}
            onChange={handleChange}
            style={input}
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            style={input}
          />
          <input
            name="section"
            placeholder="Section"
            value={form.section}
            onChange={handleChange}
            style={input}
          />
          <input
            name="yearOfAdmission"
            placeholder="Year of Admission"
            value={form.yearOfAdmission}
            onChange={handleChange}
            style={input}
          />
          <input
            name="dateOfBirth"
            placeholder="Date of Birth"
            value={form.dateOfBirth}
            onChange={handleChange}
            style={input}
          />
          <input
            name="intermediateMarks"
            placeholder="% of Marks in Intermediate"
            value={form.intermediateMarks}
            onChange={handleChange}
            style={input}
          />
          <input
            name="eamcetEcetRank"
            placeholder="Rank in EAMCET / ECET"
            value={form.eamcetEcetRank}
            onChange={handleChange}
            style={input}
          />
        </div>

        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          style={textarea}
        />
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Parent / Guardian Details</h3>
        <div style={grid}>
          <input
            name="phoneR"
            placeholder="Phone (R)"
            value={form.phoneR}
            onChange={handleChange}
            style={input}
          />
          <input
            name="parentGuardianName"
            placeholder="Name of Parent / Guardian"
            value={form.parentGuardianName}
            onChange={handleChange}
            style={input}
          />
          <input
            name="designationProfession"
            placeholder="Designation / Profession"
            value={form.designationProfession}
            onChange={handleChange}
            style={input}
          />
          <input
            name="organizationName"
            placeholder="Name of the Organization"
            value={form.organizationName}
            onChange={handleChange}
            style={input}
          />
          <input
            name="parentEmail"
            placeholder="E-mail of Parent"
            value={form.parentEmail}
            onChange={handleChange}
            style={input}
          />
          <input
            name="parentMobile"
            placeholder="Mobile No. of Parent"
            value={form.parentMobile}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Student Contact & Medical Details</h3>
        <div style={grid}>
          <input
            name="studentEmail"
            placeholder="E-Mail of the Student"
            value={form.studentEmail}
            onChange={handleChange}
            style={input}
          />
          <input
            name="bloodGroup"
            placeholder="Blood Group"
            value={form.bloodGroup}
            onChange={handleChange}
            style={input}
          />
          <input
            name="medicalProblems"
            placeholder="Any Medical Problems"
            value={form.medicalProblems}
            onChange={handleChange}
            style={input}
          />
          <input
            name="importantMedicines"
            placeholder="Important Medicines"
            value={form.importantMedicines}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Languages Known</h3>
        <div style={grid}>
          <input
            name="languageRead"
            placeholder="Read"
            value={form.languageRead}
            onChange={handleChange}
            style={input}
          />
          <input
            name="languageWrite"
            placeholder="Write"
            value={form.languageWrite}
            onChange={handleChange}
            style={input}
          />
          <input
            name="languageSpeak"
            placeholder="Speak"
            value={form.languageSpeak}
            onChange={handleChange}
            style={input}
          />
          <input
            name="professionalSocieties"
            placeholder="Membership details in Professional Societies"
            value={form.professionalSocieties}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Career / Outcome Details</h3>
        <div style={grid}>
          <input
            name="btechMarksAndPassingYear"
            placeholder="Percentage of Marks at end of B.Tech and Year of Passing"
            value={form.btechMarksAndPassingYear}
            onChange={handleChange}
            style={input}
          />
          <input
            name="placement"
            placeholder="Placement"
            value={form.placement}
            onChange={handleChange}
            style={input}
          />
          <input
            name="higherStudies"
            placeholder="Higher Studies"
            value={form.higherStudies}
            onChange={handleChange}
            style={input}
          />
          <input
            name="studentSignature"
            placeholder="Student Signature"
            value={form.studentSignature}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}>Counselor</h3>
        <div style={grid}>
          <input
            name="counselor1stYear"
            placeholder="1st Year Counselor"
            value={form.counselor1stYear}
            onChange={handleChange}
            style={input}
          />
          <input
            name="counselor2ndYear"
            placeholder="2nd Year Counselor"
            value={form.counselor2ndYear}
            onChange={handleChange}
            style={input}
          />
          <input
            name="counselor3rdYear"
            placeholder="3rd Year Counselor"
            value={form.counselor3rdYear}
            onChange={handleChange}
            style={input}
          />
          <input
            name="counselor4thYear"
            placeholder="4th Year Counselor"
            value={form.counselor4thYear}
            onChange={handleChange}
            style={input}
          />
        </div>
      </div>

      <div style={buttonRow}>
        <button onClick={handleSubmit} style={button}>
          Save Student Details
        </button>
        {saveMessage && <span style={successText}>{saveMessage}</span>}
      </div>
    </div>
  );
}

export default StudentRecord;

const container = {
  padding: "20px",
  color: "#e2e8f0"
};

const title = {
  fontSize: "28px",
  marginBottom: "8px",
  color: "#38bdf8"
};

const subtitle = {
  color: "#94a3b8",
  marginBottom: "20px"
};

const sectionBox = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
};

const sectionTitle = {
  color: "#38bdf8",
  marginBottom: "15px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "15px"
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  outline: "none"
};

const textarea = {
  width: "100%",
  minHeight: "110px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#e2e8f0",
  outline: "none",
  marginTop: "15px",
  resize: "vertical"
};

const buttonRow = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginTop: "10px",
  flexWrap: "wrap"
};

const button = {
  padding: "12px 20px",
  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const successText = {
  color: "#22c55e",
  fontWeight: "600"
};