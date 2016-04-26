/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        loading_start();

        document.addEventListener("backbutton", windowSwitchBack, false);

        if (cordova.platformId == 'android') {
            StatusBar.backgroundColorByHexString("#313131");
        }

        window.plugins.phonenumber.get(getPhonenumber);
        function getPhonenumber(phonenumber) {
            localStorage.phonenumber = phonenumber;
            $("#window_reg input[type=phone]").val(phonenumber);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

function log(msg) {
    console.log(msg);
}

/////////////////////////////////////////////////////////////////
function getDisp() {
    var width = $(document).width();
    var height = $(document).height();
    alert(width + "x" + height);
}

window.onload = function() {
    //loading(); /////////////////////////// ON

    // STATICK HEIGHT IN ALL WINDOWS
    $(".window").each(function(){
        var height = $(this).height();
        $(this).css("min-height", height);
    });

    loading_start();

    var win = document.location.hash;
    if (win) {
        win = win.replace("#", "");
        $(".window").hide();
        $("#window_" + win).show();
    }

    if (typeof ymaps == undefined || typeof ymaps == 'undefined') {
        $(".window").fadeOut("fast");
        $("#body").html("<div id='network_error'>Подключитесь к интернету и повторите попытку!</div>");
    }

    // CITY SPOT
    ymaps.ready(function() {
        var geolocation = ymaps.geolocation;
        if (geolocation) {
            localStorage.country = geolocation.country;
            localStorage.region = geolocation.region;
            localStorage.city = geolocation.city;
            $("#window_reg #city").val(geolocation.city);
        }
        else {
            $(".window").fadeOut("fast");
            $("#body").html("<div id='network_error'>Подключитесь к интернету и повторите попытку!</div>");
        }
    });

}

//var server = "http://e-storeme.ru/";
var server = "http://e-storeme.ru/";

var loading_text = [
    "Копируем дизайн Uber...",
    "Доделываем pornocoil...",
    "Настаиваем самозамес...",
    "Отвлекаем вас от загрузки..."
];
var loading_text_select = 3;            // -1 default   // 3 fast

function loading_start() {
    loading_text_select++;
    var string = $("#loading_string");
    var text = loading_text[loading_text_select];

    if (loading_text_select < loading_text.length) {
        setTimeout("loading_start()", 3000);
        string.fadeOut(500, function(){
            string.html(text);
            string.fadeIn(500);
        });
    }
    else {
        string.fadeOut("fast");
        $("#window_loading").fadeOut(800);

        if (localStorage.user_id && localStorage.promo) {
            windowSwitch( $("#window_loading"), $("#window_items"), true );
            itemsCatalog();
        }
        else {
            windowSwitch( $("#window_loading"), $("#window_reg"), false );
        }
    }
}

function windowSwitch( win1, win2, menu ) {
    $(win1).fadeOut("fast", function(){
        $(win2).fadeIn("fast");
        if (menu == true || menu == "true")
        $("#top_menu").fadeIn("fast");
        else $("#top_menu").fadeOut("fast");
    });

    localStorage.window_current = $(win2).attr("id");
    localStorage.window_previous = $(win1).attr("id");
    localStorage.window_menu = menu;
}

function windowSwitchBack() {
    var win1 = localStorage.window_current;
    var win2 = localStorage.window_previous;
    var menu = localStorage.window_menu;

    windowSwitch( $("#"+win1), $("#"+win2), menu );
}

function itemShow(item) {
    var def_height = $(item)[0].scrollHeight;
    var height = $(item).height();
    var new_height = 0;

    switch(height) {
        case 0: {
            new_height = def_height;
            break;
        }
        case def_height: {
            new_height = 0;
        }
    }
    
    $(item).height(new_height);
}

function itemOpen( object ) {
    $("#item_select").fadeIn(100);
    $("#item_select").addClass("selected");
    $("#body").css("overflow", "hidden");
    disableScrolling();

    var id = $(object).parent().data("id");
    var mode = 'items_one';

    $.ajax({
        url: server + "api.php",
        type: "GET",
        dataType: 'jsonp',
        crossDomain: true,
        data: {"mode": mode, "id": id},
        success: function(data) {
            var img = server + "img/items/" + data.img;
            $("#item_select .image img").attr("src", img);
            $("#item_select .about .category").html(data.category.name);
            $("#item_select .about .name").html(data.name);
            $("#item_select .about .price").html(data.price + " руб.");
            $("#item_select .info").html(data.about);
        }
    });
}

function itemsCatalog() {
    var mode = 'items_all';
    $("#window_items .items").html("");

    $.ajax({
        url: server + "api.php",
        type: "GET",
        dataType: 'jsonp',
        crossDomain: true,
        data: {"mode": mode},
        success: function(data) {
            for(var a = 0; a < data.length; a++) {
                var d = data[a];
                var img = server + "img/items/" + d.img;
                $("#window_items .item_box_default").clone().appendTo("#window_items .items");
                var item = $("#window_items .item_box_default:eq(1)");
                item.removeClass("item_box_default");

                /// ADD VALUES
                item.find(".about .text .name").html( d.name );
                item.find(".about .text big").html( d.price + " руб." );
                item.find(".image img").attr("src", img);
                item.find(".about .more").data("id", d.id);
                item.data("cat", d.category.id);

                /// LISTENERS
                item.find(".image").click(function(){
                    itemShow( $(this).parent().find(".about") );
                });
                item.find(".more .button").click(function(){
                    itemOpen( this );
                });
            }
        }
    });
}

function menuOpen( object ) {
    $("#menu .menu_item").removeClass("select");
    $("#menu .menu_subitem").removeClass("select");

    if ($("#item_select").css("display") == "block") {
        $("#item_select .close").click();
    }

    var cat = $(object).data("cat");
    if (cat != undefined) {
        $(".window").hide();
        $("#window_items").show();
        if (cat == 0) {
            $("#window_items .items .item_box").fadeIn("fast");
        }
        else {
            $("#window_items .items .item_box").each(function(){
                var self_cat = $(this).data("cat");
                if (self_cat == cat) {
                    $(this).fadeIn("fast");
                }
                else {
                    $(this).fadeOut("fast");
                }
            })
        }
    }

    $(object).addClass("select");
    setTimeout(function(){ $("#menu_icon").click(); }, 100);
}

    function disableScrolling(){
        var x=window.scrollX;
        var y=window.scrollY;
        window.onscroll=function(){window.scrollTo(x, y);};
        $("#body").css("overflow", "hidden");
    }

    function enableScrolling(){
        window.onscroll=function(){};
        $("#body").css("overflow", "auto");
    }


    function redrawChat() {
        var menu_height = $("#top_menu").css("height");
        $("#window_chat #chat").css("top", menu_height);

        var h_full = $("#window_chat #chat").css("height");
        var h_hello = $("#window_chat #chat #hello").css("height");
        var h_write = $("#window_chat #chat #write").css("height");

        var new_height = parseInt(h_full) - (parseInt(h_hello) + parseInt(h_write)) - 20;
        $("#window_chat #chat #messages").css("height", new_height);

        var scroll = $("#window_chat #chat #messages")[0].scrollHeight;
        $("#window_chat #chat #messages").scrollTop(scroll);
    }



$("#promo_submit_no").click(function(){
    windowSwitch( $("#window_reg_promo"), $("#window_items"), true );
    itemsCatalog();
});

$(".item_box .image").click(function(){
    itemShow( $(this).parent().find(".about") );
});

$("#window_items .item_box .more .button").click(function(){
    itemOpen( this );
});

$("#item_select .close").click(function(){
    $("#item_select").fadeOut(100);
    $("#item_select").removeClass("selected");
    $("#body").css("overflow", "auto");
    enableScrolling();
});

$("#menu .menu_item").click(function(){ menuOpen(this); });
$("#menu .menu_subitem").click(function(){ menuOpen(this); });

$("#menu #menu_chat").click(function(){
    windowSwitch( $(".window"), $("#window_chat"), true );

    setTimeout(function() {
       redrawChat();
    }, 
    500);
});

/*
$("#window_chat #chat input").focus(function(){
    //setTimeout(function(){redrawChat();}, 1000);
    //setTimeout(function(){redrawChat();}, 300);
    redrawChat();
});
$("#window_chat #chat input").blur(function(){
    //setTimeout(function(){redrawChat();}, 1000);
    //setTimeout(function(){redrawChat();}, 300);
    redrawChat();
});
*/

window.onresize = function() {
    if (localStorage.window_current == "window_chat")
        redrawChat();
}

$("#menu_icon").click(function(){ 
    var menu = $("#menu");
    var topmenu = $("#top_menu");
    var newWidth = parseInt(topmenu.find("#menu_icon").css("width")) + parseInt(topmenu.find("#balance").css("width"));
    var open = menu.data("open");
    if (open == "true") {
        menu.data("open", "false");
        menu.css("left", "-75%");
        //topmenu.removeClass("border");
        enableScrolling();
    }
    else {
        menu.data("open", "true");
        menu.css("left", "0px");
        menu.width(newWidth);
        //topmenu.addClass("border");
        disableScrolling();
    }
});

$("#menu_promo").click(function(){
    $("#promocode").html(localStorage.promo);
    windowSwitch( $(".window"), $("#window_promo"), true );
});

$("#menu_paymeny").click(function(){
    //
});

$("#window_reg_promo #submit").click(function(){
    $("#promo_submit_no").click();
});

$("#window_reg #reg_submit").click(function(){
    var mode = 'reg';
    var email = $("#window_reg #email").val();
    var phone = $("#window_reg #phone").val();
    var pass = $("#window_reg #pass").val();
    var city = $("#window_reg #city").val();

    $.ajax({
        url: server + "api.php",
        type: "GET",
        dataType: 'jsonp',
        crossDomain: true,
        data: {"mode": mode, "email": email, "phone": phone, "pass": pass, "city": city},
        success: function(data) {
            console.log(data);
            localStorage.user_id = data.id;
            localStorage.promo = data.promo;
            if (data.success == true)
                windowSwitch( $("#window_reg"), $("#window_reg_promo"), false );
            else alert(data.error);
        }
    });
});


$("#cart_icon").click(function(){
    /*document.location.href = "http://e-storeme.ru/pay.php";
    alert( document.location.href );
    alert( document.location.origin );
    alert( document.location.host );*/
});