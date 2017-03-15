exports.MyStart = function(data, done) {
	// called after the start event arrived at MyStart
  console.log("mystart");
  //this.triggerEvent("MyTask");
	done(data);
};

exports.MyTask = function(data, done) {
	// called at the beginning of MyTask
  console.log("mytask");
  this.taskDone("MyTask");
	done(data);
};

exports.MyTaskDone = function(data, done) {
	// Called after the process has been notified that the task has been finished
	// by invoking myProcess.taskDone("MyTask").
	// Note: <task name> + "Done" handler are only called for
	// user tasks, manual task, and unspecified tasks
  console.log("MyTaskDone");
	done(data);
};
exports.Is_it_ok_ = function(data, done) {
	// called after arriving at "Is it ok?"
  console.log("is it ok1");
	done(data);
};

exports.Is_it_ok_$ok = function(data) {
	// has to return true or false
	// the name of the sequence flow follows after "$".
console.log("is it ok2");
  // if there is no name, an error is thrown
	return true;

};
exports.MyTask1 = function(data, done) {
	// called at the beginning of MyTask
  console.log("mytask1");
  this.taskDone("MyTask1");
	done(data);
};

exports.Is_it_ok_$nok = function(data) {
	// has to return true or false
	// the name of the sequence flow follows after "$".
	// if there is no name, an error is thrown
  console.log("is it ok");
	return false;
};
exports.MyEnd = function(data, done) {
	// Called after MyEnd has been reached
  console.log("end");
	done(data);
};
