var App = Em.Application.create();

App.Config = [
  { name: "Flinkster",
    calculator: 'Basic',
    pricePerKm: 19, 
    pricePerMinDrive: 3, 
    pricePerMinPark: 3
  },
  { name: "DriveNow",
    calculator: 'Basic',
    pricePerKm: 0, 
    pricePerMinDrive: 29, 
    pricePerMinPark: 10
  },
  { name: "ZebraMobil",
    calculator: 'ZebraMobil',
    pricePerKm: 0,
    pricePerKmAfter150: 10,
    pricePerMinDrive: 25,
    pricePerMinPark: 10,
    pricePerMinParkCheap: 3,
  }
];

App.Calc = Ember.Object.extend({
  config: {},
  cost: function(distance, timeDriven, timeParked) {
    return (this._calcDistance(distance) + this._calcTime(timeDriven, timeParked)) / 100;
  },
  name: function() {
    return this.get('config').name;
  }.property('name'),
  _calcDistance: function(distance) {
    return (distance * this.config.pricePerKm);
  },
  _calcTime: function(timeDriven, timeParked) {
    return (timeDriven * this.config.pricePerMinDrive) + 
      (timeParked * this.config.pricePerMinPark);
  } 
});

App.Calc.Basic = App.Calc.extend();

App.Calc.ZebraMobil = App.Calc.extend({
  _calcDistance: function(distance) {
    if (distance <= 150) { 
      return this._super(distance);
    } else {
      return this._super(150) + ((distance-150) * this.config.pricePerKmAfter150);
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
    return this._calculators().map(function(calc) {
      return { 
        name: calc.name, 
        cost: calc.cost(self.get('distance'), self.timeDriven(), self.get('timeParked'))
      };
    })
  }.property('distance', 'timeTotal', 'timeParked').cacheable(),
  
  _calculators: function() {
    return App.Config.map(function(providerConfig) {
      console.log(providerConfig);
      return App.Calc[providerConfig['calculator']].create({config: providerConfig});
    });
  }
  
  
  
});

App.ResultsView = Em.View.extend({
  resultsBinding: 'App.calcController.results'
});

App.DistanceView = SC.TextField.extend();
App.TimeTotalView = SC.TextField.extend();
App.TimeParkedView = SC.TextField.extend();