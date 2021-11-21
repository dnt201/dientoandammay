document.getElementById("inputText").focus();

/**
* Change the region and endpoint.\
*/
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: 'us-east-1:e8ecc73b-676d-46f8-89ba-e957866f07e6' });
// new AWS.Credentials({
//     accessKeyId: 'ASIAZQXWA5Z5EWYJK4PY',
//     secretAccessKey: '6K2CSzpCLDwc3hnDXObU6V6RLeiF5cfUigDaeZie', 
//     sessionToken: 'session'
//   });

var translate = new AWS.Translate({ region: AWS.config.region });
var polly = new AWS.Polly();

function doTranslate() {
    var inputText = document.getElementById('inputText').value;
    if (!inputText) {
        alert("Input text cannot be empty.");
        exit();
    }

    // get the language codes
    var sourceDropdown = document.getElementById("sourceLanguageCodeDropdown");
    var sourceLanguageCode = sourceDropdown.options[sourceDropdown.selectedIndex].value;

    var targetDropdown = document.getElementById("targetLanguageCodeDropdown");
    var targetLanguageCode = targetDropdown.options[targetDropdown.selectedIndex].value;

    var params = {
        Text: inputText,
        SourceLanguageCode: sourceLanguageCode,
        TargetLanguageCode: targetLanguageCode
    };

    translate.translateText(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            alert("Error calling Amazon Translate. " + err.message);
            return;
        }
        if (data) {
            var outputTextArea = document.getElementById('outputText');
            outputTextArea.value = data.TranslatedText;
            document.getElementById('result_input').innerHTML = "Enter text above then click Synthesize.";
            document.getElementById('result_output').innerHTML = "Enter text above then click Synthesize";

            document.getElementById('audioSource_input').src = "";
            document.getElementById('audioPlayback_input').load();

            document.getElementById('audioSource_output').src = "";
            document.getElementById('audioPlayback_output').load();
        }
    });
}

function doSynthesizeInput() {
    var text = document.getElementById('inputText').value.trim();
    if (!text) {
        return;
    }
    var sourceLanguageCode = document.getElementById("sourceLanguageCodeDropdown").value;
    //var voiceID= document.getElementById("voiceIDSelect").value;
    var who = "input"
    doSynthesize(text, sourceLanguageCode, who);
}

function doSynthesizeOutput() {
    var text = document.getElementById('outputText').value.trim();
    if (!text) {
        return;
    }
    var targetLanguageCode = document.getElementById("targetLanguageCodeDropdown").value;
    //var voiceID= document.getElementById("voiceIDSelect").value;
    doSynthesize(text, targetLanguageCode, "output");
}

function doSynthesize(text, languageCode, who) {
    var voiceId;
    console.log(who);
    switch (languageCode) {
        case "de":
            voiceId = "Marlene";
            break;
        case "en":
            voiceId = "Joanna";
            break;
        case "es":
            voiceId = "Penelope";
            break;
        case "fr":
            voiceId = "Celine";
            break;
        case "pt":
            voiceId = "Vitoria";
            break;
        default:
            voiceId = null;
            break;
    }
    if (!voiceId) {
        alert("Hiện tại polly chưa hỗ trợ ngôn ngữ: \"" + languageCode + "\"");
        return;
    }
    var params = {

        OutputFormat: "mp3",
        SampleRate: "8000",
        Text: text,
        TextType: "text",
        VoiceId: voiceId
    };
    polly.synthesizeSpeech(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            alert("Error calling Amazon Polly. " + err.message);
        }
        else {
            var uInt8Array = new Uint8Array(data.AudioStream);
            var arrayBuffer = uInt8Array.buffer;
            var blob = new Blob([arrayBuffer]);
            var url = URL.createObjectURL(blob);
            audioElement = new Audio([url]);
            //audioElement.play();
            switch (who) {
                case "input": {
                    document.getElementById('audioSource_input').src = url;
                    document.getElementById('audioPlayback_input').load();
                    document.getElementById('result_input').innerHTML = "Speech ready to play.";
                    break;
                }
                case "output": {
                    document.getElementById('audioSource_output').src = url;
                    document.getElementById('audioPlayback_output').load();
                    document.getElementById('result_output').innerHTML = "Speech ready to play.";
                    break;
                }
                default: {
                    break;
                }
            }
        }
    });
}

function clearInputs() {
    document.getElementById('inputText').value = "";
    document.getElementById('outputText').value = "";
    document.getElementById("sourceLanguageCodeDropdown").value = "en";
    document.getElementById("targetLanguageCodeDropdown").value = "en";
    $('#image').removeAttr('src')
    $("#file-upload").val('')
    document.getElementById("reselect").hidden = true;
}
