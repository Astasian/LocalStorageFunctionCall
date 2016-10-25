let placeholder = "available";
let resultTimeout = 8000;
let debugLF = true;

//Register a function by its name, itself (callback) and the needed time span for the check cycle
function RegisterLocalStorageFunction(name, callback) {

	if (debugLF)
		console.log("Registered function " + name);

	//Set local storage items for function and its result
	resetFunction(name);

	//Setting the event
	window.addEventListener('storage', function(e) {
		//Getting the params or eventually just the placeholder

		//Call the function if params are set and reset all
		if (e.key === name && e.newValue != placeholder) {
			var result = callback(e.newValue);
			//Set result
			localStorage.setItem(name + "Result", result);
			//Reset call
			localStorage.setItem(name, placeholder);
		}
	});
}

function CallLocalStorageFunction(name, params, callback) {
	if (debugLF)
		console.log("Called remote function " + name + "with params: " + params);
	//Check if the function is already called
	if (localStorage.getItem(name) == placeholder && localStorage.getItem(name + "Result") == placeholder) {

		//Call remote function
		localStorage.setItem(name, params);

		//Define timeout and event for future usage
		let timeout = {};
		let storageEvent = {};

		//Check in interval for result
		storageEvent = function(e) {
			//Check wheter the result is set
			if (e.key == name + "Result" && e.newValue != placeholder) {
				//Call callback with results
				callback(e.newValue);

				//Reset result in local storage
				localStorage.setItem(name + "Result", placeholder);

				//Dismiss listener and timeout
				clearTimeout(timeout);
				window.removeEventListener('storage',storageEvent, false);
			}
		}
    //Add listener to event
    window.addEventListener('storage',storageEvent);

		//Start timout to cancel listener if no result is set, hence no remote function was called
		timeout = setTimeout(function() {
			//Dismiss interval
			clearTimeout(timeout);
			//Clean up
			window.removeEventListener('storage',storageEvent, false);
		}, resultTimeout);
	}
}

//Reset local storage values
function resetFunction(name) {
	localStorage.setItem(name, placeholder);
	localStorage.setItem(name + "Result", placeholder);
}
