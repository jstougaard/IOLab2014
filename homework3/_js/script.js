$(document).ready(function() {

	/*********************
	 * To-Do list items
	 *********************/

	var list = $("#todo-list"),
		listItems = [];

	
	var loadItems = function() {
		listItems = JSON.parse(localStorage.getItem("todoItems")) || [];

		if (listItems.length > 0) {
			for (i = 0; i < listItems.length; i++) {
				addItem(listItems[i]);
			}
		}
	};

	var saveItem = function(value) {
		listItems.push(value);
		localStorage.setItem("todoItems", JSON.stringify(listItems));
	};

	var removeItem = function(index) {
		if(!isNaN(index) && index >= 0 && index < listItems.length) {
			listItems.splice(index, 1);
			localStorage.setItem("todoItems", JSON.stringify(listItems));
		}
	};

	var addItem = function(value) {
		var elem = $("<li/>", {"class": "animate", text: value}).append(
				$("<a/>", {"class": "todo-list-remove", "text":"x"})
			);
		list.append( elem );
		
		setTimeout(function() {
			elem.removeClass("animate"); // Avoid animation after it was added
		}, 500);

	};

	$("#todo-form").on("submit", function(e) {
		e.preventDefault();

		var input = $(this).find("input[name=todo-form-add]"),
			value = input.val();

		if(value) {
			addItem(value);
			saveItem(value);
			input.val("");
		}
	});

	$("#todo-list").on("click", ".todo-list-remove", function(e){
		e.preventDefault();
		var elem = $(this).parent(); 
		elem.addClass("removed");
		removeItem(elem.index());

		setTimeout(function() {
			elem.remove(); // Remove element after animation
		}, 500);
	});

	loadItems();


	/********************
	 * Background images
	 ********************/
	var slideShowDelay = 5000,
		slideShowImgCount = 10;

	var initPosition = function() {
		displayLoader("Determining position...");
		navigator.geolocation.getCurrentPosition(function(position) {
			hideLoader();
			fetchPhotos(position.coords.latitude, position.coords.longitude);
		});
	};

	var fetchPhotos = function(lat, lng) {
		displayLoader("Loading Flikr photos...");
		$.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&jsoncallback=?",
		{
			api_key: "d799d2402512761796750af8e2792479",
			sort: "interestingness-desc",
			tags: "nature",
			accuracy: 6,
			content_type: 1,
			has_geo: 1,
			lat: lat,
			lon: lng,
			radius: 15,
			per_page:slideShowImgCount,
		}, function(data){
			console.log("Response", data);
			//runBackgroundSlidshow(data.photos.photo);
			var imgUrls = [];
			$.each(data.photos.photo, function(i,item){
				var url = createPhotoUrl(item);
				$('<li/>').css("background-image", "url("+url+")").appendTo('.backgrounds');
				
				imgUrls.push(url);
			});

			preloadImages(imgUrls, function() {
				hideLoader();
				$("body").css("background", "#FFF");
				fadeBackground(0);
			});
		});
	};

	var createPhotoUrl = function(data) {
		return "https://farm"+data.farm+".staticflickr.com/"+data.server+"/"+data.id+"_"+data.secret+"_b.jpg";
	};


	var fadeBackground = function(nextIndex) {
		if (!nextIndex || nextIndex<0) nextIndex = 0;
		$("ul.backgrounds")
			.find("li.active").removeClass("active").end()
			.find("li").eq(nextIndex).addClass('active');

		nextIndex = (nextIndex+1) % $("ul.backgrounds li").length;
		setTimeout(fadeBackground, slideShowDelay, nextIndex);
	};


	// Callback function gets called after all images are preloaded
	var preloadImages = function(images, callback) {
		listCount = images.length;
		$(images).each(function() {
			$('<img>').attr({ src: this }).load(function() {
				listCount--;
				if (listCount === 0) { callback(); }
			});
		});
	};

	var displayLoader = function(text) {
		$("#loader").text(text).slideDown();
	};

	var hideLoader = function() {
		$("#loader").slideUp();
	};
	

	initPosition();

});