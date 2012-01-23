var App = Em.Application.create();

App.Calc = Ember.Object.extend({

  distance: null,
  timeDriven: null,
  timeParked: null,

  cost: function(distance, timeDriven, timeParked) {
    return (this._calcDistance(distance) + this._calcTime(timeDriven, timeParked)) / 100;
  },
  _calcDistance: function(distance) {
    return (distance * this.get('pricePerKm'));
  },
  _calcTime: function(timeDriven, timeParked) {
    return (timeDriven * this.get('pricePerMinDrive')) + 
      (timeParked * this.get('pricePerMinPark'));
  } 
});

// extend() makes classes and inherits
App.Calc.Flinkster = App.Calc.extend({
  name: "Flinkster",
  pricePerKm: 19,
  pricePerMinDrive: 3,
  pricePerMinPark: 3
});

App.Calc.DriveNow = App.Calc.extend({
  name: "DriveNow",
  pricePerKm: 0,
  pricePerMinDrive: 29,
  pricePerMinPark: 10
});

App.Calc.ZebraMobil = App.Calc.extend({
  name: "ZebraMobil",
  
  pricePerKm: 0,
  pricePerKmAfter150: 10,
  
  pricePerMinDrive: 25,
  
  pricePerMinPark: 10,
  pricePerMinParkCheap: 3,
  
  _calcDistance: function(distance) {
    if (distance <= 150) { 
      return this._super(distance);
    } else {
      return this._super(150) + ((distance-150) * this.get('pricePerKmAfter150'));
    }
  },
  /*
  _calcTime: function(timeDriven, timeParked) {
    var sevenHours = (7 * 60);
    if ((timeDriven + timeParked) <= sevenHours) { 
      // used car less than 7h
      return this._super(timeDriven, timeParked);
    } else {
      // wieviel parkzeit ist zu 3c/min abrechenbar
      var timeParkedCheap = (timeDriven + timeParked) - sevenHours;
      console.log(timeDriven);
      console.log(timeParked);
      console.log(timeParkedCheap);
      return ((timeDriven * this.get('pricePerMinDrive')) + 
        ((timeParked - timeParkedCheap) * this.get('pricePerMinPark')) + 
        (timeParkedCheap * this.get('pricePerMinParkCheap')) 
      );
    }
  }*/
  
});

// create() makes instances
App.calcController = Ember.Object.create({
  
  _calculators: [
    App.Calc.Flinkster,
    App.Calc.DriveNow,
    App.Calc.ZebraMobil
  ],
  
  distance: null,
  timeTotal: null,
  timeParked: null,
  timeDriven: function() {
    if (this.get('timeTotal') && this.get('timeParked')) {
      return this.get('timeTotal') - this.get('timeParked');
    }
  },
  
  results: function() {
    if (!this.get('distance') || !this.timeDriven() || !this.get('timeParked')) {
      return [];
    }
    self = this;
    return this.get('_calculators').map(function(klass) {
      var calc = klass.create();
      return { 
        name: calc.name, 
        cost: calc.cost(self.get('distance'), self.timeDriven(), self.get('timeParked'))
      };
    })
  }.property('distance', 'timeTotal', 'timeParked').cacheable()
  
});

App.ResultsView = Em.View.extend({
  resultsBinding: 'App.calcController.results'
});

App.DistanceView = SC.TextField.extend();
App.TimeTotalView = SC.TextField.extend();
App.TimeParkedView = SC.TextField.extend();