
document.addEventListener("DOMContentLoaded", function () {

    // Mengambil elemen HTML
    const form = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const categoryInput = document.getElementById("categoryInput");
    const dateInput = document.getElementById("dateInput");
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const filterInput = document.getElementById("filterInput");
    const clearDoneBtn = document.getElementById("clearDoneBtn");

    const totalCount = document.getElementById("totalCount");
    const pendingCount = document.getElementById("pendingCount");
    const doneCount = document.getElementById("doneCount");
    const todayLabel = document.getElementById("todayLabel");

    const STORAGE_KEY = "taskku_tasks_v1";

    // Memuat data dari browser
    function loadTasks() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const tasks = data ? JSON.parse(data) : [];

            if (!Array.isArray(tasks)) return [];

            return tasks.filter(task =>
                task &&
                typeof task.id === "string" &&
                typeof task.title === "string"
            );
        } catch (error) {
            console.error("Gagal memuat tugas:", error);
            return [];
        }
    }

    let tasks = loadTasks();

    // Menyimpan data
    function saveTasks() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(tasks)
            );
        } catch (error) {
            console.error("Gagal menyimpan tugas:", error);
        }
    }

    // Membuat ID tugas
    function createID() {
        return Date.now().toString() +
            Math.random().toString(36).substring(2, 8);
    }

    // Mengubah format tanggal
    function formatDate(date) {
        if (!date) return "Tanpa tenggat";

        const result = new Date(date + "T00:00:00");

        if (isNaN(result.getTime())) {
            return "Tanggal tidak valid";
        }

        return result.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Memperbarui jumlah tugas
    function updateStats() {
        totalCount.textContent = tasks.length;

        pendingCount.textContent =
            tasks.filter(task => !task.done).length;

        doneCount.textContent =
            tasks.filter(task => task.done).length;
    }

    // Menampilkan tugas
    function renderTasks() {

        const keyword = searchInput.value
            .trim()
            .toLowerCase();

        const filter = filterInput.value;

        const filteredTasks = tasks.filter(task => {

            const matchesSearch =
                task.title.toLowerCase().includes(keyword) ||
                (task.category || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchesFilter =
                filter === "all" ||
                (filter === "pending" && !task.done) ||
                (filter === "done" && task.done);

            return matchesSearch && matchesFilter;
        });

        taskList.innerHTML = "";

        filteredTasks.forEach(task => {

            const item = document.createElement("li");
            item.className = "task-item";

            if (task.done) {
                item.classList.add("completed");
            }

            // Tombol selesai
            const checkButton =
                document.createElement("button");

            checkButton.type = "button";
            checkButton.className = "check-btn";
            checkButton.textContent = task.done ? "✓" : "";

            checkButton.addEventListener("click", function () {
                toggleTask(task.id);
            });

            // Isi tugas
            const content = document.createElement("div");
            content.className = "task-content";

            const title = document.createElement("div");
            title.className = "task-name";
            title.textContent = task.title;

            const meta = document.createElement("div");
            meta.className = "task-meta";

            const category = document.createElement("span");
            category.className = "tag";
            category.textContent = task.category || "Lainnya";

            const date = document.createElement("span");
            date.textContent = formatDate(task.due);

            meta.appendChild(category);
            meta.appendChild(date);

            content.appendChild(title);
            content.appendChild(meta);

            // Tombol hapus
            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Hapus";

            deleteButton.addEventListener("click", function () {
                deleteTask(task.id);
            });

            item.appendChild(checkButton);
            item.appendChild(content);
            item.appendChild(deleteButton);

            taskList.appendChild(item);
        });

        emptyState.style.display =
            filteredTasks.length === 0 ? "block" : "none";

        updateStats();
    }

    // Menambah tugas
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = taskInput.value.trim();

        if (title === "") {
            alert("Nama tugas tidak boleh kosong!");
            return;
        }

        const newTask = {
            id: createID(),
            title: title,
            category: categoryInput.value || "Lainnya",
            due: dateInput.value || "",
            done: false
        };

        tasks.unshift(newTask);

        saveTasks();
        form.reset();
        renderTasks();

        taskInput.focus();
    });

    // Mengubah status tugas
    function toggleTask(id) {

        tasks = tasks.map(task => {

            if (task.id === id) {
                task.done = !task.done;
            }

            return task;
        });

        saveTasks();
        renderTasks();
    }

    // Menghapus tugas
    function deleteTask(id) {

        tasks = tasks.filter(task => task.id !== id);

        saveTasks();
        renderTasks();
    }

    // Mencari tugas
    searchInput.addEventListener("input", function () {
        renderTasks();
    });

    // Filter tugas
    filterInput.addEventListener("change", function () {
        renderTasks();
    });

    // Menghapus seluruh tugas selesai
    clearDoneBtn.addEventListener("click", function () {

        tasks = tasks.filter(task => !task.done);

        saveTasks();
        renderTasks();
    });

    // Menampilkan tanggal hari ini
    if (todayLabel) {
        todayLabel.textContent =
            new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    // Menjalankan aplikasi
    renderTasks();

});
