const uploading2 = document.getElementById("uploading2");
const error2 = document.getElementById("error2");
const uploaded2 = document.getElementById("uploaded2");

const gotLangModel = document.getElementById("gotLangModel");
const getLangModel = document.getElementById("getLangModel");

const gotAcoModel = document.getElementById("gotAcoModel");
const getAcoModel = document.getElementById("getAcoModel");

$(document).ready(() => {

    uploaded2.style.display = "none";
    error2.style.display = "none";
    uploading2.style.display = "none";
    gotAcoModel.style.display = "none";
    gotLangModel.style.display = "none";
    
    getLanguageModels();
    getAcousticModels();
});

const isEmpty = (el) => {
    return !$.trim(el.html())
};

const getLanguageModels = async () => {
    await fetch('/listLanguageModels').then(async (response) => {
        data = await response.json();

        var dynamicSelect = document.getElementById("select-id1");

        data.customizations.forEach(element => {

            var newOption = document.createElement("option");
            newOption.name = element.name.toString(); //item.whateverProperty
            newOption.text = element.name.toString(); //item.whateverProperty
            newOption.value = element.customization_id.toString(); //item.whateverProperty

            dynamicSelect.add(newOption);

            //new select items should populated immediately
        });

        getLangModel.style.display = "none";
        gotLangModel.style.display = "block";

    });
};

const getAcousticModels = async () => {
    await fetch('/listAcousticModels').then(async (response) => {
        data = await response.json();

        var dynamicSelect = document.getElementById("select-id2");

        data.customizations.forEach(element => {

            var newOption = document.createElement("option");
            newOption.text = element.name.toString(); //item.whateverProperty
            newOption.value = element.customization_id.toString(); //item.whateverProperty

            dynamicSelect.add(newOption);

            //new select items should populated immediately
        });

        getAcoModel.style.display = "none";
        gotAcoModel.style.display = "block";

    });
};

// submitButton.onclick = () => {
//     uploaded2.style.display = "none";
//     uploading2.style.display = "block";
//     progressIndicator.style.display = "block";

//     if (isEmpty($('#myFiles'))) {
//         uploading2.style.display = "none";
//         error2.style.display = "block";
//     } else {
//         var category = document.getElementById('category');
//         var concepts = document.getElementById('concepts');
//         var entity = document.getElementById('entity');
//         var categoryBool, conceptsBool, entityBool;
//         Loading1.style.display = "block";
//         Loading2.style.display = "block";
//         if (category.checked == true) {
//             categoryBool = "True";
//         } else {
//             categoryBool = "False";
//         }

//         if (concepts.checked == true) {
//             conceptsBool = "True";
//         } else {
//             conceptsBool = "False";
//         }

//         if (entity.checked == true) {
//             entityBool = "True";
//         } else {
//             entityBool = "False";
//         }

//         var file = $('.bx--file-filename').html();

//         progressMsg.className = "w3-animate-opacity";
//         progressMsg.innerHTML = "uploading " + file + "...";

//         let NluOptions = {
//             file: file,
//             category: categoryBool,
//             concepts: conceptsBool,
//             entity: entityBool,
//             sentiments: 'True',
//             positiveSentences: 'True'
//         };

//         let SttModel = {
//             file: file,
//             langModel: document.getElementById("select-id1").value,
//             acoModel: document.getElementById("select-id2").value
//         };

//         formData = new FormData($('form')[0]);
//         formData.append("SttModel", JSON.stringify(SttModel));
//         formData.append("NluOptions", JSON.stringify(NluOptions));

//         error2.style.display = "none";

//         $.ajax({
//             url: '/uploader',
//             type: 'POST',
//             data: formData,
//             dataType: 'json',
//             cache: false,
//             contentType: false,
//             processData: false,
//             success: (response) => {
//                 data = response;
//                 if (data.flag == 1) {
//                     progressMsg.className = "w3-text-green w3-animate-opacity";
//                     progressMsg.innerHTML = "Successfully Uploaded.";
//                     width = 25;
//                     elem.style.width = width + '%';

//                     Convert(file);
//                 } else if (data.flag == 0) {
//                     uploading2.style.display = "none";
//                     progressIndicator.style.display = "none";
//                     error2.style.display = "block";
//                 }
//             },
//             error: () => {
//                 error2.style.display = "block";
//             }
//         });
//     }

// };
