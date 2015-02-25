/**
 * calendarDemoApp - 0.1.3
 */

app.controller('FullcalendarCtrl', ['$scope',  '$rootScope',  'CalendarService','$modal','EventBus', function($scope , $rootScope,CalendarService,  $modal, eb ) {

    console.log("FullcalendarCtrl invoked");

    console.log("Events Bus "+   $rootScope.user.name  +":"+ $rootScope.id  );
    
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    /* event source that pulls from google.com */
    $scope.eventSource = {
            className: 'gcal-event',           // an option!
            //currentTimezone: 'America/Chicago' // an option!
    };

     $scope.convertDate = function(date) {
        var dateString = "";
        var newDate = new Date(date);

        // Get the month, day, and year.
        dateString += (newDate.getMonth() + 1) + "/";
        dateString += newDate.getDate() + "/";
        dateString += newDate.getFullYear();

        return dateString;
    };
    //$scope.events =CalendarService.getCalendarEvents( eb, $rootScope.user);
    /* event source that contains custom events on the scope */
    
    $scope.events = [
      //{title:'All Day Event', start: new Date(y, m, 1), className: ['b-l b-2x b-info'], location:'New York', info:'This a all day event that will start from 9:00 am to 9:00 pm, have fun!'}
      //{title:'Game racing', start: new Date(y, m, 6, 16, 0), className: ['b-l b-2x b-info'], location:'Hongkong', info:'The most big racing of this year.'}
     /* {title:'Dance class', start: new Date(y, m, 3), end: new Date(y, m, 4, 9, 30), allDay: false, className: ['b-l b-2x b-danger'], location:'London', info:'Two days dance training class.'},
      {title:'Game racing', start: new Date(y, m, 6, 16, 0), className: ['b-l b-2x b-info'], location:'Hongkong', info:'The most big racing of this year.'},
      {title:'Soccer', start: new Date(y, m, 8, 15, 0), className: ['b-l b-2x b-info'], location:'Rio', info:'Do not forget to watch.'},
      {title:'Family', start: new Date(y, m, 9, 19, 30), end: new Date(y, m, 9, 20, 30), className: ['b-l b-2x b-success'], info:'Family party'},
      {title:'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2), className: ['bg-success bg'], location:'HD City', info:'It is a long long event'},
      {title:'Play game', start: new Date(y, m, d - 1, 16, 0), className: ['b-l b-2x b-info'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false, className: ['b-l b-2x b-primary'], location:'New York', info:'Party all day'},
      {title:'Repeating Event', start: new Date(y, m, d + 4, 16, 0), alDay: false, className: ['b-l b-2x b-warning'], location:'Home Town', info:'Repeat every day'},      
      {title:'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/', className: ['b-l b-2x b-primary']},
      {title:'Feed cat', start: new Date(y, m+1, 6, 18, 0), className: ['b-l b-2x b-info']}
      */
    ];
    var promise =CalendarService.getCalendarEvents( $rootScope.user);
      promise.then(function(events){
          events.forEach(function(event) {
             $scope.events.push(event);
          });
         $scope.eventSources =[$scope.events];
      });
    console.log($scope.events);
    /* alert on dayClick */
    $scope.precision = 400;
    $scope.lastClickTime = 0;
    $scope.alertOnEventClick = function( date, jsEvent, view ){
      var time = new Date().getTime();
      if(time - $scope.lastClickTime <= $scope.precision){
          var eventTask ={
          title: 'New Event',
          start: date,
          className: ['b-l b-2x b-info']
        };
       var promise =CalendarService.addEvent( $rootScope.user, eventTask);
        promise.then(function(events){
            console.log("CalendarService addEvent completed" + events);
            eventTask.trackById = events;
            $scope.events.push(eventTask); 
        });

      //eventTask.trackById = seq;
      
      }
      $scope.lastClickTime = time;
    };
    $scope.$watch('events.title', function(newNames, oldNames) {
        console.log("event called " );
    });

    $scope.ChangeEvent = function(event,delta){
      if (event._start!= null && event._start.hasOwnProperty("_d")){
        console.log("start _d is present");
      }
      else{
        console.log("start _d is not  present");
      }
      console.log(event);
      console.log(delta);
      var eventTask ={
          title: event.title,
          start: (event._start!= null && event._start._d!= null ? event._start._d : null),
          className: event.className,
          trackById : event.trackById,
          end : (event._end!= null && event._end._d!= null ? event._end._d : null)
      };
      $scope.alertMessage = ('Event Droped to make dayDelta ' + eventTask);
      
      
      var promise = CalendarService.updateEvent(eb.getBus(), $rootScope.user, eventTask);
      promise.then(function(){
        console.log("CalendarService updateEvent completed");
        $scope.events = CalendarService.refreshEvents();
        $scope.eventSources = [$scope.events];
      })

    }
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){


       var updatedEvent = JSON.decycle(event);
        //JSON.decycle(event));
      if( updatedEvent._end != null ){
        console.log("updatedEvent._end. is not null ");
      }
      $scope.ChangeEvent(event,delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view){
      console.log("Alert on resize");
      $scope.ChangeEvent(event,delta);
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };

    $scope.overlay = $('.fc-overlay');
    $scope.alertOnMouseOver = function( event, jsEvent, view ){
      $scope.event = event;
      $scope.overlay.removeClass('left right').find('.arrow').removeClass('left right top pull-up');
      var wrap = $(jsEvent.target).closest('.fc-event');
      var cal = wrap.closest('.calendar');
      var left = wrap.offset().left - cal.offset().left;
      var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());
      if( right > $scope.overlay.width() ) { 
        $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
      }else if ( left > $scope.overlay.width() ) {
        $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
      }else{
        $scope.overlay.find('.arrow').addClass('top');
      }
      (wrap.find('.fc-overlay').length == 0) && wrap.append( $scope.overlay );
    }

    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        dayClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventMouseover: $scope.alertOnMouseOver
      }
    };

   
    
    /* add custom event*/
    $scope.modalInstance ;
    $scope.addEvent = function() {
      $scope.modalInstance = $modal.open({
                  templateUrl: "myModalContent.html",
                  controller :"AddTaskController",
                  size: 'md'
              });
      $scope.modalInstance.result.then(function($modal) {
            var eventTask =  $modal ;
            console.log(eventTask);
            var promise = CalendarService.addEvent(eb.getBus(), $rootScope.user, eventTask);
            promise.then(function(events){
              console.log("Add event is fired" +events ); 
               eventTask.trackById =events; 
              $scope.events.push(eventTask);  
            })
            
        }, function() {
            console.info("Modal dismissed at: " + new Date)
        })['finally'](function(){
          $scope.modalInstance = undefined  // <--- This fixes
        });

    };

    /* remove event */
    $scope.remove = function(index) {
      
      var  eventTask =$scope.events[index];
      CalendarService.removeEvent(eb.getBus(), $rootScope.user, eventTask);
      $scope.events.splice(index,1);
    };

    /* Change View */
    $scope.changeView = function(view, calendar) {
      console.log(view);
      $('.calendar').fullCalendar('changeView',view);
      //uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };

    $scope.today = function(calendar) {
      console.log(calendar);
      $('.calendar').fullCalendar('today');
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];

}]);




app.controller('AddTaskController', ['$scope', '$modalInstance', '$rootScope', 'CalendarService', 
 function($scope ,  $modalInstance,$rootScope, CalendarService) {

  var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


   $scope.eventTask={
        title: '',
        start: new Date(y, m, d),
        className:  ['b-l b-2x b-primary'],
        info :'',
        location  :'',
        trackById :'',
        time :'',
      
    }
    
    $scope.ok = function() {
        
        var date = new Date($scope.eventTask.start);
        console.log($scope.eventTask);
        
        date.setHours( $scope.eventTask.time.getHours(), $scope.eventTask.time.getMinutes(),0); 
        var newDate = new Date(Date.UTC( date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()));
        console.log( "New DAte :" + newDate +":"+ $scope.eventTask.start.toISOString() );
        $scope.eventTask.start=newDate.toISOString();
        $scope.eventTask.time =''; 
        $scope.eventTask.className= [$scope.eventTask.className];

        $modalInstance.close($scope.eventTask);
  }

    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    }

}])


