function createElementWithAttrs(tag, attrs) {
    var el = document.createElement(tag);
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
    return el;
}

function getPopupText(el) {
    var popup_text = `<p><strong>Tag:</strong>: ${el.tagName}</p>`;
    Array.from(el.attributes).forEach(attr => {
        popup_text += `<p><strong>${attr.nodeName}</strong>: ${attr.nodeValue}</p>`;
    });
    // popup_text += `<details><summary>Element HTML</summary><pre>${encodeHTML(el.outerHTML.replace(/\t/g, ""))}</pre></details>`;

    var context = document.getElementById(el.getAttribute("contextRef"))
    if (context) {
        popup_text += `<hr />`;
        Array.from(context.getElementsByTagName("xbrli:period")).forEach(function (period) {
            Array.from(period.getElementsByTagName("xbrli:startDate")).forEach(function (innerElement) {
                popup_text += `<p><strong>Context - period - startDate</strong>: ${innerElement.textContent}</p>`;
            });
            Array.from(period.getElementsByTagName("xbrli:endDate")).forEach(function (innerElement) {
                popup_text += `<p><strong>Context - period - endDate</strong>: ${innerElement.textContent}</p>`;
            });
            Array.from(period.getElementsByTagName("xbrli:instant")).forEach(function (innerElement) {
                popup_text += `<p><strong>Context - period - instant</strong>: ${innerElement.textContent}</p>`;
            });
        });

        Array.from(context.getElementsByTagName("xbrli:identifier")).forEach(function (innerElement) {
            popup_text += `<p><strong>Context - entity - identifer</strong>: ${innerElement.textContent}</p>`;
        });
        Array.from(context.getElementsByTagName("xbrldi:explicitMember")).forEach(function (innerElement) {
            popup_text += `<p><strong>Context - entity - segment - [${innerElement.getAttribute("dimension")}]</strong>: ${innerElement.textContent}</p>`;
        });
        // popup_text += `<details><summary>Context Element HTML</summary><pre>${encodeHTML(context.outerHTML.replace(/\t/g, ""))}</pre></details>`;
    }
    var unit = document.getElementById(el.getAttribute("unitRef"));
    if (unit) {
        popup_text += `<hr />`;
        popup_text += `<p><strong>Unit</strong>: ${unit.textContent}</p>`;
        // popup_text += `<details><summary>Unit Element HTML</summary><pre>${encodeHTML(unit.outerHTML.replace(/\t/g, ""))}</pre></details>`;
    }
    if (el.textContent) {
        var value = el.textContent;
        // strip out all whitespace
        value = encodeHTML(value.replace(/\s+/g, ' ').trim());
        if (value.length > 255) {
            value = value.substring(0, 255) + "...";
        }
        popup_text += `<hr />`;
        popup_text += `<p><strong>Value</strong>: ${value}</p>`;
    }
    return popup_text;
}

var styles = createElementWithAttrs("link", {
    rel: "stylesheet",
    type: "text/css",
    href: "/highlights.css"
});
document.head.appendChild(styles);

function encodeHTML(s) {
    return s.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}

var popup = createElementWithAttrs("div", {
    class: "popup"
});
popup.style.display = "none";
document.body.appendChild(popup);

var counts = {};
var hidden_counts = {};
var contextRefs = [];
document.querySelectorAll("nonNumeric, nonFraction, nonnumeric, nonfraction, context, unit, ix\\:nonFraction, ix\\:nonNumeric, ix\\:context, ix\\:unit").forEach(function (el) {
    var tag = el.tagName;
    console.log(tag);
    if (!counts[tag]) {
        counts[tag] = 0;
        hidden_counts[tag] = 0;
    }
    counts[tag] += 1;
    if (el.getClientRects().length == 0) {
        hidden_counts[tag] += 1;
    }

    if (el.hasAttribute("contextRef")) {
        contextRefs.push(el.getAttribute("contextRef"));
    }

    if (tag.toLowerCase().endsWith("nonfraction")) {
        el.classList.add("nonfraction");
    }

    if (tag.toLowerCase().endsWith("nonnumeric")) {
        el.classList.add("nonnumeric");
    }

    // add popup when hovering over element
    el.addEventListener("mousemove", function (event) {
        popup.innerHTML = getPopupText(el);
        popup.style.display = "block";
        popup.style.left = (event.pageX + 20) + "px";
        popup.style.top = (event.pageY + 0) + "px";

        // hide popup when mouse leaves element
        el.addEventListener("mouseleave", function (event) {
            popup.style.display = "none";
        });
    });
});


var bottomPanelWrapper = createElementWithAttrs("div", {
    class: "bottomPanelWrapper"
});
var bottomPanel = createElementWithAttrs("div", {
    class: "bottomPanel"
});
var bottomPanelRow1 = createElementWithAttrs("div", {
    class: "bottomPanelRow"
});

var highlightLabel = createElementWithAttrs("label", {
});
highlightLabel.innerHTML = "Highlight elements: ";
var highlightOnOff = createElementWithAttrs("input", {
    type: "checkbox",
    checked: "checked",
});
highlightOnOff.addEventListener("change", function (event) {
    document.body.classList.toggle("highlight");
});
highlightLabel.appendChild(highlightOnOff);
bottomPanelRow1.appendChild(highlightLabel);

var schema = document.getElementsByTagName("link:schemaRef")[0].getAttribute("xlink:href");
var schemaLink = createElementWithAttrs("p", {});
schemaLink.innerHTML = `<strong>Schema</strong>: ${schema}`;
bottomPanelRow1.appendChild(schemaLink);

var bottomPanelRow2 = createElementWithAttrs("div", {
    class: "bottomPanelRow"
});

Object.keys(counts).toSorted().forEach(function (key) {
    var tagCount = createElementWithAttrs("p", {});
    tagCount.innerHTML = `<strong>${key}</strong>: ${counts[key]} elements`;
    if (hidden_counts[key] > 0) {
        tagCount.innerHTML += ` (${hidden_counts[key]} hidden)`;
    }
    key.split(":").forEach(function (part) {
        tagCount.classList.add(part);
    });
    bottomPanelRow2.appendChild(tagCount);
});

var namespaces = Array.from(document.documentElement.attributes).filter(function (attr) {
    return attr.name.startsWith("xmlns:");
}).reduce((a, attr) => ({ ...a, [attr.name.split(":").at(-1)]: attr.value }), {});
var nsCount = createElementWithAttrs("p", {});
nsCount.innerHTML = `<strong>Namespaces</strong>: ${Object.keys(namespaces).length} namespaces`;
bottomPanelRow1.appendChild(nsCount);

// var contextRefSelect = createElementWithAttrs("select", {});
// contextRefSelect.addEventListener("change", function (event) {
//     var contextRef = event.target.value;
//     document.querySelectorAll(`[contextRef="${contextRef}"]`).forEach(function (el) {
//         el.classList.toggle("highlight");
//     });
// });
// var contextRefOption = createElementWithAttrs("option", {});
// contextRefOption.innerHTML = `Select context`;


bottomPanel.appendChild(bottomPanelRow2);
bottomPanel.appendChild(bottomPanelRow1);
bottomPanelWrapper.appendChild(bottomPanel);
document.body.appendChild(bottomPanelWrapper);
document.body.classList.add("highlight");

console.log("highlight.js loaded")