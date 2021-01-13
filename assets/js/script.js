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

  auditTask(taskLi);

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

  dataInput.datepicker({
    minDate: 0,
    onClose: function() {
      $(this).trigger("change");
    }
  });

  dataInput.trigger("focus");
});

$(".list-group").on("change", "input[type='text']", function() {
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  let date = $(this)
    .val()
    .trim();

  let index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].date = date;
  saveTasks();

  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  $(this).replaceWith(taskSpan);

  console.log($(taskSpan));
  console.log($(taskSpan).closest(".list-group-item"));

  auditTask($(taskSpan).closest(".list-group-item"));
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

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  }, 
  over: function(event) {
    event.target.classList.add("dropover-active");
  },
  out: function(event) {
    event.target.classList.remove("dropover-active");
  },
  update: function(event) {
    let tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function () {
      let text = $(this)
        .find("p")
        .text()
        .trim();

      let date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text,
        date
      });
    });

    // trim down list's ID to match object property
    let arrName = $(this)
    .attr("id")
    .replace("list-", "");

    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

$("#modalDueDate").datepicker({
  minDate: 0
});

function auditTask(taskEl) {
  let date = $(taskEl)
    .find("span")
    .text()
    .trim();

  let time = moment(date, "L").set("hour", 17);

  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } 
  else if ( Math.abs(moment().diff(time, "days")) <= 2 ) {
    $(taskEl).addClass("list-group-item-warning");
  };

};

setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    console.log(index, el);
    auditTask(el);
  });
}, (1000 * 60) * 30 );