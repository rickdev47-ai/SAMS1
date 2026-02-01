const API = "https://sams1-backend.onrender.com";

/* ================= PAGE LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("studentTable")) loadStudents();
    if (document.getElementById("attendanceClass")) populateAttendanceClasses();
    if (document.getElementById("reportClass")) populateReportClasses();
});

/* ================= LOGIN ================= */

function loginUser() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) window.location.href = "dashboard.html";
        else alert("Invalid username or password");
    })
    .catch(() => alert("Server not responding"));
}

/* ================= STUDENTS ================= */

function loadStudents() {
    fetch(`${API}/students`)
        .then(res => res.json())
        .then(renderStudents)
        .catch(() => alert("Failed to load students"));
}

function addStudent() {
    const roll = rollNo.value.trim();
    const name = studentName.value.trim();
    const cls  = studentClass.value.trim();

    if (!roll || !name || !cls) return alert("Fill all fields");

    fetch(`${API}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll, name, className: cls })
    })
    .then(res => res.json())
    .then(d => {
        if (!d.success) return alert(d.message || "Error");
        loadStudents();
        rollNo.value = studentName.value = studentClass.value = "";
    });
}

function deleteStudent(roll) {
    if (!confirm("Delete student?")) return;
    fetch(`${API}/students/${roll}`, { method: "DELETE" })
        .then(loadStudents);
}

function editStudent(roll, oldName, oldClass) {
    const name = prompt("Edit name:", oldName);
    if (!name) return;
    const cls = prompt("Edit class:", oldClass);
    if (!cls) return;

    fetch(`${API}/students/${roll}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, className: cls })
    }).then(loadStudents);
}

function renderStudents(students) {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    students.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.roll}</td>
                <td>${s.name}</td>
                <td>${s.class}</td>
                <td>
                    <button onclick="editStudent('${s.roll}','${s.name}','${s.class}')">Edit</button>
                    <button onclick="deleteStudent('${s.roll}')">Delete</button>
                </td>
            </tr>
        `;
    });

    populateClassDropdown(students);
}

/* ================= FILTER ================= */

function populateClassDropdown(students) {
    const d = document.getElementById("classFilter");
    if (!d) return;
    d.innerHTML = `<option>All Classes</option>`;
    [...new Set(students.map(s => s.class))].forEach(c => d.innerHTML += `<option>${c}</option>`);
}

function filterStudents() {
    const val = classFilter.value;
    document.querySelectorAll("#studentTable tbody tr").forEach(r => {
        r.style.display = val === "All Classes" || r.cells[2].innerText === val ? "" : "none";
    });
}

/* ================= ATTENDANCE ================= */

function populateAttendanceClasses() {
    fetch(`${API}/students`)
        .then(r => r.json())
        .then(students => {
            attendanceClass.innerHTML = `<option value="">Select Class</option>`;
            [...new Set(students.map(s => s.class))].forEach(c =>
                attendanceClass.innerHTML += `<option>${c}</option>`
            );
        });
}

function loadStudentsForAttendance() {
    const cls = attendanceClass.value;
    attendanceTableBody.innerHTML = "";
    if (!cls) return;

    fetch(`${API}/students`)
        .then(r => r.json())
        .then(students => {
            students.filter(s => s.class === cls).forEach(s => {
                attendanceTableBody.innerHTML += `
                    <tr>
                        <td>${s.roll}</td>
                        <td>${s.name}</td>
                        <td>
                            <input type="radio" name="att_${s.roll}" value="Present" checked> Present
                            <input type="radio" name="att_${s.roll}" value="Absent"> Absent
                        </td>
                    </tr>`;
            });
        });
}

function saveAttendance() {
    const date = attendanceDate.value;
    const cls = attendanceClass.value;
    if (!date || !cls) return alert("Select date & class");

    const records = [];
    document.querySelectorAll("#attendanceTableBody tr").forEach(r => {
        records.push({
            roll: r.cells[0].innerText,
            status: r.querySelector("input:checked").value
        });
    });

    fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, className: cls, records })
    })
    .then(r => r.json())
    .then(d => alert(d.success ? "Attendance saved" : "Error"));
}

/* ================= REPORT ================= */

function populateReportClasses() {
    fetch(`${API}/students`)
        .then(r => r.json())
        .then(students => {
            reportClass.innerHTML = `<option>All Classes</option>`;
            [...new Set(students.map(s => s.class))].forEach(c =>
                reportClass.innerHTML += `<option>${c}</option>`
            );
        });
}

function generateReport() {
    const cls = reportClass.value;
    reportTableBody.innerHTML = "";

    fetch(`${API}/report?className=${encodeURIComponent(cls)}`)
        .then(r => r.json())
        .then(data => {
            if (!data.length) return alert("No data");
            data.forEach(r => {
                reportTableBody.innerHTML += `
                    <tr>
                        <td>${r.roll}</td>
                        <td>${r.name || ""}</td>
                        <td>${r.total}</td>
                        <td>${r.present}</td>
                        <td>${r.percentage}%</td>
                    </tr>`;
            });
        });
}

/* ================= LOGOUT ================= */

function logoutUser() {
    if (confirm("Logout?")) location.href = "index.html";
}
