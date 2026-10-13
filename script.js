// 1. Mảng gồm 5 công việc mẫu
const items = [
    {
        id: 1,
        title: "Viết báo cáo HTML",
        dueDate: "2026-10-20",
        priority: "Cao",
        status: "pending"
    },
    {
        id: 2,
        title: "Ôn Flexbox",
        dueDate: "2026-10-23",
        priority: "Trung bình",
        status: "pending"
    },
    {
        id: 3,
        title: "Làm bài DOM",
        dueDate: "2026-10-19",
        priority: "Cao",
        status: "done"
    },
    {
        id: 4,
        title: "Đọc tài liệu CSS",
        dueDate: "2026-10-25",
        priority: "Thấp",
        status: "pending"
    },
    {
        id: 5,
        title: "Thiết kế trang cá nhân",
        dueDate: "2026-10-21",
        priority: "Trung bình",
        status: "done"
    }
];

// 2. Lấy các phần tử HTML
const taskForm = document.querySelector("#taskForm");
const titleInput = document.querySelector("#taskTitle");
const dueDateInput = document.querySelector("#taskDueDate");
const priorityInput = document.querySelector("#taskPriority");

const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");

const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const formMessage = document.querySelector("#formMessage");

const totalCount = document.querySelector("#totalCount");
const pendingCount = document.querySelector("#pendingCount");
const doneCount = document.querySelector("#doneCount");

let nextId = Math.max(...items.map(item => item.id)) + 1;

// 3. Định dạng ngày thành dd/mm/yyyy
function formatDate(dateString) {
    if (!dateString) {
        return "Chưa đặt hạn";
    }

    const parts = dateString.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// 4. Lấy màu tương ứng với mức ưu tiên
function getPriorityClass(priority) {
    if (priority === "Cao") {
        return "priority-high";
    }

    if (priority === "Thấp") {
        return "priority-low";
    }

    return "priority-medium";
}

// 5. Cập nhật thống kê công việc
function updateSummary() {
    const total = items.length;

    const done = items.filter(function(item) {
        return item.status === "done";
    }).length;

    const pending = total - done;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    doneCount.textContent = done;
}

// 6. Tạo giao diện cho từng công việc
function createTaskElement(item) {
    const article = document.createElement("article");
    article.className = "task-item";

    // Công việc đã hoàn thành sẽ có màu nền riêng
    if (item.status === "done") {
        article.classList.add("is-done");
    }

    // Phần thông tin công việc
    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = item.title;

    // Ngày hạn, mức ưu tiên và trạng thái
    const meta = document.createElement("div");
    meta.className = "task-meta";

    const due = document.createElement("span");
    due.className = "meta-chip";
    due.textContent = "Hạn: " + formatDate(item.dueDate);

    const priority = document.createElement("span");
    priority.className = "priority " + getPriorityClass(item.priority);
    priority.textContent = "Ưu tiên: " + item.priority;

    const status = document.createElement("span");
    status.className = "meta-chip";

    if (item.status === "done") {
        status.classList.add("status-done");
        status.textContent = "Đã hoàn thành";
    } else {
        status.classList.add("status-pending");
        status.textContent = "Chưa hoàn thành";
    }

    meta.append(due, priority, status);
    main.append(title, meta);

    // Phần chứa các nút chức năng
    const actions = document.createElement("div");
    actions.className = "task-actions";

    // Nút đánh dấu hoàn thành
    const completeButton = document.createElement("button");
    completeButton.type = "button";

    if (item.status === "done") {
        // Nếu đã hoàn thành: nút chuyển sang màu xám
        completeButton.className = "btn-complete-done";
        completeButton.textContent = "Đánh dấu hoàn thành";
        completeButton.disabled = true;
    } else {
        // Nếu chưa hoàn thành: hiện nút màu xanh
        completeButton.className = "btn-complete";
        completeButton.textContent = "Đánh dấu hoàn thành";

        completeButton.addEventListener("click", function() {
            toggleTask(item.id);
        });
    }

    // Nút Xóa bằng chữ, không dùng dấu X
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-btn";
    deleteButton.textContent = "Xóa";
    deleteButton.title = "Xóa công việc";

    deleteButton.addEventListener("click", function() {
        deleteTask(item.id);
    });

    actions.append(completeButton, deleteButton);
    article.append(main, actions);

    return article;
}

// 7. Hiển thị danh sách, tìm kiếm và lọc
function renderTasks() {
    const keyword = searchInput.value
        .trim()
        .toLocaleLowerCase("vi");

    const selectedStatus = statusFilter.value;

    const filteredItems = items.filter(function(item) {
        const matchesTitle = item.title
            .toLocaleLowerCase("vi")
            .includes(keyword);

        const matchesStatus =
            selectedStatus === "all" ||
            item.status === selectedStatus;

        return matchesTitle && matchesStatus;
    });

    // Xóa danh sách cũ trước khi hiển thị lại
    taskList.replaceChildren();

    filteredItems.forEach(function(item) {
        const taskElement = createTaskElement(item);
        taskList.appendChild(taskElement);
    });

    // Hiển thị thông báo khi không tìm thấy công việc
    emptyState.hidden = filteredItems.length !== 0;


    // Cập nhật thống kê theo toàn bộ danh sách
    updateSummary();
}

// 8. Thông báo kết quả thao tác
function showMessage(message, isSuccess) {
    formMessage.textContent = message;
    formMessage.classList.toggle("success", isSuccess);
}

// 9. Thêm công việc mới
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    // Kiểm tra tên công việc
    if (title === "") {
        showMessage("Vui lòng nhập tên công việc.", false);
        titleInput.focus();
        return;
    }

    // Kiểm tra hạn hoàn thành
    if (dueDate === "") {
        showMessage("Vui lòng chọn hạn hoàn thành.", false);
        dueDateInput.focus();
        return;
    }

    // Tạo đối tượng công việc mới
    const newTask = {
        id: nextId++,
        title: title,
        dueDate: dueDate,
        priority: priority,
        status: "pending"
    };

    // Thêm vào mảng dữ liệu
    items.push(newTask);

    // Đặt lại form
    taskForm.reset();
    priorityInput.value = "Trung bình";

    // Đưa bộ lọc về Tất cả để dễ nhìn thấy công việc mới
    statusFilter.value = "all";
    searchInput.value = "";

    showMessage("Đã thêm công việc thành công!", true);

    // Cập nhật giao diện và thống kê
    renderTasks();

    titleInput.focus();
});

// 10. Đánh dấu công việc đã hoàn thành
function toggleTask(id) {
    const task = items.find(function(item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    // Chuyển trạng thái sang hoàn thành
    task.status = "done";

    // Vẽ lại giao diện:
    // Nút xanh sẽ chuyển thành nút xám "Đã hoàn thành"
    // Thống kê và trạng thái cũng được cập nhật
    renderTasks();
}

// 11. Xóa công việc
function deleteTask(id) {
    const index = items.findIndex(function(item) {
        return item.id === id;
    });

    if (index === -1) {
        return;
    }

    // Xóa công việc khỏi mảng
    items.splice(index, 1);

    // Cập nhật danh sách và thống kê
    renderTasks();
}

// 12. Xử lý tìm kiếm theo tên công việc
searchInput.addEventListener("input", function() {
    renderTasks();
});

// 13. Xử lý lọc theo trạng thái
statusFilter.addEventListener("change", function() {
    renderTasks();
});

// 14. Hiển thị 5 công việc mẫu khi mở trang
renderTasks();