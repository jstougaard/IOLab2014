// Only affect visible tab
if (window == top) {
	var summaryCreated = false;
	var homeworkTypeUrl = "http://milowski.com/syllabus/Homework",
		milestoneTypeUrl = "http://milowski.com/syllabus/Presentation",
		titleTypeUrl = "http://milowski.com/syllabus/title",
		dueTypeUrl = "http://milowski.com/syllabus/due";

	/**
	 * Get deadlines from HTML using green turtle
	 */
	var getDeadlines = function(typeUrl, titleTypeUrl, dueTypeUrl) {
		var elems = document.getElementsByType(typeUrl);
		var deadlines = [];
		for (var i=0; i<elems.length;i++) {
			var id = elems[i].data.id;
			var date = document.data.getValues(id, dueTypeUrl)[0];
			deadlines.push({
				title: document.data.getValues(id, titleTypeUrl)[0] || "Undefined title",
				duedate_string: date,
				duedate: new Date(date+'-'+(new Date().getFullYear())),
				url: id.substring(0, 2) == "_:" ? "" : id
			});
		}
		return deadlines;
	};

	/**
	 * Get the object with future duedate closest to now
	 */
	var getNextDeadline = function(deadlines) {
		var nextDeadline;
		var today = new Date();
		$.each(deadlines, function(i, deadline) {
			if (deadline.duedate > today && (!nextDeadline || deadline.duedate < nextDeadline.duedate))
				nextDeadline = deadline;
		});
		return nextDeadline;
	};

	/**
	 * Get upcoming (everything with duedate in the future, except for the very next one)
	 */
	var getUpcoming = function(deadlines) {
		var upcoming = [];
		var today = new Date();

		// Find next
		$.each(deadlines, function(i, deadline) {
			if (deadline.duedate > today)
				upcoming.push(deadline);
		});

		// Sort by date
		upcoming.sort(function(a,b) {return (a.duedate > b.duedate) ? 1 : ((b.duedate > a.duedate) ? -1 : 0);} );
		// Remove first element as it will be the next
		upcoming.shift();

		return upcoming;
	};

	/**
	 * Get HTML representation of deadline object
	 */
	var getDeadlineHtml = function(deadline) {
		return '<span class="due-date">'+deadline.duedate_string+'</span>'+
				'<a'+(deadline.url?' href="'+deadline.url+'"':'')+'>'+deadline.title.trim()+'</a>';
	};

	/**
	 * Populate specified column with provided data
	 */
	var populateColumn = function($column, deadlines) {
		var nextUp = getNextDeadline(deadlines);
		if (nextUp) {
			console.log("Next up date", new Date(nextUp.duedate));
			$column.find(".next-up").html( getDeadlineHtml(nextUp) );
		}

		$.each(getUpcoming(deadlines), function(index, deadline) {
			$column.find("ul").append( $("<li/>").html(getDeadlineHtml(deadline)) );
		});
	};

	/**
	 * Populate summary with data
	 */
	var populateSummary = function() {
		var $summary = $("#summarizr");
		var homeworks = getDeadlines(homeworkTypeUrl, titleTypeUrl, dueTypeUrl);
		console.log("Homework", homeworks);
		populateColumn($summary.find(".homework"), homeworks);
		
		var milestones = getDeadlines(milestoneTypeUrl, titleTypeUrl, dueTypeUrl);
		console.log("Milestones", milestones);
		populateColumn($summary.find(".milestones"), milestones);
	};

	/**
	 * Generate summary scaffold from template
	 */
	var generateSummary = function() {
		$.get(chrome.extension.getURL('/src/inject/template.html'), function(data) {
			$($.parseHTML(data))
				.insertBefore('article>section:first-of-type')
				.show();

			if (typeof document.getElementsByType == "undefined") {
				window.addEventListener("rdfa.loaded", populateSummary,true);
			} else {
				populateSummary();
			}
			
		});
	};

	var showSummary = function() {
		$("#summarizr").slideDown();
	};

	var hideSummary = function() {
		$("#summarizr").slideUp();
	};


	/**
	 * Change state of summary
	 */
	chrome.extension.onRequest.addListener(function(req, sender, callback) {
		// Received message to toggle summary
		if (req.show) {
			if (!summaryCreated) {
				// Generate summary if first time
				generateSummary();
				summaryCreated = true;
			} else {
				showSummary();
			}
		} else {
			hideSummary();
		}


		callback();
	});
}