
app.service('AppointmentService',  function($q, $http, DSCacheFactory){
  var eventTasks=[];

    var cache =  DSCacheFactory('customerCache', {
        maxAge: 300000, // Items added to this cache expire after 15 minutes.
        cacheFlushInterval: 5000, // This cache will clear itself every hour.
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
    });


  this.refreshAppointments = function(){
    console.log( eventTasks);
    return eventTasks;
  }
  this.removeEvent = function ( eventTask ){
    console.log(eventTask );
    $http.post('/api/appointmentdelete', {_id :eventTask}).success(function(res) {
        console.log(res);
        $.each(eventTasks, function(i,item){
          if ( item.id== eventTask )
            eventTasks.splice(i);
        })
        console.log( eventTasks);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    /*
    eb.send('appointment.remove',{_id :eventTask}, function(res){
        console.log(res);
        $.each(eventTasks, function(i,item){
          if ( item.id== eventTask )
            eventTasks.splice(i);
        })
        console.log( eventTasks);
    });
    */
  };
  this.updateAppointment =function(  eventTask){
    var deferred = $q.defer();
    console.log("updateEvent=================" + eventTask.id);
    $http.post('/api/appointmentupdate', {user:eventTask.userName, events:eventTask} ).success(function(res) {
        console.log("appointment.save " + res );
        console.log("Save fired " + eventTask.id);
        return deferred.resolve(eventTask.id);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  };

  this.addAppointment = function(  eventTask){
    var deferred = $q.defer();
    var id ="";
    console.log("Add Appiointment ");
    console.log(eventTask);
    $http.post('/api/appointmentadd', {user:eventTask.userName, events:eventTask} ).success(function(res) {
        eventTask.id = res._id ; 
          console.log("Save fired " + res._id);
          id = res._id ;
          deferred.resolve(id);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  };
  this.refreshEvents = function(){
    console.log( eventTasks);
    return eventTasks;
  }
  this.getAppointmentEvents = function( loginUser, $scope){
    console.log("getAppointmentEvents " + loginUser.name );
    eventTasks =[];
    var deferred = $q.defer();
    $http.post('/api/appointmentlist', {user :loginUser.name} ).success(function(res) {
         console.log(res.appointmentlist);
        $.each(res.appointmentlist, function() {
            this.events.id = this._id ; 
            console.log('appointment.list ==' + this.events.id);
            eventTasks.push(this.events);
        })
        deferred.resolve(eventTasks);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  }

  this.getBookings = function( loginUser, $scope){
    console.log("getBookings " + loginUser.name );
    eventTasks =[];
    var deferred = $q.defer();
    $http.post('/api/appointmentlist',  {"events.parentId" : loginUser.parentId , "events.date": {"$gte": $scope.searchDate }  }).success(function(res) {
         console.log(res.appointmentlist);
        $.each(res.appointmentlist, function() {
            this.events.id = this._id ; 
            if( this.user)
              this.events.userName = this.user; 
            console.log('appointment.list ==' , this.events);
            eventTasks.push(this.events);
        })
        deferred.resolve(eventTasks);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  }
  this.getAvailableTime = function(  loginUser, parentValueId , selecteddate, $scope){
    console.log("getAvailableTime " + parentValueId );
    eventTasks =[];
    var totalTimings =[]
    var deferred = $q.defer();
    $http.post('/api/appointmentlist', {"events.parentId" :parentValueId , "events.date": {"$gte":selecteddate } } ).success(function(res) {
        console.log(res.appointmentlist);
        $.each(res.appointmentlist, function() {
            console.log(new Date(this.events.date).toLocaleTimeString());
            eventTasks.push({time : new Date(this.events.date).toLocaleTimeString() , available: "bg-danger"});
        })
        console.log($scope.customerdetails);
        var day = selecteddate.toLocaleString("en-us", { weekday: "long" }).substr(0,3)
        console.log($scope.customerdetails[day].hours);
        var hours = $scope.customerdetails[day].hours;
        var appointmentInterval = $scope.customerdetails.appointmentinterval;
        console.log(hours +":" + appointmentInterval);
        $.each(hours, function(hour,value){
            console.log( "Hour ==" + hour +":"+ value);
            if( !value ||  value =='false'){
              console.log( "----------------Hour value not valid ------------------------");
            }
            else{
              d = new Date();
              var mins =0;
              for (i = 0; i < (60/appointmentInterval) ; i++) {
                mins = i* appointmentInterval;
                d.setHours( value,mins, 00 );
                //console.log(value  +":"+ eventTasks.slice +":"+ d.toLocaleTimeString());
                var found = false ;
                angular.forEach(eventTasks, function(events){
                  //console.log(events.time);
                  
                  if ( events.time == d.toLocaleTimeString() ) {
                      found =true;
                      totalTimings.push(events);
                  }
                });
                if ( found   ){
                }
                else{
                  console.log("Adding " + d.toLocaleTimeString());
                  totalTimings.push({time : d.toLocaleTimeString() , available: "bg-success"});
                }
              }
            }
        });
        deferred.resolve(totalTimings);

    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  }

   this.getCustomer = function( parentValueId , $scope){
     var deferred = $q.defer();
     if( cache.get(parentValueId+"_C")){
          console.log("Data Coming from Cache ",parentValueId, cache.get(parentValueId+"_C") );
          deferred.resolve(cache.get(parentValueId+"_C"));
     }
     else {
      console.log("getCustomer EventBus ", parentValueId);
      $http.post('/api/customerlist', {"id" :parentValueId } ).success(function(res) {
          console.log('customer.list ='+ res);
          console.log(res);
          var sampledate = new Date();
          $.each(res, function(){
             deferred.resolve(this);
             cache.put(parentValueId+"_C", this);
             console.log(this);
             return;
          })
          deferred.resolve(res.customer);
      }).error(function( msg, code) {
        console.log('Error thrown', msg,code  );
      });
    }
    return deferred.promise;
  }


  this.getCustomerDetails = function( loginUser, parentValueId , $scope){
     var deferred = $q.defer();
     if( cache.get(parentValueId+"_CD")){
          console.log("Data for customerdetails from cache ",parentValueId, cache.get(parentValueId+"_CD") );
          $scope.customerProfileError= true;
          deferred.resolve(cache.get(parentValueId+"_CD"));
     }
     else {
      $http.post('/api/customerdetailslist', {"parentId" :parentValueId }).success(function(res) {
         console.log('customerdetails.list ='+ res);
          console.log(res);
          var sampledate = new Date();
          $.each(res.customerdetails, function(){
             deferred.resolve(this);
             cache.put(parentValueId+"_CD", this);
             $scope.customerProfileError= true;
             console.log(this);
             return;
          })
          deferred.resolve(res.customerdetails);
      }).error(function( msg, code) {
        console.log('Error thrown', msg,code  );
      });
    }
    return deferred.promise;
  }

});
