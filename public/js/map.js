/* SET GOOGLE MAP */
var point = { lat: 41.8961198, lng: -87.64831219999996 },
    markerSize = { x: 22, y: 40 };

google.maps.Marker.prototype.setLabel = function(label){
  this.label = new MarkerLabel({
    map: this.map,
    marker: this,
    text: label
  });
  this.label.bindTo('position', this, 'position');
};

var MarkerLabel = function(options) {
    this.setValues(options);
    this.span = document.createElement('span');
    this.span.className = 'map-marker-label';
};
MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
  onAdd: function() {
    this.getPanes().overlayImage.appendChild(this.span);
    var _this = this;
    this.listeners = [
    google.maps.event.addListener(this, 'position_changed', function() { _this.draw();    })];
  },
  draw: function() {
    var text = String(this.get('text')),
        position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
    this.span.innerHTML = text;
    this.span.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 10 + 'px';
    this.span.style.top = (position.y - markerSize.y + 40) + 'px';
  }
});
function initialize() {
  var myLatLng = new google.maps.LatLng(point.lat, point.lng),
      gmap = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 16,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }),
      marker = new google.maps.Marker({
        map: gmap,
        position: myLatLng,
        label: 'Tahoe Partners',
        draggable: false
    });
}
initialize();