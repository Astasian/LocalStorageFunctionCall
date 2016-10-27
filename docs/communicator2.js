"use strict";
/*
The MIT License (MIT)
Copyright (c) 2016 Astasian
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
https://github.com/Astasian/LocalStorageFunctionCall
*/
function LsFunction() {
	let placeholder = "available";
	let resultTimeout = 500;

	//Register a function by its name, itself (callback) and the needed time span for the check cycle
	this.RegisterLocalStorageFunction = function(name, callback) {

		//Set local storage items for function and its result
		resetFunction(name);

		//Setting the event
		window.addEventListener('storage', function(e) {
			//Getting the params or eventually just the placeholder

			//Call the function if params are set and reset all
			if (e.key === name && e.newValue != placeholder) {
				let result = callback(e.newValue);
				//Set result
				localStorage.setItem(name + "Result", result);
				//Reset call
				localStorage.setItem(name, placeholder);
			}
		});
	}

	this.CallLocalStorageFunction = function(name, params, callback) {
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
					window.removeEventListener('storage', storageEvent, false);
				}
			}

			//Add listener to event
			window.addEventListener('storage', storageEvent);

			//Start timout to cancel listener if no result is set, hence no remote function was called
			timeout = setTimeout(function() {
				//Dismiss interval
				clearTimeout(timeout);
				//Clean up
				localStorage.setItem(name, placeholder);
				window.removeEventListener('storage', storageEvent, false);
			}, resultTimeout);
		}
	}

	//Reset local storage values
	function resetFunction(name) {
		localStorage.setItem(name, placeholder);
		localStorage.setItem(name + "Result", placeholder);
	}
};
