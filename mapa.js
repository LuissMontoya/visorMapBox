
/* Variable para guardar el token de usuario de Mapbox */
mapboxgl.accessToken = 'pk.eyJ1IjoianVsaWFuLWF6YW5nZSIsImEiOiJja3VleGFnMnIwazhjMnVwaHVwcW1odjQxIn0.K38cvNw0fGI5B3oPZ_fYSg'; // Token generado por mapbox

var map = new mapboxgl.Map({
	container: 'map', // id map del html
	style: 'mapbox://styles/mapbox/navigation-night-v1', // estilos del mapa en mapbox
	center: [-74.082412, 4.639386], // ubicacion del mapa apenas se inicie en el visor
	zoom: 5,
	preserveDrawingBuffer: true,
	attributionControl: false
});

/* Funciones de Mapbox - checkbox */
document
	.getElementById('listing-group')
	.addEventListener('change', function (e) {
		var handler = e.target.id;
		if (e.target.checked) {
			map[handler].enable();
		} else {
			map[handler].disable();
		}
	});

/* Se definen algunos lugares para representarlos e identificarlos */
var customData = {
	'features': [
		{
			'type': 'Feature',
			'properties': {
				'title': 'Universidad de la Amazonia'
			},
			'geometry': {
				'coordinates': [-75.6042556026793, 1.6203629388443823],
				'type': 'Point'
			}
		},
	],
	'type': 'FeatureCollection'
};

function forwardGeocoder(query) {
	var matchingFeatures = [];
	for (var i = 0; i < customData.features.length; i++) {
		var feature = customData.features[i];
		if (
			feature.properties.title
				.toLowerCase()
				.search(query.toLowerCase()) !== -1
		) {
			feature['place_name'] = '🎓' + feature.properties.title;
			feature['center'] = feature.geometry.coordinates;
			feature['place_type'] = ['university'];
			matchingFeatures.push(feature);
		}
	}
	return matchingFeatures;
}

/* Agregar el control del mapa, Buscador */
map.addControl(
	new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		localGeocoder: forwardGeocoder,
		zoom: 2,
		placeholder: '       Buscar lugar',
		mapboxgl: mapboxgl
	}),
	"top-left" //posicion en el visor
);


/* Agregar rutas */
map.addControl(
	new MapboxDirections({
		accessToken: mapboxgl.accessToken,
		language: "es",
		alternatives: true,
	}),
	"top-right" //posicion en el visor
);

/* Agregar barra de zoom */
map.addControl(
	new mapboxgl.NavigationControl(),
	"bottom-right" //posicion en el visor
);

/* Full Screen */
map.addControl(new mapboxgl.FullscreenControl(),
	"bottom-right"
);


/* Agregar Edificios en 3D */
map.on("load", () => {

	const layers = map.getStyle().layers;
	const labelLayerId = layers.find(
		(layer) => layer.type === "symbol" && layer.layout["text-field"]
	).id;

	map.addLayer(
		{
			id: "add-3d-buildings",
			source: "composite",
			"source-layer": "building",
			filter: ["==", "extrude", "true"],
			type: "fill-extrusion",
			minzoom: 15,
			paint: {
				"fill-extrusion-color": "#aaa",
				"fill-extrusion-height": [
					"interpolate",
					["linear"],
					["zoom"],
					15,
					0,
					15.05,
					["get", "height"],
				],
				"fill-extrusion-base": [
					"interpolate",
					["linear"],
					["zoom"],
					15,
					0,
					15.05,
					["get", "min_height"],
				],
				"fill-extrusion-opacity": 0.6,
			},
		},
		labelLayerId
	);
});


/* Color de edificios segun el zoom */
map.on('load', () => {
	map.setPaintProperty('building', 'fill-color', [
		'interpolate',
		['exponential', 0.5],
		['zoom'],
		15,
		'#D9D3C9',
		18,
		'#007EFF'
	]);

	map.setPaintProperty('building', 'fill-opacity', [
		'interpolate',
		['exponential', 0.5],
		['zoom'],
		10,
		0.5,
		18,
		1
	]);
});


/* Control para la geolocalizacion del usuario */
map.addControl(new mapboxgl.GeolocateControl({
	positionOptions: {
		enableHighAccuracy: true
	},
	trackUserLocation: true,
}), "bottom-right");

