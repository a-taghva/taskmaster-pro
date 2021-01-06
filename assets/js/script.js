let tasks = {};

let createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  let taskLi = $("<li>").addClass("list-group-item");
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  let taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

let loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

let saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
  let text = $(this)
    .text()
    .trim();

  let textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function() {
  let text = $(this)
    .val()
    .trim();
  
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  let index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  let taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  $(this).replaceWith(taskP);
});


$(".list-group").on("click", "span", function() {
  let date = $(this)
    .text()
    .trim();
  
  let dataInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  $(this).replaceWith(dataInput);
  dataInput.trigger("focus");
});

$(".list-group").on("blur", "input", function() {
  let taskStatus = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  let date = $(this)
    .val();

  let index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[taskStatus][index].date = date;
  saveTasks();

  let dateSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  $(this).replaceWith(dateSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal",  function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal",  function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click( function() {
  // get form values
  let taskText = $("#modalTaskDescription").val();
  let taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click",  function() {
  for (let key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


