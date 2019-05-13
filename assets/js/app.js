const BYTEBIN_URL = "https://bytebin.lucko.me/";
let type;

function determineType(typeName) {
    return {
        "sampler": {
            shorthandKeys: {
                c: "children",
                t: "totalTime",
                cl: "className",
                m: "methodName",
                ln: "parentLineNumber"
            },

            load: function(data) {
                $.getScript("assets/js/types/sampler.js", function() {
                    loadSampleData(data);
                });
            }
        },
        "heap": {
            shorthandKeys: {
                "#": "order",
                i: "instances",
                s: "size",
                t: "type"
            },

            load: function(data) {
                $.getScript("assets/js/types/heap.js", function() {
                    loadHeapData(data);
                });
            }
        },
        "monitoring": {
            load: function(data) {
                $('<link>')
                    .appendTo('head')
                    .attr({rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.15.6/metricsgraphics.min.css', integrity: 'sha256-H83YjkVzXEyHSdZ/5aVRoW2QfqeJ7gIWduA7aCy9tWY=', crossorigin: 'anonymous'});

                $.getScript("https://cdnjs.cloudflare.com/ajax/libs/d3/5.9.2/d3.min.js", function() {
                    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.15.6/metricsgraphics.min.js", function() {
                        $.getScript("assets/js/types/monitoring.js", function() {
                            loadMonitoringData(data);
                        });
                    });
                });
            }
        }
    }[typeName];
}

function createRemappingFunction(newKeys) {
    return function(key, value) {
        if (typeof value === "object" && !Array.isArray(value)) {
            const keyValues = Object.keys(value).map(key => {
                const newKey = newKeys[key] || key;
                return { [newKey]: value[key] };
            });
            return Object.assign({}, ...keyValues);
        }
        return value;
    }
}

// try to load the page from the url parameters when the page loads
function loadContent() {
    let params = document.location.search || window.location.hash;
    if (params) {
        if (params.startsWith("?") || params.startsWith("#")) {
            params = params.substring(1);
        }

        $("#intro").hide();
        const $loading = $("#loading");
        $loading.show().html("Loading data; please wait...");

        // get data
        const url = BYTEBIN_URL + params;
        console.log("Loading from URL: " + url);

        $.ajax({
            dataType: "text",
            url: url,
            success: function(raw) {
                $loading.html("Rendering data; please wait...");
                // we have to parse the data twice, first without any remapping to determine the type,
                // and then again with remapping, once we know which rules to use.
                let data = JSON.parse(raw);
                type = determineType(data["type"] || "sampler");
                if (type.shorthandKeys) {
                    data = JSON.parse(raw, createRemappingFunction(type.shorthandKeys));
                }
                type.load(data);
            }
        }).fail(showLoadingError);
    }
}

function showLoadingError() {
    $("#loading").html("An error occurred whilst loading. Perhaps the data has expired?");
}

function escapeHtml(text) {
    return text.replace(/[\"&'\/<>]/g, function(a) {
        return {
            '"': '&quot;',
            '&': '&amp;',
            "'": '&#39;',
            '/': '&#47;',
            '<': '&lt;',
            '>': '&gt;'
        }[a];
    });
}

// Do things when page has loaded
$(loadContent);
