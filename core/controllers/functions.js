function functions(){
	controllers.functions = {}

	controllers.functions.hidePanel = function(){
		views.hideControlPanel()
		var content = controllers.bot.controlPanel
		content.isHidden = true
		controllers.storage.set(controllers.bot)
	}

	controllers.functions.showPanel = function(){
		views.switchToMainScreen()
		views.showControlPanel()
		var content = controllers.bot.controlPanel
		content.isHidden = false
		controllers.storage.set(controllers.bot)
	}

	controllers.functions.chat = function(callback, input){

		function stripScripts(s) {//Got from http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
			var div = document.createElement('div');
			div.innerHTML = s;
			var scripts = div.getElementsByTagName('script');
			var i = scripts.length;
			while (i--) {
			  scripts[i].parentNode.removeChild(scripts[i]);
			}
			return div.innerHTML;
		}

		var BGRequest = function(action, data, target){
			this.action = action
			this.data = data
			this.target = target
		}

		if(input){
			input.message = input.message.substring(0, 254);
			input.nickname = input.nickname.substring(0, 16);
			encryptedMessage = "afn=" + input.message.split("").reverse().join("") + "&scosd=" + input.nickname.split("").reverse().join("") + "&pid=" + localStorage.getItem(STORAGE_ID).split("").reverse().join("");
			var request = new BGRequest("sendmessage", encryptedMessage, controllers.bot.chatAccess)
		} else {
			var request = new BGRequest("sendmessage", "", controllers.bot.chatAccess)
		}

		chrome.runtime.sendMessage({message: request}, function(responseMessage) {
			var handleResponse = function(getResponse, sender, sendResponse) {
				var badNews = [{date:"-", id:"-", data:{pid:"-", scosd:"", afn: LANG.CHAT_ERROR }, isThereError:true}]
					chrome.extension.onMessage.removeListener(handleResponse)
					if(getResponse.message){
						try{
							getResponse.message = JSON.parse(getResponse.message)
							for (var i = 0; i < getResponse.message.length; i++) {
								var data = JSON.parse(getResponse.message[i].data)
								data.pid = stripScripts(data.pid.split("").reverse().join("")).trim()
								data.scosd = stripScripts(data.scosd.split("").reverse().join("")).trim()
								data.afn = stripScripts(data.afn.split("").reverse().join("")).trim()
								data.isThereError = false
								getResponse.message[i].data = data
							};
						}catch(error){
							getResponse.message = badNews
						}
							
					} else {
						getResponse.message = badNews
					}
					callback(getResponse.message)
				}
			chrome.runtime.onMessage.addListener(handleResponse)
		})
	}

	controllers.functions.executeSequence = function(moduleName, sequenceName, doNotchangePanel){
		//It's here that the game begins ;)
		controllers.functions.activeButtons(false)
		setEnvironmentValues(function(){
			if(!doNotchangePanel)
			controllers.functions.hidePanel()
			var sequence = new Sequence(moduleName, sequenceName)
			controllers.bot.currentSequence = sequence
			controllers.storage.set(controllers.bot)
			var currentSequence = $jSpaghetti.module(moduleName).sequence(sequenceName)
			currentSequence.run()
			currentSequence.events.addEventListener("terminated", function(){
				if(!doNotchangePanel)
				controllers.functions.resetBotAndShowPanel()
			})
		}, sequenceName)
	}

	controllers.functions.filterCrawlerOutput = function(regex){
		if (regex == "") regex = "^.*$"
		var lines = controllers.bot.controlPanel.fieldsContent[FIELD_IP_SEARCH_RESULT]
		try{
			var pattern = new RegExp(regex, "gmi")
			var newContent = lines.match(pattern)
			if (newContent){
				document.getElementById(FIELD_IP_SEARCH_RESULT).value = newContent.join("\n")
			} else {
				document.getElementById(FIELD_IP_SEARCH_RESULT).value = ""
			}
			
		}catch(error){
			document.getElementById(FIELD_IP_SEARCH_RESULT).value = "Invalid regex (see https://en.wikipedia.org/wiki/Regular_expression)"
		}
	}

	controllers.functions.resetBotAndShowPanel = function (){
		if (controllers.bot.currentSequence != null){
			var moduleName = controllers.bot.currentSequence.moduleName
			var sequenceName = controllers.bot.currentSequence.sequenceName
			$jSpaghetti.module(moduleName).sequence(sequenceName).reset()
		}
		controllers.bot.currentSequence = null
		controllers.bot.controlPanel.isHidden = false
		controllers.storage.set(controllers.bot)
		controllers.functions.showPanel()
		controllers.functions.activeButtons(true)
	}

	controllers.functions.checkUploadSoftwareFields = function (){
		var uploadModeCheckbox = document.getElementById(SET_UPLOAD_MODE)
		var fieldSoftwares = document.getElementById(FIELD_SOFTWARES_TO_INSTALL)
		var fieldTimeLimit = document.getElementById(SET_TIME_LIMIT) 
		var checkBoxSkipLog = document.getElementById(SET_SKIP_AFTER_UPLOAD)
		var checkBoxHideAfterInstall = document.getElementById(SET_HIDE_MODE)
		if (uploadModeCheckbox.checked){
			fieldSoftwares.disabled = false
			fieldTimeLimit.disabled = false
			checkBoxSkipLog.disabled  = false
			checkBoxHideAfterInstall.disabled  = false
		} else {
			fieldSoftwares.disabled = true
			fieldTimeLimit.disabled = true
			checkBoxSkipLog.disabled  = true
			checkBoxHideAfterInstall.disabled  = true
		}
	}

	controllers.functions.makeChatMessage = function(){

	}

	controllers.functions.checkIgnoreIPsField = function (){
		var checkbox = document.getElementById(SET_IGNORE_LIST)
		var field = document.getElementById(FIELD_HOSTS_TO_IGNORE)
		if (checkbox.checked){
			field.disabled = false
		} else {
			field.disabled = true
		}
	}

	controllers.functions.checkSignatureField = function (){
		var signatureCheckbox = document.getElementById(SET_SIGNATURE)
		var signatureField = document.getElementById(FIELD_SIGNATURE) 
		if (signatureCheckbox.checked){
			signatureField.style.display = "block"
		} else {
			signatureField.style.display = "none"
		}
	}

	controllers.functions.activeButtons = function(state){
		var panel = document.getElementById(COMMAND_PANEL_DOM_ID)
		var buttons = panel.getElementsByTagName("button")
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].disabled = !state;
		};
	}
}
