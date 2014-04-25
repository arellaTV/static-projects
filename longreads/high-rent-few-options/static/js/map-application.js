(function(){

    window.App = {
        Models: {},
        Collections: {},
        Views: {},
        Router: {}
    };

    window.template = function(id){
        return _.template( $('#' + id).html());
    };

    window.percentifyValue = function(value){
        var value = value * 100
        return parseFloat(value.toFixed(2));
    };

    window.toFixed = function(value){
        var decimal = parseFloat(value);
        return decimal.toFixed(0);
    };

    window.addCommas = function(nStr){
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
            return x1 + x2;
    };

    App.Models.Response = Backbone.Model.extend({});

    App.Models.Map = Backbone.Model.extend({});

    App.Models.Marker = Backbone.Model.extend({});

    App.Collections.Responses = Backbone.Collection.extend({
        model: App.Models.Response,
        parse: function(response){
            return response.results;
        }
    });

    App.Collections.Markers = Backbone.Collection.extend({
        model: App.Models.Marker
    });

    App.Router = Backbone.Router.extend({
        routes: {
            "": "fetchData",
        },
        fetchData: function(){
            var rootUrl = "https://www.publicinsightnetwork.org/air2/api/public/search?a=6f4d503616e1115157a64bd26b51aec7&p=50&";
            var responsesCollection = new App.Collections.Responses();
            var newCollection = new App.Collections.Responses();
            var secondCollection = new App.Collections.Responses();
            var masterCollection = new App.Collections.Responses();
            var _this = this;
            $.when(
                responsesCollection.fetch({
                    url: rootUrl + "q=query_uuid:7345004f6c9f&t=JSON",
                    async: true
                }
            ), newCollection.fetch({
                    url: rootUrl + "q=query_uuid:5b095008373b&t=JSON",
                    async: true
                }
            ), secondCollection.fetch({
                    url: rootUrl + "q=query_uuid:298a682e1a77&t=JSON",
                    async: true
                }
            ))
            .done(function(){
                masterCollection.add(responsesCollection.models);
                masterCollection.add(newCollection.models);
                masterCollection.add(secondCollection.models);
                _this.createMap(masterCollection);
            });
        },
        createMap: function(collection){
            if (this.mapView){
                this.mapView.remove();
            };
            this.mapView = new App.Views.MapApplication({
                collection: collection,
                container: "#content-map-container",
                initialZoom: 6
            });
            return this.mapView;
        }
    });

    App.Views.MapApplication = Backbone.View.extend({
        template: template("map-application-template"),
        el: "#content-map-container",
        initialize: function(mapDataObject){
            this.mapDataObject = mapDataObject;
            window.featcherSentence = template("featcherSentence");
            window.featcherGraphs = template("featcherGraphs");
            this.markerGroup = new L.layerGroup();
            this.stamenToner = new L.tileLayer(
                "http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {
                    attribution: "Map tiles by <a href='http://stamen.com' target='_blank'>Stamen Design</a>, <a href='http://creativecommons.org/licenses/by/3.0' target='_blank'>CC BY 3.0</a> &mdash; Map data &copy; <a href='http://openstreetmap.org' target='_blank'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/' target='_blank'>CC-BY-SA</a>",
                    minZoom: 6,
                    maxZoom: 14
            });
            this.mapQuest = new L.tileLayer(
                "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
                    attribution: "Tiles, data, imagery and map information provided by <a href='http://www.mapquest.com' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>, <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> and OpenStreetMap contributors.",
                    subdomains: ["otile1","otile2","otile3","otile4"]
            });
            this.osm = new L.TileLayer(
                "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    minZoom: 8,
                    maxZoom: 12,
                    attribution: "Map data © <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors"
                }
            );
            if (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
                this.initialZoom = 7;
            } else {
                this.initialZoom = 9;
            }
            this.center = new L.LatLng(34.000304, -118.238039);
            this.geojsonOne = L.geoJson(zipCodeRentOne, {
                filter: this.filterFeatures,
                style: this.styleFeatures,
                onEachFeature: this.onEachFeature
            });
            this.geojsonTwo = L.geoJson(zipCodeRentTwo, {
                filter: this.filterFeatures,
                style: this.styleFeatures,
                onEachFeature: this.onEachFeature
            });
            this.geoJsonLayers = [this.geojsonOne, this.geojsonTwo];
            this.render(this.mapDataObject);
        },

        events: {
            "click a.findMe": "findMe",
            "keyup :input": "addressSearch",
            "click button#submit": "navigate",
            "click button#reset": "resetUserView",
            "change #search-radius": "navigate",
            "click [type='checkbox']": "getCheckboxIds",
        },

        findMe: function(){
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    $("input[id='latitudeSearch']").val(position.coords.latitude);
                    $("input[id='longitudeSearch']").val(position.coords.longitude);
                    $("input[id='accuracySearch']").val(position.coords.accuracy);
                    $("button#submit").trigger("click");
                }, null);
            } else {
                alert("Sorry, we could not find your location.");
            }
        },

        addressSearch: function(e){
            $("input[id='addressSearch']").geocomplete({
                details: "form"
            });
            var latitude = $("input[id='latitudeSearch']").val();
            var longitude = $("input[id='longitudeSearch']").val();
            if(e.keyCode != 13) {
                return false;
            } else if (e.keyCode === 13 && latitude === '' && longitude === '') {
                return false;
            } else {
                this.navigate();
            }
        },

        navigate: function(){
            var latitude = $("input[id='latitudeSearch']").val();
            var longitude = $("input[id='longitudeSearch']").val();
            var accuracy = $("input[id='accuracySearch']").val();
            var searchRadius = $("select[id='search-radius']").val();
            if (latitude === '' && longitude === ''){
                alert('Please enter an address or search by location')
            } else {
                this.addUserLayerToMap(latitude, longitude, accuracy, searchRadius);
            }
        },

        addUserLayerToMap: function(latitude, longitude, accuracy, searchRadius){
            $("#main-controls").hide();
            $("div.reset").show();
            this.userLocationCenter = new L.LatLng(latitude, longitude);
            this.userLocationMarker = L.userMarker([latitude, longitude], {
                pulsing: true,
                smallIcon: true,
                accuracy: accuracy
            });
            this.userRadius = L.circle([latitude, longitude], searchRadius, {
                clickable: false,
                opacity: 0.3,
                weight: 1,
                color: '#000000',
                fillColor: '#ffffff',
                fillOpacity: 0.3
            });
            this.userLayer = new L.layerGroup();
            this.userLayer.addLayer(this.userLocationMarker).addLayer(this.userRadius);
            this.userLayer.addTo(this.map);
            this.map.fitBounds(this.userRadius.getBounds());
            var locationBasedFeature;
            for (var i=0; i<this.geoJsonLayers.length; i++){
                if (leafletPip.pointInLayer([longitude, latitude], this.geoJsonLayers[i]).length != 0){
                    locationBasedFeature = leafletPip.pointInLayer([longitude, latitude], this.geoJsonLayers[i]);
                }
            }
            if (locationBasedFeature != undefined){
                $("#data-point-sentence").html(window.featcherSentence(locationBasedFeature[0].feature.properties));
                $("#data-point-display").html(window.featcherGraphs(locationBasedFeature[0].feature.properties));
                $("#data-point-caveat").html(
                    "<p class='content-map-methodology gt-30pct'>† - Margin of error is at least 10 percent of the total value.</p>"
                );
            } else {
                $("#data-point-sentence").html(
                    "<h2>We couldn't find data for this ZCTA</h2>");
            }
        },

        resetUserView: function(){
            $("select[id='search-radius']").val(
                $("select[id='search-radius']").prop('defaultSelected')
            );
            $("input[id='addressSearch']").val('');
            $("input[id='latitudeSearch']").val('');
            $("input[id='latitudeSearch']").val('');
            $("input[id='longitudeSearch']").val('');
            $("input[id='accuracySearch']").val('');
            $("#main-controls").show();
            $("div.reset").hide();
            $("#data-point-sentence").empty();
            $("#data-point-display").empty();
            $("#data-point-caveat").empty();
            $("input[type='checkbox']").attr('checked', false);
            this.userLayer.clearLayers();
            this.markerGroup.clearLayers();
            this.map.setView(this.center, this.initialZoom);
        },

        filterFeatures: function(feature, layer) {
            if (feature.properties.la_area_rent_rent_total != 0 || feature.properties.la_area_rent_rent_total != null){
                return feature.properties;
            } else {
                return false;
            }
        },

        styleFeatures: function (feature) {
            var layer_color;
            if (feature.properties.la_area_rent_rent_gt30_pct >= 0.50){
                layer_color = '#d94701';
            } else {
                layer_color = '#fdbe85';
            }
            return {
                color: '#000000',
                weight: 0.7,
                opacity: 0.7,
                fillOpacity: 0.6,
                fillColor: layer_color
            }
        },

        onEachFeature: function(feature, layer) {
            layer.on('click', function (e) {
                $("#main-controls").hide();
                $("div.reset").show();
                $("#data-point-sentence").html(window.featcherSentence(feature.properties));
                $("#data-point-display").html(window.featcherGraphs(feature.properties));
                $("#data-point-caveat").html(
                    "<p class='content-map-methodology gt-30pct'>† - Margin of error is at least 10 percent of the total value.</p>"
                );
            });
        },

        render: function(mapDataObject){
            $(mapDataObject.container).html(this.template);
            this.map = L.map("content-map-canvas", {
                scrollWheelZoom: false,
                zoomControl: false,
                minZoom: 6,
                maxZoom: 14
            }).setView(
                this.center, this.initialZoom
            ).addLayer(
                this.stamenToner
            ).addControl(L.control.zoom({
                position: 'topright'
            }));
            mapDataObject.map = this.map;
            this.geojsonOne.addTo(this.map);
            this.geojsonTwo.addTo(this.map);
        },

        getCheckboxIds: function(event){
            var activeCheckboxes = [];
            if (!$("input:checkbox").is(":checked")) {
                $("#pin-query-response").empty();
            }
            $("input:checkbox").each(function(){
                var $this = $(this);
                if($this.is(":checked")){
                    var modelUuid = $this.attr("id").replace("response_", "");
                    activeCheckboxes.push(modelUuid);
                }
            });
            this.findModelsForMarkers(this.mapDataObject.collection, activeCheckboxes);
        },

        findModelsForMarkers: function(collection, arrayIds){
            var markerCollection = new App.Collections.Responses();
            _.each(arrayIds, function(value){
                var models = _.filter(collection.models, function(model){
                    return model.get("query_uuid") === value;
                });
                markerCollection.add(models);
            });
            this.createMarkers(markerCollection.models);
        },

        createMarkers: function(arrayOfModels){
            this.markerGroup.clearLayers();
            for(var i=0; i<arrayOfModels.length; i++){
                this.marker = new L.CircleMarker([arrayOfModels[i].attributes.primary_lat, arrayOfModels[i].attributes.primary_long], {
                    radius: 5,
                    color: null,
                    fillColor: null,
                    fillOpacity: 1.0,
                    opacity: 1.0,
                    weight: 5.0,
                    clickable: true
                });
                if (arrayOfModels[i].attributes.query_uuid === "7345004f6c9f"){
                    this.marker.options.color = "blue";
                    this.marker.options.fillColor = "blue";
                } else if (arrayOfModels[i].attributes.query_uuid === "5b095008373b"){
                    this.marker.options.color = "green";
                    this.marker.options.fillColor = "green";
                } else {
                    this.marker.options.color = "yellow";
                    this.marker.options.fillColor = "yellow";
                }
                this.bindEvent(this.marker, arrayOfModels[i].attributes);
                this.markerGroup.addLayer(this.marker)
            };
            this.markerGroup.addTo(this.map);
        },

        bindEvent: function(marker, attributes){
            var pinResponse = _.template(
                "<p><%= query_title %></p>" +
                "<p><%= src_first_name %> <%= src_last_name %></p>" +
                "<p><%= primary_city %></p>" +
                "<p><%= srs_date %></p>" +
                "<% if (query_uuid === '7345004f6c9f') { %>" +
                    "<% if ('4c46b93b3726' in responses) { %>" +
                        "<p><%= questions['4c46b93b3726'].value %></p>" +
                        "<p><%= responses['4c46b93b3726'] %></p>" +
                    "<% } %>" +
                    "<% if ('7f387f7a9b4e' in responses) { %>" +
                        "<p><%= questions['7f387f7a9b4e'].value %></p>" +
                        "<p><%= responses['7f387f7a9b4e'] %></p>" +
                    "<% } %>" +
                "<% } else if (query_uuid === '5b095008373b') { %>" +
                    "<% if ('2ea153f452bc' in responses) { %>" +
                        "<p><%= questions['2ea153f452bc'].value %></p>" +
                        "<p><%= responses['2ea153f452bc'] %></p>" +
                    "<% } %>" +
                    "<% if ('55fab8159544' in responses) { %>" +
                        "<p><%= questions['55fab8159544'].value %></p>" +
                        "<p><%= responses['55fab8159544'] %></p>" +
                    "<% } %>" +
                    "<% if ('792d693943cf' in responses) { %>" +
                        "<p><%= questions['792d693943cf'].value %></p>" +
                        "<p><%= responses['792d693943cf'] %></p>" +
                    "<% } %>" +
                    "<% if ('63973f53c6cc' in responses) { %>" +
                        "<p><%= questions['63973f53c6cc'].value %></p>" +
                        "<p><%= responses['63973f53c6cc'] %></p>" +
                    "<% } %>" +
                    "<% if ('387096a64b70' in responses) { %>" +
                        "<p><%= questions['387096a64b70'].value %></p>" +
                        "<p><%= responses['387096a64b70'] %></p>" +
                    "<% } %>" +
                    "<% if ('d9d42e42eb76' in responses) { %>" +
                        "<p><%= questions['d9d42e42eb76'].value %></p>" +
                        "<p><%= responses['d9d42e42eb76'] %></p>" +
                    "<% } %>" +
                "<% } else { %>" +
                    "<% if ('3b86b8c62e43' in responses) { %>" +
                        "<p><%= questions['3b86b8c62e43'].value %></p>" +
                        "<p><%= responses['3b86b8c62e43'] %></p>" +
                    "<% } %>" +
                    "<% if ('3bd2512a25bd' in responses) { %>" +
                        "<p><%= questions['3bd2512a25bd'].value %></p>" +
                        "<p><%= responses['3bd2512a25bd'] %></p>" +
                    "<% } %>" +
                    "<% if ('6e24247d32a4' in responses) { %>" +
                        "<p><%= questions['6e24247d32a4'].value %></p>" +
                        "<p><%= responses['6e24247d32a4'] %></p>" +
                    "<% } %>" +
                    "<% if ('39bdb1593a35' in responses) { %>" +
                        "<p><%= questions['39bdb1593a35'].value %></p>" +
                        "<p><%= responses['39bdb1593a35'] %></p>" +
                    "<% } %>" +
                    "<% if ('62c382104585' in responses) { %>" +
                        "<p><%= questions['62c382104585'].value %></p>" +
                        "<p><%= responses['62c382104585'] %></p>" +
                    "<% } %>" +
                    "<% if ('354a2b621737' in responses) { %>" +
                        "<p><%= questions['354a2b621737'].value %></p>" +
                        "<p><%= responses['354a2b621737'] %></p>" +
                    "<% } %>" +
                    "<% if ('1812d821f23c' in responses) { %>" +
                        "<p><%= questions['1812d821f23c'].value %></p>" +
                        "<p><%= responses['1812d821f23c'] %></p>" +
                    "<% } %>" +
                    "<% if ('6857315751a4' in responses) { %>" +
                        "<p><%= questions['6857315751a4'].value %></p>" +
                        "<p><%= responses['6857315751a4'] %></p>" +
                    "<% } %>" +
                "<% } %>", attributes);

            marker.on('click', function(){
                $("#data-point-sentence").empty();
                $("#data-point-display").empty();
                $("#data-point-caveat").empty();
                $("#pin-query-response").html(pinResponse);
            });
        }
    });

    new App.Router;
    Backbone.history.start({
        root: "http://localhost:8880/2kpcc/static-projects/longreads/high-rent-few-options",
        pushState: false,
    });
})();