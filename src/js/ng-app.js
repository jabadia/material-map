angular.module("DemoApp", ['ngMaterial']);

angular.module("DemoApp")

    .controller("MainCtrl", function($scope, $http)
    {
        var createMap = function(mapId, topoJson)
        {
            console.log("start createmap");

            L.Icon.Default.imagePath = "http://cdn.leafletjs.com/leaflet-0.7.3/images";

            var ENABLE_ZOOM = true;

            var map = L.map(mapId, {
                center: [40.195, -3.405],
                zoom: 6,
                zoomControl: false, //ENABLE_ZOOM,
                attributionControl: false,
            });

            // if(!ENABLE_ZOOM)
            // {                
            //     map.dragging.disable();
            //     map.touchZoom.disable();
            //     map.doubleClickZoom.disable();
            //     map.scrollWheelZoom.disable();

            //     // Disable tap handler, if present.
            //     if (map.tap) map.tap.disable();
            // }

            //
            // municipios
            // 
            var addMunicipios = function()
            {
                var partidos = [
                    { sCandidaturaUnificada: 'pp',         iEscanos: 130, },
                    { sCandidaturaUnificada: 'psoe',       iEscanos: 120, },
                    { sCandidaturaUnificada: 'ciudadanos', iEscanos: 21,  },
                    { sCandidaturaUnificada: 'podemos',    iEscanos: 40,  },
                    { sCandidaturaUnificada: 'iu',         iEscanos: 6,   },
                    { sCandidaturaUnificada: 'pnv',        iEscanos: 5,   },
                    { sCandidaturaUnificada: 'upyd',       iEscanos: 2,   },
                    { sCandidaturaUnificada: 'cdc',        iEscanos: 1,   },
                    { sCandidaturaUnificada: 'amaiur',     iEscanos: 1,   },
                    { sCandidaturaUnificada: 'bildu',      iEscanos: 1,   },
                    { sCandidaturaUnificada: 'cc',         iEscanos: 1,   },
                    { sCandidaturaUnificada: 'bng',        iEscanos: 1,   },
                    { sCandidaturaUnificada: 'gbai',       iEscanos: 1,   },
                    { sCandidaturaUnificada: 'erc',        iEscanos: 1,   },
                    { sCandidaturaUnificada: 'compromis',  iEscanos: 1,   },
                    { sCandidaturaUnificada: 'fac',        iEscanos: 1,   },
                ];

                var cumsum = 0;
                _.each(partidos, function(p)
                {
                    p.cumsum = cumsum + p.iEscanos;
                    cumsum = p.cumsum;
                });

                _.each(partidos, function(p)
                {
                    p.cumsum /= cumsum;
                })

                var municipios = L.geoJson(null,
                {
                    style: function(feature)
                    {
                        var rand = Math.random();
                        var indexGanador = _.sortedIndex(partidos, {cumsum: rand}, 'cumsum');
                        feature.properties.ganador = partidos[indexGanador];
                        // console.log(rand, indexGanador, feature.properties.ganador.sCandidaturaUnificada);
                        return {
                            className: 'municipio ' + feature.properties.ganador.sCandidaturaUnificada,
                            // fillColor: color                            
                        };
                    },

                    onEachFeature: function(feature,layer)
                    {
                    /*
                        var ganador = feature.properties.independentista? "Independentista" : "No independentista";
                        var url = "#";
                        var link = "<a href='" + url + "'>Ver resultados &raquo;</a>";
                        var popupContent = [
                            "<b>" + feature.properties.NAMEUNIT + "</b>",
                            ganador,
                            "(" + feature.properties.pcIndep.toFixed(2) + "% escrutado)",
                            link
                        ];

                        // closure to keep layer and poupContent
                        (function registerEvent(layer, popupContent)
                        {
                            layer.on("click", function(e)
                            {
                                map.setView( layer.getBounds().getCenter(), map.getBoundsZoom(layer.getBounds())-0.5 );
                            })
                            layer.on("click", function(e)
                            {
                                var options = {
                                    autoPan: false,
                                    zoomAnimation: false,
                                    closeOnClick: true,
                                }
                                layer.bindPopup(popupContent.join('<br>'), options).openPopup();                                
                                $scope.$apply(function(){
                                    $scope.municipio = feature.properties;
                                });
                            });
                        })(layer, popupContent);
*/
                        layer.on("mouseover", function()
                        {
                            // console.log(feature.properties);
                            // $scope.$apply(function(){
                            //     $scope.municipio = feature.properties;
                            // });
                            layer.bringToFront();
                            // provinciasLayers.forEach(function(provinciaLayer)
                            // {
                            //     provinciaLayer.bringToFront();
                            // })
                            // layer.setStyle({ className: 'hovering' });
                        });

                        // layer.on("mouseout", function(e)
                        // {
                        //     // layer.closePopup();
                        //     layer.setStyle({ className: '' });
                        // });

                        layer.on("click", function(e)
                        {
                            console.log("click");
                            map.setView( layer.getBounds().getCenter(), map.getBoundsZoom(layer.getBounds())-0.5 );
                        });
                    
                    },
                });

                _.each(topoJson.objects, function(o)
                {
                    var ft = topojson.feature(topoJson, o);
                    if( ft.features )
                    {
                        municipios.addData(ft.features);
                    }
                    municipios.fire('ready');
                });
                municipios.addTo(map);
            }

            //
            // provincias
            // 
            var addProvincias = function()
            {
                var provincias = L.geoJson(null,
                {
                    style: function(feature)
                    {
                        return {
                            className: 'provincia',
                        };
                    },
                    onEachFeature: function(feature,layer)
                    {
                        provinciasLayers.push(layer);
                    }
                });

                _.each(topoJson.objects, function(o)
                {
                    var borders = topojson.mesh(topoJson, o, function( municipioA, municipioB )
                    {
                        var provinciaA = municipioA.properties.CodINE.substr(0,2);
                        var provinciaB = municipioB.properties.CodINE.substr(0,2);
                        // provincia = 53 = Ledanías
                        return provinciaA != provinciaB && provinciaA != '53' && provinciaB != '53';
                    });
                    if( borders )
                    {
                        provincias.addData(borders);
                    }
                    provincias.fire('ready');
                });
                provincias.addTo(map);
            }

            addMunicipios();
            // addProvincias();

            map.on('moveend', function()
            {
                var center = map.getCenter();
                var zoom   = map.getZoom();

                console.log(center,zoom);
            });

            console.log("end createmap");
        }



        $http.get('../data/resultados.json').then(function(response)
        {
            $scope.resultados = response.data;
        });

        $http.get('../data/topo_espana_provincias_10.json').then(function(response)
        {
            createMap('mapa', response.data);
        });
    });