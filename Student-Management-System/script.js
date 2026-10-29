"use strict";

// ==========================================
// Student Management System
// Auspify Technologies - Task 1
// ==========================================

const STORAGE_KEY = "auspify_student_management_v1";

// DOM elements
const studentForm = document.getElementById("studentForm");
const studentModal = document.getElementById("studentModal");
const studentTableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");

const modalTitle = document.getElementById("modalTitle");
const saveButton = document.getElementById("saveButton");
const editStudentId = document.getElementById("editStudentId");

const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentPhone = document.getElementById("studentPhone");
const studentGender = document.getElementById("studentGender");
const studentDepartment = document.getElementById("studentDepartment");
const studentYear = document.getElementById("studentYear");

const toast = document.getElementById("toast");

let students = loadStudents();
let toastTimer;

// ==========================================
// Load students from localStorage
// ==========================================

function loadStudents() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.filter((student) => {
            return (
                student &&
                typeof student.id === "string" &&
                typeof student.name === "string" &&
                typeof student.email === "string" &&
                typeof student.phone === "string" &&
                typeof student.gender === "string" &&
                typeof student.department === "string" &&
                typeof student.year === "string"
            );
        });
    } catch (error) {
        console.error("Unable to load student records:", error);

        alert(
            "Student records could not be loaded. " +
            "Please check your browser storage."
        );

        return [];
    }
}

// ==========================================
// Save students to localStorage
// ==========================================

function saveStudents() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(students)
        );

        return true;
    } catch (error) {
        console.error("Unable to save student records:", error);

        showToast(
            "Unable to save data. Check browser storage.",
            "error"
        );

        return false;
    }
}

// ==========================================
// Generate a unique student ID
// ==========================================

function generateStudentId() {
    let id;

    do {
        id =
            "STU" +
            Date.now().toString(36).toUpperCase() +
            Math.random().toString(36).slice(2, 6).toUpperCase();
    } while (students.some((student) => student.id === id));

    return id;
}

// ==========================================
// Toast notification
// ==========================================

function showToast(message, type = "success") {
    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.style.background =
        type === "error" ? "#b42335" : "#22253a";

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ==========================================
// Open the add student form
// ==========================================

function openAddModal() {
    studentForm.reset();

    editStudentId.value = "";

    modalTitle.textContent = "Add New Student";
    saveButton.textContent = "Save Student";

    studentModal.classList.add("show");

    studentName.focus();
}

// ==========================================
// Close the modal
// ==========================================

function closeModal() {
    studentModal.classList.remove("show");
    studentForm.reset();
    editStudentId.value = "";
}

// ==========================================
// Add and update student
// ==========================================

studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!studentForm.reportValidity()) {
        return;
    }

    const name = studentName.value.trim().replace(/\s+/g, " ");
    const email = studentEmail.value.trim().toLowerCase();
    const phone = studentPhone.value.trim();
    const gender = studentGender.value;
    const department = studentDepartment.value;
    const year = studentYear.value;

    // Additional validation
    if (name.length < 2) {
        showToast("Please enter a valid student name.", "error");
        studentName.focus();
        return;
    }

    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) {
        showToast(
            "Name must contain valid English letters.",
            "error"
        );

        studentName.focus();
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.", "error");
        studentEmail.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        showToast(
            "Enter a valid 10-digit Indian mobile number.",
            "error"
        );

        studentPhone.focus();
        return;
    }

    // Prevent duplicate email addresses
    const duplicateEmail = students.some((student) => {
        return (
            student.email.toLowerCase() === email &&
            student.id !== editStudentId.value
        );
    });

    if (duplicateEmail) {
        showToast(
            "A student with this email already exists.",
            "error"
        );

        studentEmail.focus();
        return;
    }

    if (!gender || !department || !year) {
        showToast("Please complete all required fields.", "error");
        return;
    }

    // Update existing student
    if (editStudentId.value) {
        const index = students.findIndex(
            (student) => student.id === editStudentId.value
        );

        if (index === -1) {
            showToast("Student record was not found.", "error");
            closeModal();
            return;
        }

        const updatedStudent = {
            ...students[index],
            name,
            email,
            phone,
            gender,
            department,
            year
        };

        const oldStudent = students[index];

        students[index] = updatedStudent;

        if (!saveStudents()) {
            students[index] = oldStudent;
            return;
        }

        closeModal();
        renderStudents();

        showToast("Student details updated successfully!");

        return;
    }

    // Create a new student
    const newStudent = {
        id: generateStudentId(),
        name,
        email,
        phone,
        gender,
        department,
        year,
        createdAt: new Date().toISOString()
    };

    students.unshift(newStudent);

    if (!saveStudents()) {
        students.shift();
        return;
    }

    closeModal();
    renderStudents();

    showToast("Student added successfully!");
});

// ==========================================
// Edit student
// ==========================================

