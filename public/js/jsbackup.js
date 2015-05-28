// Delete visuals by click
$('#allVisuals_tr').unbind("click").on('click', 'span', function (e) {
    if (e.target.getAttribute("btn_type") == "deleteVisual") {
        var deleteVisual = {
            id_1: e.target.getAttribute("id_1"),
            id_n: e.target.getAttribute("id_n")
        }
        socket.removeAllListeners();
        socket.emit('delete', deleteVisual);
        socket.on('delete', function (msg) {
            if (msg == "ready") {
                $('#' + e.target.parentNode.id).fadeOut("slow"); // get the ID of the surrounding container element and
                                                                 // delete it
            }
        });
    }
    else if (e.target.getAttribute("btn_type") == "linkVisual") {

        var container_nr = e.target.getAttribute("container_nr");
        var container = document.getElementById("container" + container_nr);
        var linkpanel = document.createElement("div");
        container.appendChild(linkpanel);
        linkpanel.setAttribute("id", "linkpanel_" + container_nr);
        linkpanel.setAttribute("class", "linkpanel");
        linkpanel.innerHTML = "Linkpanel";
        var linkdropdown = document.createElement("select");
        linkpanel.appendChild(linkdropdown);
        linkdropdown.setAttribute("id", "linkdropdown_" + container_nr);



        loadDropdown(linkdropdown, "sweets.json");

        linkdropdown.onchange = function () {
            var selectedItem = $(this).val();             // Text des gewählten Dropdownitems lesen
            $.getJSON("../json/sweets.json", function (data) {        // JSON-Datei laden (RDBMS: FROM sweets)
                $.each(data, function () {       // Für jeden Datensatz.. (RDBMS: Für jede Zeile)
                    if (this.description == selectedItem) {


                        alert("ahoi: " + this.sweets_id);



                        socket.removeAllListeners();
                        var deleteVisual = {
                            id_1: this.sweets_id,
                            id_n: e.target.getAttribute("id_n")
                        }
                        socket.emit('deleteVisual', update);
                        socket.on('deleteVisual', function (msg) {
                            console.log("ahoi: ");
                        });



                    }

                });
            });
        }
    )
        ;
    }
});