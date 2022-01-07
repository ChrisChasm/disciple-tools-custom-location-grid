(function() {
  "use strict";
  jQuery(document).ready(function() {

    // expand the current selected menu
    jQuery('#metrics-sidemenu').foundation('down', jQuery(`#${window.wp_js_object.base_slug}-menu`));

    window.load_map()

  })

  window.load_map = () => {
    let content = jQuery('#chart')
    content.empty().html(`
    <div id="custom-style"></div>
    <div id="map-wrapper">
        <div id='map'></div>
        <div id="map-legend"><div class="icon-wrapper"><div class="icon icon-blue"></div> Contacts </div><div class="icon-wrapper"><div class="icon icon-green"></div> Trainings</div><div class="icon-wrapper"><div class="icon icon-red"></div> Groups  </div><span id="local-map-spinner" class="loading-spinner"></span></div>
    </div>
  `)
    let spinner = jQuery('.loading-spinner')

    // /* LOAD */

    /* set vertical size the form column*/
    jQuery('#custom-style').append(`
      <style>
          #wrapper {
              height: ${window.innerHeight}px !important;
          }
          #map-wrapper {
              height: ${window.innerHeight-100}px !important;
          }
          #map {
              height: ${window.innerHeight-100}px !important;
          }
          #map-legend {
              position:absolute;
              z-index: 10;
              border-radius: 5px;
              background-color: white;
              padding: 1rem;
              left: 10px;
              top: 10px;
              display:inline-block;
          }
          .icon {
            border-radius: 50%;
            border: 1px solid black;
            width: 1rem;
            height: 1rem;
            margin: 0 auto;
          }
          .icon-blue {
            background: #0000FF;
          }
          .icon-green {
            background: #006000;
          }
          .icon-red {
            background: #D60000;
          }
          .icon-wrapper {
            float:left;
            margin-left: 10px;
          }
      </style>`)

    window.get_geojson().then(function(data){

      mapboxgl.accessToken = window.wp_js_object.map_key;
      var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-104.90139438833012, 39.76006690974131],
        minZoom: 0,
        zoom: 10.824496558600584
      });

      // disable map rotation using right click + drag
      map.dragRotate.disable();

      // disable map rotation using touch rotation gesture
      map.touchZoomRotate.disableRotation();

      window.current_map = map

      map.on('load', function() {

        jQuery.getJSON(window.wp_js_object.custom_geojson, function (custom_geojson) {
          console.log(custom_geojson)
          map.addSource('custom_borders', {
            type: 'geojson',
            data: custom_geojson
          });
          map.addLayer({
            'id': 'custom_borders_outline',
            'type': 'line',
            'source': 'custom_borders',
            'layout': {},
            'paint': {
              'line-color': '#000',
              'line-width': 3
            }
          });
          map.addLayer({
            'id': 'custom_borders_fill',
            'type': 'fill',
            'source': 'custom_borders',
            'paint': {
              'fill-color': 'rgba(200, 100, 240, 0)',
              'fill-outline-color': 'rgba(0, 0,0, 1)'
            }
          });

          var bounds = new mapboxgl.LngLatBounds();
          var ne = new mapboxgl.LngLat(-104.57042233716099,39.95746554053494)
          bounds.extend(ne)
          var sw = new mapboxgl.LngLat(-105.16478198933403,39.54324994976875)
          bounds.extend(sw)
          map.fitBounds(bounds, { padding: {top: 20, bottom:20, left: 20, right: 20 } });

          map.on('click', 'custom_borders_fill', (e) => {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(e.features[0].properties.name)
              .addTo(map);
          });
          map.on('mouseenter', 'custom_borders_fill', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'custom_borders_fill', () => {
            map.getCanvas().style.cursor = '';
          });
        });

        jQuery.getJSON(window.wp_js_object.custom_points_geojson, function (custom_points_geojson) {
          console.log(custom_points_geojson)
          map.addSource('custom_points_geojson', {
            type: 'geojson',
            data: custom_points_geojson
          });
          map.addLayer({
            'id': 'points',
            'type': 'symbol',
            'source': 'custom_points_geojson',
            "minzoom": 11,
            'layout': {
              'icon-image': 'custom-marker',
              'text-field': ['get', 'name'],
              'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
              ],
              'text-anchor': 'top',
              "text-size": {
                "stops": [
                  [0, 0],
                  [11, 10],
                  [12, 16],
                  [14, 22]
                ]
              }
            }
          });
        });

        map.addSource('layer-source-contacts', {
          type: 'geojson',
          data: data.contacts,
        });
        map.addLayer({
          id: 'layer-source-contacts-layer',
          type: 'circle',
          source: 'layer-source-contacts',
          paint: {
            'circle-color': '#0000FF',
            'circle-radius':12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        map.addSource('layer-source-trainings', {
          type: 'geojson',
          data: data.trainings,
        });
        map.addLayer({
          id: 'layer-source-trainings-layer',
          type: 'circle',
          source: 'layer-source-trainings',
          paint: {
            'circle-color': '#006000',
            'circle-radius':12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        map.addSource('layer-source-groups', {
          type: 'geojson',
          data: data.groups,
        });
        map.addLayer({
          id: 'layer-source-groups-layer',
          type: 'circle',
          source: 'layer-source-groups',
          paint: {
            'circle-color': '#D60000',
            'circle-radius':12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        spinner.removeClass('active')

      });
    })
  }

  window.get_geojson = () => {
    let localizedObject = window.wp_js_object // change this object to the one named in ui-menu-and-enqueue.php
    jQuery('#local-map-spinner').addClass("active")
    return jQuery.ajax({
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      url: `${localizedObject.rest_endpoints_base}/geojson`,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-WP-Nonce', localizedObject.nonce);
      },
    })
      .fail(function (err) {
        jQuery('#local-map-spinner').removeClass("active")
        button.empty().append("error. Something went wrong")
        console.log("error");
        console.log(err);
      })
  }

})();
