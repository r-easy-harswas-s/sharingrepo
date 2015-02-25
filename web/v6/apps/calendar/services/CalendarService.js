
app.service('CalendarService',  function(  $q, $http){
  var eventTasks=[];

  this.removeEvent = function (    loginUser, eventTask ){
      console.log( "remove Evnet Fired "+ eb);
    console.log(loginUser);
    console.log(eventTask.trackById );
    $http.post('/api/calendarremove', {_id :eventTask.trackById} ).success(function(res) {
        $.each(eventTasks, function(){
          console.log( "Searching index " + this.trackById +":"+ eventTask.trackById);
          if ( this.trackById == eventTask.trackById){
              console.log( "Index removed " +eventTask.trackById);
             $(this).remove();
          }
        })
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
 
  };
  this.updateEvent =function(  loginUser, eventTask){
    console.log("updateEvent");
    var deferred = $q.defer();
    eventTask._id = eventTask.trackById;

    $http.post('/api/calendarupdate', {session_id:loginUser.SESSION_ID, user:loginUser.name , parentId : loginUser.parentId , events:eventTask} ).success(function(res) {
        console.log("Calendar.save " + res  );
          $.each(eventTasks, function(){
            console.log( "Searching index " + this.trackById +":"+ eventTask.trackById);
            if ( this.trackById == eventTask.trackById){
               $(this).remove();
                eventTasks.push( eventTask);
            }
          })
          return deferred.resolve(eventTask.trackById);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;

 
  };

  this.addEvent = function( loginUser, eventTask){
    var id ="";
    var deferred = $q.defer();
    $http.post('/api/calendaradd', {session_id:loginUser.SESSION_ID, user:loginUser.name , parentId : loginUser.parentId, events:eventTask}).success(function(res) {
        eventTask.trackById = res._id ; 
        console.log("Save fired " + res._id);
        //console.log(eventTask);
        id = res._id ;
        eventTasks.push( eventTask);
        return deferred.resolve(id);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    return deferred.promise;
  };
  this.refreshEvents = function(){
    console.log( eventTasks);
    return eventTasks;
  }
  this.getCalendarEvents = function( loginUser){
    //console.log("Get Calendar events :"+ $q);
    var deferred = $q.defer();
    console.log("getCalendarEvents" + loginUser.parentId );
    eventTasks =[];
    $http.post('/api/calendarlist', {parentId : loginUser.parentId} ).success(function(res) {
        $.each(res.calendarlist, function() {
          console.log(this );
          if( this.events){
              this.events.trackById = this._id ; 
              console.log(this.events);
              console.log(this.events.start.toLocaleString());
              //this.events.start=this.events.start.toLocaleString();
              eventTasks.push(this.events);
            }
        })
        console.log('returning resolved promise;;;');
        console.log(eventTasks);
        deferred.resolve(eventTasks);
    }).error(function( msg, code) {
      console.log('Error thrown', msg,code  );
    });
    console.log('returning promise;;;');
    return deferred.promise;
    
  
  }

});
