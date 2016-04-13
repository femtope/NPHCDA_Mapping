var xfunction = '', nmis_malaria = '', nmis_antenatal = '', nmis_c_section = '', nmis_child_health = '', nmis_family_planning ='', nmis_maternal_health = '', nmis_vaccines = '', nmis_emergency = '',
    geoData = null,
    dataLayer = null,
    markerGroup = null,
    stateData = null,
    stateLayer, lgaLayer,
    lgaLabels = [],
    showLga = false

var map = L.map('map', {
    center: [10, 8],
    zoom: 8,
    zoomControl: false,
    minZoom: 6
        /*,
        crs: L.CRS.EPSG4326*/
        //layers:[stateLayer]
});


map.fitBounds([
    [2.668432, 4.277144], [14.680073, 13.892007]
])

map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})

/*L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    id: 'mapbox.streets'
}).addTo(map);*/

L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}',{
    maxZoom: 18
}).addTo(map);

/*L.tileLayer('https://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=61YWYROufLu_f8ylE0vn0Q&app_id=qIWDkliFCtLntLma2e6O', {
  maxZoom: 15,
  attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
}).addTo(map);*/


/*L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);*/

new L.Control.Zoom({
    position: 'topright'
}).addTo(map);

L.control.scale({
    position: 'bottomright',
    maxWidth: 150,
    metric: true,
    updateWhenIdle: true
}).addTo(map);

function adjustLayerbyZoom(zoomLevel) {

    if (zoomLevel > 8) {
        if (!showLga) {
            map.addLayer(lgaLayer)
                //Add labels to the LGAs
            for (var i = 0; i < lgaLabels.length; i++) {
                lgaLabels[i].addTo(map)
            }
            showLga = true
        }
    } else {
        map.removeLayer(lgaLayer)
        for (var i = 0; i < lgaLabels.length; i++) {
            map.removeLayer(lgaLabels[i])
        }

        showLga = false
    }
}

function triggerUiUpdate() {
    //scope = $('#projectScope').val()
    var query = buildQuery(xfunction, nmis_malaria, nmis_antenatal, nmis_c_section, nmis_child_health, nmis_family_planning, nmis_maternal_health, nmis_vaccines, nmis_emergency)
    console.log("Query in Trigger: ", query)
    getData(query)
}



function buildQuery(xfunction, nmis_malaria, nmis_antenatal, nmis_c_section, nmis_child_health, nmis_family_planning, nmis_maternal_health, nmis_vaccines, nmis_emergency) {
    var needsAnd = false;
    query = 'http://ehealthafrica.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM health_facilities_child_health';
    if (nmis_malaria != null || nmis_antenatal!= null || nmis_c_section!= null || nmis_child_health!= null || nmis_family_planning!= null || nmis_maternal_health!= null || nmis_vaccines!= null || nmis_emergency != null ){
      query = query.concat(" WHERE")

      if(xfunction == ''){
        query = query.concat(" function != ''")
        needsAnd = true
      }

      if (nmis_malaria.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_malaria = '".concat(nmis_malaria.concat("'"))) :  query.concat(" nmis_malaria = '".concat(nmis_malaria.concat("'")))
        needsAnd = true
      }


      if (nmis_antenatal.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_antenatal = '".concat(nmis_antenatal.concat("'"))) :  query.concat(" nmis_antenatal = '".concat(nmis_antenatal.concat("'")))
        needsAnd = true
      }


      if (nmis_c_section.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_c_section = '".concat(nmis_c_section.concat("'"))) :  query.concat(" nmis_c_section = '".concat(nmis_c_section.concat("'")))
        needsAnd = true
      }

      if (nmis_child_health.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_child_health = '".concat(nmis_child_health.concat("'"))) :  query.concat(" nmis_child_health = '".concat(nmis_child_health.concat("'")))
        needsAnd = true
      }

      if (nmis_family_planning.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_family_planning = '".concat(nmis_family_planning.concat("'"))) :  query.concat(" nmis_family_planning = '".concat(nmis_family_planning.concat("'")))
        needsAnd = true
      }


      if (nmis_maternal_health.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_maternal_health = '".concat(nmis_maternal_health.concat("'"))) :  query.concat(" nmis_maternal_health = '".concat(nmis_maternal_health.concat("'")))
        needsAnd = true
      }

      if (nmis_vaccines.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_vaccines = '".concat(nmis_vaccines.concat("'"))) :  query.concat(" nmis_vaccines = '".concat(nmis_vaccines.concat("'")))
        needsAnd = true
      }

       if (nmis_emergency.length > 0) {
        query = needsAnd  ? query.concat(" AND nmis_emergency = ".concat(nmis_emergency)) :  query.concat(" nmis_emergency = ".concat(nmis_emergency))
        needsAnd = true
      }

  }

    return query;
}


