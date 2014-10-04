/*********************
 * To-Do list items
 * Encapsulated in closure
 *********************/
(function() {

	var listElem,
		formElem,
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
		listElem.append( elem );
		
		setTimeout(function() {
			elem.removeClass("animate"); // Avoid animation after it was added
		}, 500);

	};

	var onNewItem = function(event) {
		event.preventDefault();

		var input = $(this).find("input[name=todo-form-add]"),
			value = input.val();

		if(value) {
			addItem(value);
			saveItem(value);
			input.val("");
		}
	};

	var onRemoveItem = function(event) {
		event.preventDefault();
		var elem = $(this).parent(); 
		elem.addClass("removed");
		removeItem(elem.index());

		setTimeout(function() {
			elem.remove(); // Remove element after animation
		}, 500);
	};

	this.initTodoList = function(listSelector, formSelector) {
		listElem = $(listSelector).on("click", ".todo-list-remove", onRemoveItem);
		formElem = $(formSelector).on("submit", onNewItem);
		loadItems();
	};

})();


/********************
 * Background images
 * jQuery plugin style
 * Could obviously be made more generic
 ********************/
(function($, window, document, undefined){
	

	var BackgroundSlideshow = {
		init: function(options, element) {
			this.$elem = $(element);
			
			this.options = $.extend(true, {}, $.fn.backgroundSlideshow.options, options);
			console.log(this.options)
			this.$loader = $(this.options.loaderSelector);
			this.getPosition();
		},
		getPosition: function() {
			var self = this;
			this.displayLoader("Determining position...");
			navigator.geolocation.getCurrentPosition(function(position) {
				self.hideLoader();
				self.fetchPhotos(position.coords.latitude, position.coords.longitude);
			});
		},
		fetchPhotos: function(lat, lng) {
			this.displayLoader("Loading Flikr photos...");
			var self = this,
				params = $.extend({}, self.options.flickr_params, {
					content_type: 1,
					has_geo: 1,
					lat: lat,
					lon: lng,
					per_page:self.options.img_count,
				});

			$.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&jsoncallback=?", params, function(data){
				console.log("Response", data);

				var imgUrls = [];
				// Add all images
				$.each(data.photos.photo, function(i,item){
					var url = self.createPhotoUrl(item);
					self.$elem.append( $('<'+self.options.item_type+'/>').css("background-image", "url("+url+")") );
					
					imgUrls.push(url);
				});

				// Preload and start slideshow
				// TODO: Start slideshow with loaded photos as soon as the first one is ready
				self.preloadImages(imgUrls, function() {
					self.hideLoader();
					$("body").css("background", "#FFF");
					self.showNextBackground(0);
				});
			});
		},

		createPhotoUrl: function(data) {
			return "https://farm"+data.farm+".staticflickr.com/"+data.server+"/"+data.id+"_"+data.secret+"_b.jpg";
		},


		showNextBackground: function(nextIndex) {
			if (!nextIndex || nextIndex<0) nextIndex = 0;
			this.$elem
				.find(this.options.item_type+"."+this.options.active_class).removeClass( this.options.active_class ).end()
				.find(this.options.item_type).eq(nextIndex).addClass( this.options.active_class );

			nextIndex = (nextIndex+1) % this.$elem.find( this.options.item_type ).length;
			setTimeout(this.showNextBackground.bind(this), this.options.delay, nextIndex);
		},


		// Callback function gets called after all images are preloaded
		preloadImages: function(images, callback) {
			var listCount = images.length;
			$(images).each(function() {
				$('<img>').attr({ src: this }).load(function() {
					listCount--;
					if (listCount === 0) { callback(); }
				});
			});
		},
		displayLoader: function(text) {
			if (this.$loader)
				this.$loader.text(text).slideDown();
		},
		hideLoader: function() {
			if (this.$loader)
				this.$loader.slideUp();
		}
	};

	$.fn.backgroundSlideshow = function(options) {
		//Here  - this - refers to jQuery object
		return this.each(function() {
			var slideshow = Object.create(BackgroundSlideshow);
			slideshow.init(options, this);
			$.data(this, 'backgroundSlideshow', slideshow); // Save reference to plugin object - under pluginName
		});
	};

	//Make options mutable - can be changed generally for all
	$.fn.backgroundSlideshow.options = {
		//Default options
		delay: 5000,
		img_count: 10,
		item_type: "li",
		active_class: "active",
		loaderSelector: "#loader",
		flickr_params: {
			api_key: "d799d2402512761796750af8e2792479",
			sort: "interestingness-desc",
			tags: "nature",
			accuracy: 6,
			radius: 15,
		}
	};
})(jQuery, window, document);



$(document).ready(function() {

	initTodoList("#todo-list", "#todo-form");

	$("ul.backgrounds").backgroundSlideshow({flickr_params: {tags: "city"}});
	

});