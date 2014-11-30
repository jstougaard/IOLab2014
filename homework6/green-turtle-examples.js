var printHomework = function() {
	var homeworks = document.getElementsByType("http://milowski.com/syllabus/Homework");
	for (var i=0; i<homeworks.length;i++) {
		var id = homeworks[i].data.id,
			title = document.data.getValues(id, "http://milowski.com/syllabus/title")[0] || "N/A";
			duedate = document.data.getValues(id, "http://milowski.com/syllabus/due")[0] || "N/A";
		console.log("Title: "+title+" is due "+duedate, id)
	}
}

var printMilestones = function() {
	var homeworks = document.getElementsByType("http://milowski.com/syllabus/Presentation");
	for (var i=0; i<homeworks.length;i++) {
		var id = homeworks[i].data.id,
			title = document.data.getValues(id, "http://milowski.com/syllabus/title")[0] || "N/A";
			duedate = document.data.getValues(id, "http://milowski.com/syllabus/due")[0] || "N/A";
		console.log("Title: "+title+" is due "+duedate, id)
	}
}