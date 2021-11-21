async function showDataToTextbox(response) {
  try {
    let result = '';
    response.Blocks.forEach(block => {
      if (block.BlockType === "LINE" || block.BlockType === "CELL") {
        if ("Text" in block && block.Text !== undefined) {
          result += '\n' + block.Text
        }
      }
    });
    document.getElementById("inputText").value = result;
  } catch (err) {
    console.log("Error", err);
  }
}

var textractClient = new AWS.Textract();
async function analyze_document_text(params) {
  let analyzeDoc = textractClient.analyzeDocument(params, (err, data) => {
    if (err)          // an error occurred
      console.log(err, err.stack);
    else {           // successful response
      showDataToTextbox(data)
    }
  });
}

function encode(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

var bs_modal = $('#modal');
var image = document.getElementById('image');
var reselect = document.getElementById('reselect')
var cropper, reader, file;

var fileUpload = document.getElementById('fileUpload')

fileUpload.addEventListener("change", (event) => {
  var files = event.target.files;
  console.log('change');
  var done = (url) => {
    image.src = url;
    reselect.hidden = false;
    bs_modal.modal('show');
  };

  if (files && files.length > 0) {
    file = files[0];

    if (URL) {
      done(URL.createObjectURL(file));
    } else if (FileReader) {
      reader = new FileReader();
      reader.onload = (e) => done(reader.result);
      reader.readAsDataURL(file);
    }
  }
})

bs_modal.on('shown.bs.modal', function () {
  cropper = new Cropper(image, {
    viewMode: 2,
    preview: '.preview'
  });
}).on('hidden.bs.modal', function () {
  cropper.destroy();
  cropper = null;
});

$("#crop").click(function () {
  canvas = cropper.getCroppedCanvas();

  canvas.toBlob(function (blob) {
    //console.log(blob);
    url = URL.createObjectURL(blob);
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob)
    reader.addEventListener('load', event => {
      let imageBuffer = event.target.result
      console.log(imageBuffer);
      let params = {
        Document: {
          Bytes: imageBuffer
        },
        FeatureTypes: [
          'TABLES',
          'FORMS'
        ]
      }
      //Show image after crop
      // var bytes = new Uint8Array(imageBuffer);
      // var image = document.getElementById('imgtest');
      // image.src = 'data:image/png;base64,' + encode(bytes);

      //Analyze document
      //analyze_document_text(params)
      bs_modal.modal('hide');
    })
  });
});

$('#reselect').click(() => {
  bs_modal.modal('show');
})