/* ================= LOGIN ================= */

function loginUser() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    const dummyUser = "admin";
    const dummyPass = "admin123";

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    if (username === dummyUser && password === dummyPass) {
        alert("Login successful");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid username or password");
    }
}

/* ================= STUDENTS ================= */

function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("rollNo").value.trim();
    const cls  = document.getElementById("studentClass").value.trim();

    if (!name || !roll || !cls) {
        alert("Please fill all fields");
        return;
    }

    const table = document.getElementById("studentTable");
    const tbody = table.querySelector("tbody");

    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${roll}</td>
        <td>${name}</td>
        <td>${cls}</td>
        <td>
            <button class="btn-edit" onclick="editStudent(this)">Edit</button>
            <button class="btn-delete" onclick="deleteStudent(this)">Delete</button>
        </td>
    `;

    updateClassDropdown(cls);
    saveStudentsToLocalStorage();

    document.getElementById("studentName").value = "";
    document.getElementById("rollNo").value = "";
    document.getElementById("studentClass").value = "";
}

function deleteStudent(btn) {
    if (confirm("Delete this student?")) {
        btn.closest("tr").remove();
        saveStudentsToLocalStorage();
    }
}

function editStudent(btn) {
    const row = btn.closest("tr");

    const currentName = row.cells[1].innerText;
    const currentClass = row.cells[2].innerText;

    const newName = prompt("Edit Student Name:", currentName);
    const newClass = prompt("Edit Class / Section:", currentClass);

    if (newName && newName.trim() !== "") {
        row.cells[1].innerText = newName;
    }

    if (newClass && newClass.trim() !== "") {
        row.cells[2].innerText = newClass;
        updateClassDropdown(newClass);
    }

    saveStudentsToLocalStorage();
}

/* ================= STUDENT FILTER ================= */

function filterStudents() {
    const selectedClass = document.getElementById("classFilter").value;
    const rows = document.querySelectorAll("#studentTable tbody tr");

    rows.forEach(row => {
        const studentClass = row.cells[2].innerText;
        row.style.display =
            selectedClass === "All Classes" || studentClass === selectedClass
                ? ""
                : "none";
    });
}

function updateClassDropdown(newClass) {
    const dropdown = document.getElementById("classFilter");
    if (!dropdown) return;

    const options = Array.from(dropdown.options).map(opt => opt.value);
    if (!options.includes(newClass)) {
        const option = document.createElement("option");
        option.value = newClass;
        option.textContent = newClass;
        dropdown.appendChild(option);
    }
}

/* ================= LOCAL STORAGE (STUDENTS) ================= */

function saveStudentsToLocalStorage() {
    const rows = document.querySelectorAll("#studentTable tbody tr");
    const students = [];

    rows.forEach(row => {
        students.push({
            roll: row.cells[0].innerText,
            name: row.cells[1].innerText,
            class: row.cells[2].innerText
        });
    });

    localStorage.setItem("students", JSON.stringify(students));
}

/* ================= ATTENDANCE ================= */

// Load students from localStorage
function loadStudentsForAttendance() {
    const cls = document.getElementById("attendanceClass").value;
    const tbody = document.getElementById("attendanceTableBody");

    tbody.innerHTML = "";

    const students = JSON.parse(localStorage.getItem("students")) || [];

    const filteredStudents = students.filter(
        s => cls === "All Classes" || s.class === cls
    );

    if (filteredStudents.length === 0) {
        alert("No students found for this class");
        return;
    }

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>
                <label>
                    <input type="radio" name="att_${student.roll}" value="Present" checked>
                    Present
                </label>
                <label style="margin-left:10px;">
                    <input type="radio" name="att_${student.roll}" value="Absent">
                    Absent
                </label>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save attendance to localStorage
function saveAttendance() {
    const date = document.getElementById("attendanceDate").value;
    const cls = document.getElementById("attendanceClass").value;

    if (!date) {
        alert("Please select a date");
        return;
    }

    const rows = document.querySelectorAll("#attendanceTableBody tr");
    const attendanceData = [];

    rows.forEach(row => {
        const roll = row.cells[0].innerText;
        const name = row.cells[1].innerText;
        const status = row.querySelector("input[type='radio']:checked").value;

        attendanceData.push({
            roll,
            name,
            class: cls,
            status
        });
    });

    const key = `attendance_${date}_${cls}`;
    localStorage.setItem(key, JSON.stringify(attendanceData));

    alert("Attendance saved successfully");
}
function populateAttendanceClasses() {
    const dropdown = document.getElementById("attendanceClass");
    if (!dropdown) return;

    dropdown.innerHTML = `<option>All Classes</option>`;

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const classes = [...new Set(students.map(s => s.class))];

    classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = cls;
        dropdown.appendChild(option);
    });
}


/* ================= REPORT ================= */

// Populate class dropdown (same logic as attendance)
function populateReportClasses() {
    const dropdown = document.getElementById("reportClass");
    if (!dropdown) return;

    dropdown.innerHTML = `<option>All Classes</option>`;

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const classes = [...new Set(students.map(s => s.class))];

    classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = cls;
        dropdown.appendChild(option);
    });
}

// Generate attendance report
function generateReport() {
    const selectedClass = document.getElementById("reportClass").value;
    const tbody = document.getElementById("reportTableBody");

    tbody.innerHTML = "";

    const reportData = {};
    
    // loop through localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key.startsWith("attendance_")) continue;

        const [, date, cls] = key.split("_");
        if (selectedClass !== "All Classes" && cls !== selectedClass) continue;

        const records = JSON.parse(localStorage.getItem(key));

        records.forEach(rec => {
            if (!reportData[rec.roll]) {
                reportData[rec.roll] = {
                    roll: rec.roll,
                    name: rec.name,
                    class: rec.class,
                    total: 0,
                    present: 0
                };
            }

            reportData[rec.roll].total++;
            if (rec.status === "Present") {
                reportData[rec.roll].present++;
            }
        });
    }

    const values = Object.values(reportData);

    if (values.length === 0) {
        alert("No attendance data found");
        return;
    }

    values.forEach(student => {
        const percentage = ((student.present / student.total) * 100).toFixed(2);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>${student.total}</td>
            <td>${student.present}</td>
            <td style="color:${percentage < 75 ? 'red' : 'green'}">
                ${percentage}%
            </td>
        `;
        tbody.appendChild(row);
    });
}

/* ================= LOGOUT ================= */

function logoutUser() {
    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {
        // OPTIONAL: clear session-related data only
        // localStorage.removeItem("loggedInUser");

        alert("Logged out successfully");
        window.location.href = "index.html";
    }
}