//TODO: fix the issue of lga layer not reoving after data filtering
function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)
/*

    var _radius = 10
    var _outColor = "#fff"
    var _weight = 1
    var _opacity = 1
    var _fillOpacity = 0.5*/

    var markerHealth = L.icon({
        iconUrl: "resources/H1.png",
        iconSize: [20, 20],
        iconAnchor: [25, 25]
    });


    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        //console.log("geoData", geoData)
    dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, {icon: markerHealth})
                //markerGroup.addLayer(marker);
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                //layer.bindPopup(buildPopupContent(feature));
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.addLayer(markerGroup);

}

function addAdminLayersToMap(layers) {
    var layerStyles = {
            'state': {
                "clickable": true,
                "color": '#B81609',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.5,
                "fillOpacity": 0.1
            },
            'lga': {
                "clickable": true,
                "color": '#244B54',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.4,
                "fillOpacity": 0.1
            }
        }

    stateLayer = L.geoJson(layers['state'], {
        style: layerStyles['state']
    }).addTo(map)
    lgaLayer = L.geoJson(layers['lga'], {
        style: layerStyles['lga'],
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'label-icon',
                html: feature.properties.LGAName
            })
            lgaLabels.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }))
                //layer.bindPopup(feature.properties.LGAName)
        }
    })
}



function displayInfo(feature) {
    //console.log('displaying info..')
    var infoContent = buildPopupContent(feature)
        //console.log("info", infoContent)
    $('#infoContent').html(infoContent)
}

function normalizeName(source) {
    source = source.replace("_", " ").replace("_", " ").replace('of_', ' of ')
    source = source.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return source
}

function buildPopupContent(feature) {
    var subcontent = ''
    var propertyNames = ['primary_name', 'state_name', 'lga_name', 'ward_name', 'nmis_malaria', 'nmis_antenatal', 'nmis_c_section', 'nmis_child_health', 'nmis_family_planning', 'nmis_maternal_health', 'nmis_vaccines', 'nmis_emergency']
    for (var i = 0; i < propertyNames.length; i++) {
        subcontent = subcontent.concat('<p><strong>' + normalizeName(propertyNames[i]) + ': </strong>' + feature.properties[propertyNames[i]] + '</p>')

    }
    return subcontent;
}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
    showLoader()
    var adminLayers = {}
    $.get('resources/state_boundary.geojson', function (stateData) {
        //add admin layers to map
        adminLayers['state'] = JSON.parse(stateData)
        $.get('resources/lga_boundary.geojson', function (lgaData) {
            adminLayers['lga'] = JSON.parse(lgaData)
                //return the layers
            addAdminLayersToMap(adminLayers)
        }).fail(function () {
            logError(null)
        })
    }).fail(function () {
        logError(null) //TODO: Fix this terrible code
    })
}

function logError(error) {
    console.log("error!")
}

function getCheckBoxValue() {

    if(document.getElementById("Malaria").checked)
      nmis_malaria = 'Yes';
    else
      nmis_malaria = ''

    if(document.getElementById("Family Planning").checked)
      nmis_family_planning = 'Yes';
    else
      nmis_family_planning = ''

    if(document.getElementById("Antenatal").checked)
      nmis_antenatal = 'Yes';
    else
      nmis_antenatal = ''

    if(document.getElementById("Caesarean Section").checked)
      nmis_c_section = 'Yes';
    else
      nmis_c_section = ''

    if(document.getElementById("Child Health").checked)
      nmis_child_health = 'Yes';
    else
      nmis_child_health = ''

    if(document.getElementById("Maternal Health").checked)
      nmis_maternal_health = 'Yes';
    else
      nmis_maternal_health = ''

    if(document.getElementById("Immunization").checked)
      nmis_vaccines = 'Yes';
    else
      nmis_vaccines = ''

    if(document.getElementById("Emergency").checked)
      nmis_emergency = 'true';
    else
      nmis_emergency = ''
}

getAdminLayers()
triggerUiUpdate()