function editStudent(id) {
    const student = students.find(
        (item) => item.id === id
    );

    if (!student) {
        showToast("Student record was not found.", "error");
        return;
    }

    editStudentId.value = student.id;

    studentName.value = student.name;
    studentEmail.value = student.email;
    studentPhone.value = student.phone;
    studentGender.value = student.gender;
    studentDepartment.value = student.department;
    studentYear.value = student.year;

    modalTitle.textContent = "Update Student";
    saveButton.textContent = "Update Student";

    studentModal.classList.add("show");

    studentName.focus();
}

// ==========================================
// Delete student
// ==========================================

function deleteStudent(id) {
    const student = students.find(
        (item) => item.id === id
    );

    if (!student) {
        showToast("Student record was not found.", "error");
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete ${student.name}'s record?`
    );

    if (!confirmed) {
        return;
    }

    const previousStudents = students;

    students = students.filter(
        (item) => item.id !== id
    );

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    renderStudents();

    showToast("Student deleted successfully!");
}

// ==========================================
// Safe HTML escaping
// ==========================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// ==========================================
// Display student records
// ==========================================

function renderStudents() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedDepartment = departmentFilter.value;

    const filteredStudents = students.filter((student) => {
        const matchesSearch = [
            student.id,
            student.name,
            student.email,
            student.phone
        ].some((value) => {
            return String(value)
                .toLowerCase()
                .includes(searchTerm);
        });

        const matchesDepartment =
            !selectedDepartment ||
            student.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    studentTableBody.innerHTML = "";

    filteredStudents.forEach((student) => {
        const row = document.createElement("tr");

        const initials = student.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");

        row.innerHTML = `
            <td>
                <div class="student-profile">
                    <div class="student-avatar">
                        ${escapeHTML(initials)}
                    </div>

                    <div>
                        <div class="student-name">
                            ${escapeHTML(student.name)}
                        </div>

                        <div class="student-id">
                            ${escapeHTML(student.id)}
                        </div>
                    </div>
                </div>
            </td>

            <td>${escapeHTML(student.email)}</td>

            <td>
                <span class="department-badge">
                    ${escapeHTML(student.department)}
                </span>
            </td>

            <td>
                <span class="gender-badge">
                    ${escapeHTML(student.gender)}
                </span>
            </td>

            <td>${escapeHTML(student.year)}</td>

            <td>
                <div class="action-buttons">
                    <button
                        type="button"
                        class="action-button edit-button"
                        data-action="edit"
                        data-id="${escapeHTML(student.id)}"
                        aria-label="Edit ${escapeHTML(student.name)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="action-button delete-button"
                        data-action="delete"
                        data-id="${escapeHTML(student.id)}"
                        aria-label="Delete ${escapeHTML(student.name)}"
                    >
                        Delete
                    </button>
                </div>
            </td>
        `;

        studentTableBody.appendChild(row);
    });

    // Show or hide empty state
    emptyState.hidden = filteredStudents.length > 0;

    // Show the correct record count
    document.getElementById("recordCount").textContent =
        `${filteredStudents.length} ${
            filteredStudents.length === 1 ? "Record" : "Records"
        }`;

    // Update dashboard statistics
    updateDashboard();
}

// ==========================================
// Table action handling
// ==========================================

studentTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === "edit") {
        editStudent(id);
    }

    if (action === "delete") {
        deleteStudent(id);
    }
});

// ==========================================
// Dashboard statistics
// ==========================================

function updateDashboard() {
    const total = students.length;

    const maleCount = students.filter(
        (student) => student.gender === "Male"
    ).length;

    const femaleCount = students.filter(
        (student) => student.gender === "Female"
    ).length;

    const departments = new Set(
        students.map((student) => student.department)
    );

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("maleStudents").textContent = maleCount;

    document.getElementById("femaleStudents").textContent = femaleCount;

    document.getElementById("totalDepartments").textContent =
        departments.size;
}

// ==========================================
// Search and filter events
// ==========================================

searchInput.addEventListener("input", renderStudents);

departmentFilter.addEventListener("change", renderStudents);

// ==========================================
// Button events
// ==========================================

document.getElementById("topAddButton")
    .addEventListener("click", openAddModal);

document.getElementById("sidebarAddButton")
    .addEventListener("click", openAddModal);

document.getElementById("emptyAddButton")
    .addEventListener("click", openAddModal);

document.getElementById("closeModal")
    .addEventListener("click", closeModal);

document.getElementById("cancelButton")
    .addEventListener("click", closeModal);

// Close when clicking outside the modal
studentModal.addEventListener("click", function (event) {
    if (event.target === studentModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        studentModal.classList.contains("show")
    ) {
        closeModal();
    }
});

// ==========================================
// Sidebar navigation
// ==========================================

document.querySelectorAll(".nav-item[href]").forEach((link) => {
    link.addEventListener("click", function () {
        document.querySelectorAll(".nav-item").forEach((item) => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

// ==========================================
// Application initialization
// ==========================================

renderStudents();

console.log("Student Management System initialized successfully.");
console.log(`Total student records: ${students.length}`);