/* ------------------------------------------------------------------------ */
/* CAPA GEOJSON */

/* Capa geojson Paises */
map.on('load', function () {
	map.addSource("Paises", {
		type: "vector",
		url: "mapbox://julian-azange.27a4hx04"
	}); //fin map source

	map.addLayer({
		id: "paises",
		type: "line",
		source: "Paises",
		'source-layer': "paises-0q2teq",
		paint: {
			'line-color': "#00ff00",
			"line-width": 2
		}
	});
});

/* Capa geojson Hidrografia */
map.on('load', function () {
	map.addSource("Hidrografia", {
		type: "vector",
		url: "mapbox://julian-azange.1sbg4kj1"
	}); //fin map source

	map.addLayer({
		id: "hidrografia",
		type: "line",
		source: "Hidrografia",
		'source-layer': "hidrografiaMundo-b3i90q",
		paint: {
			'line-color': "#06B4E7",
			"line-width": 2
		},
		layout: {
			// Make the layer visible by default.
			'visibility': 'visible',
			'line-join': 'round',
			'line-cap': 'round'
		},
	});
});

/* Capa geojson Nomenclatura Vial */
map.on('load', function () {
	map.addSource("nomenclaturaVial", {
		type: "vector",
		url: "mapbox://julian-azange.8is5xpnu"
	}); //fin map source

	map.addLayer({
		id: "nomenclaturaVial",
		type: "line",
		source: "nomenclaturaVial",
		'source-layer': "nomenclaturaVial-12mwmk",
		paint: {
			'line-color': "#FAFA0C",
			"line-width": 1
		},
		layout: {
			// Make the layer visible by default.
			'visibility': 'visible',
			'line-join': 'round',
			'line-cap': 'round'
		},
	});
});


/* Control de estilos de capa base */
const layerList = document.getElementById('menu2');
const inputs = layerList.getElementsByTagName('input');

for (const input of inputs) {
	input.onclick = (layer) => {
		const layerId = layer.target.id;
		map.setStyle('mapbox://styles/mapbox/' + layerId);
	};
}


/* Control de color de capas */
const swatches = document.getElementById('swatches');
const layer = document.getElementById('layer');
const colors = [
	'#ffffcc',
	'#a1dab4',
	'#41b6c4',
	'#2c7fb8',
	'#253494',
	'#fed976',
	'#feb24c',
	'#fd8d3c',
	'#f03b20',
	'#bd0026',
	'#FFFFFF',
	'#000000'
];

for (const color of colors) {
	const swatch = document.createElement('button');
	swatch.style.backgroundColor = color;
	swatch.addEventListener('click', () => {
		map.setPaintProperty(layer.value, 'fill-color', color);
	});
	swatches.appendChild(swatch);
}

/* Coordenadas */
map.on("click", function (e) {
	const { lng, lat } = e.lngLat;
	document.getElementById("coordenadas").innerHTML = JSON.stringify(
		lng + " , " + lat
	);
});


/* Ocultar/mostrar capas */
map.on('idle', () => {
	// Si estas dos capas no se agregaron al mapa, cancele
	if (!map.getLayer('paises') || !map.getLayer('hidrografia') || !map.getLayer('nomenclaturaVial')) {
		return;
	}

	// Listar las capas
	const toggleableLayerIds = ['paises', 'hidrografia', 'nomenclaturaVial'];

	// Configurar boton
	for (const id of toggleableLayerIds) {
		// Omitir capas que ya tienen un botón configurado
		if (document.getElementById(id)) {
			continue;
		}

		// Crear enlace
		const link = document.createElement('a');
		link.id = id;
		link.href = '#';
		link.textContent = id;
		link.className = 'active';

		// Show or hide layer when the toggle is clicked.
		link.onclick = function (e) {
			const clickedLayer = this.textContent;
			e.preventDefault();
			e.stopPropagation();

			const visibility = map.getLayoutProperty(
				clickedLayer,
				'visibility'
			);

			// Toggle layer visibility by changing the layout object's visibility property.
			if (visibility === 'visible') {
				map.setLayoutProperty(clickedLayer, 'visibility', 'none');
				this.className = '';
			} else {
				this.className = 'active';
				map.setLayoutProperty(
					clickedLayer,
					'visibility',
					'visible'
				);
			}
		};

		const layers = document.getElementById('control');
		layers.appendChild(link);
	}
});
