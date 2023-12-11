const SCRIPT_TAG = `
<script type="text/javascript" src="highlights.js" defer=""></script>
<link rel="stylesheet" type="text/css" href="highlights.css"></link>
`;
document.addEventListener("DOMContentLoaded", function () {
    var iframe = document.getElementById('iframe');

    document.getElementById('file').addEventListener('change', function (fileEvent) {
        var file = fileEvent.target.files[0];
        var fr = new FileReader();
        fr.onload = function () {
            var text = fr.result.replace('</head>', SCRIPT_TAG + '</head>');
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(text);
            iframe.contentWindow.document.close();
        }
        fr.readAsText(file);
    });

    iframe.addEventListener('load', function (event) {
        iframe.contentWindow.document.querySelectorAll("ix\\:nonFraction").forEach(function (el) {
            console.log(el);
        });
    });
});